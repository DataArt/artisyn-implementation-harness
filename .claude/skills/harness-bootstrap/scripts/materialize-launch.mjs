#!/usr/bin/env node
/** Validate a launch JSON plan and deterministically materialize declared files.
 * Node standard library only. --check performs whole-plan preflight without writes.
 * Receipts track materialization, never INTENT derivation or launch completion.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest, renderItem, providerText } from './provider-adapter.mjs';
import {
  sha256,
  isWithin,
  resolveExisting,
  relativeFile,
  atomicWrite,
  currentBytes,
  hashOrNull,
} from './lib/fs-safe.mjs';
import { applyReplacements, unresolvedTokens } from './lib/tokens.mjs';
import { parseArgs } from './lib/cli.mjs';
import { RUN_ID_RE, SHA256_RE } from './lib/constants.mjs';

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// Every file a provider-tagged plan re-renders again at materialize time, and
// so must have its exact bytes frozen when the plan was built. Kept in sync
// with plan-provider-launch.mjs's own ADAPTER_SOURCES list.
const requiredAdapterSources = (manifest) => [
  'canonical/manifest.json',
  `canonical/${manifest.canonical.settings}`,
  `canonical/${manifest.canonical.mcp}`,
  'scripts/provider-adapter.mjs',
  'scripts/lib/manifest.mjs',
  'scripts/lib/agent-format.mjs',
  'scripts/lib/mcp-config.mjs',
];

function assertPlanShape(plan) {
  if (
    !isPlainObject(plan) ||
    plan.schema_version !== 1 ||
    typeof plan.run_id !== 'string' ||
    !RUN_ID_RE.test(plan.run_id)
  )
    throw new Error('Expected schema_version 1 and a simple run_id');
  if (
    !isPlainObject(plan.knowns) ||
    !Array.isArray(plan.files) ||
    !Array.isArray(plan.derived_outputs ?? []) ||
    !(plan.files.length + (plan.derived_outputs?.length ?? 0))
  )
    throw new Error('Expected knowns object and nonempty files or derived_outputs array');
}

function parseKnowns(plan) {
  const knowns = new Map();
  for (const [key, entry] of Object.entries(plan.knowns)) {
    if (
      !/^[A-Z][A-Z0-9_]*$/.test(key) ||
      !isPlainObject(entry) ||
      !['verified', 'confirmed'].includes(entry.status) ||
      typeof entry.value !== 'string' ||
      !entry.source
    )
      throw new Error(
        `Known needs a string value, evidence source, and verified/confirmed status: ${key}`
      );
    knowns.set(key, entry.value);
  }
  return knowns;
}

/** When any file entry is provider-tagged, load and validate the manifest, and
 * confirm every required adapter input's bytes still match what the plan froze
 * — the guarantee that materializing renders exactly what was reviewed.
 */
function verifyProviderAdapterSources(plan, canonical) {
  if (!plan.files.some((item) => item.provider)) return undefined;
  const manifest = loadManifest(canonical);
  const required = requiredAdapterSources(manifest);
  if (
    !Array.isArray(plan.adapter_sources) ||
    required.some((source) => !plan.adapter_sources.some((entry) => entry.source === source))
  )
    throw new Error('Provider plans must freeze manifest, configuration and adapter hashes');
  for (const entry of plan.adapter_sources)
    if (sha256(fs.readFileSync(relativeFile(canonical, entry.source))) !== entry.sha256)
      throw new Error(`Adapter input changed: ${entry.source}`);
  if (
    !Array.isArray(plan.providers) ||
    plan.providers.some((provider) => !Object.hasOwn(manifest.providers, provider))
  )
    throw new Error('Invalid selected providers');
  return manifest;
}

/** A target cannot land inside the canonical package, `.git`, or the
 * package's own `.harness` — those are read from and reasoned about, never
 * written to by a plan.
 */
function assertNotProtectedOutput(canonical, root, target) {
  if (
    isWithin(canonical, target) ||
    isWithin(resolveExisting(path.join(root, '.git')), target) ||
    isWithin(resolveExisting(path.join(root, '.harness')), target)
  )
    throw new Error('Output cannot modify canonical package, git metadata, or harness metadata');
}

function assertNoTargetCollision(targets, target, label) {
  if (targets.some((t) => isWithin(t, target) || isWithin(target, t)))
    throw new Error(`Output collision: ${label}`);
  targets.push(target);
}

function assertValidExpectedHash(expected) {
  if (expected !== null && (typeof expected !== 'string' || !SHA256_RE.test(expected)))
    throw new Error('Invalid expected_target_sha256');
}

/** Validate one plan file entry, apply its declared token replacements and
 * provider rendering, and confirm the result matches what's already on disk
 * (a fresh target, an unchanged prior write, or an explicitly reviewed hash).
 * Returns the prepared write, deferred until `--write` actually applies it.
 */
function prepareFileEntry(item, { root, canonical, knowns, manifest, targets }) {
  if (!isPlainObject(item)) throw new Error('File entry must be an object');
  const source = relativeFile(canonical, item.source);
  const target = relativeFile(root, item.target);
  assertNotProtectedOutput(canonical, root, target);
  assertNoTargetCollision(targets, target, item.target);
  if (
    !['skills', 'agents', 'docs', 'canonical'].includes(
      path.relative(canonical, source).split(path.sep)[0]
    )
  )
    throw new Error('Only files under the package canonical/ root may be materialized');
  if (
    item.temporary_intent &&
    (path.basename(item.source) !== 'INTENT.md' || path.basename(item.target) !== 'INTENT.md')
  )
    throw new Error('Temporary INTENT must be an INTENT.md copy');
  const data = fs.readFileSync(source);
  if (sha256(data) !== item.source_sha256)
    throw new Error(`Canonical source changed: ${item.source}`);
  if (!Object.hasOwn(item, 'expected_target_sha256'))
    throw new Error('Declare expected_target_sha256 (null for a new file)');
  const expected = item.expected_target_sha256;
  assertValidExpectedHash(expected);
  if (item.intent != null && !fs.statSync(relativeFile(canonical, item.intent)).isFile())
    throw new Error(`Missing INTENT: ${item.intent}`);
  const actions = item.derive ?? [];
  if (!Array.isArray(actions) || actions.some((a) => !isPlainObject(a) || !a.rule || !a.action))
    throw new Error('Each derivation needs its INTENT rule and planned action');
  if (actions.length && item.intent == null)
    throw new Error('INTENT derivation requires an intent path');
  const replacements = item.replacements ?? {};
  const preserve = item.preserve_tokens ?? [];
  if (
    !isPlainObject(replacements) ||
    !Array.isArray(preserve) ||
    preserve.some((t) => typeof t !== 'string')
  )
    throw new Error('Invalid replacements or preserve_tokens');
  let text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(data);
  if (item.provider) text = providerText(text, item.provider, manifest);
  // A single pass never interprets a replacement value as further tokens.
  text = applyReplacements(text, replacements, preserve, knowns, item.source);
  const unresolved = unresolvedTokens(text, preserve);
  if (unresolved.length)
    throw new Error(
      `Undeclared remaining tokens in ${item.source}: ${unresolved.sort().join(', ')}`
    );
  text = renderItem(text, item, canonical, manifest, true);
  const output = Buffer.from(text);
  const current = currentBytes(target);
  const observed = hashOrNull(current);
  if (!current?.equals(output) && observed !== expected)
    throw new Error(`Unexpected local content: ${item.target}; review and update the plan`);
  return { item, target, output, observed };
}

function prepareDerivedEntry(item, { root, canonical, targets }) {
  if (
    !isPlainObject(item) ||
    typeof item.rule !== 'string' ||
    !item.rule.trim() ||
    !Array.isArray(item.inputs) ||
    item.inputs.some((input) => typeof input !== 'string')
  )
    throw new Error('Derived outputs need target, expected_target_sha256, rule, and inputs');
  const target = relativeFile(root, item.target);
  assertNotProtectedOutput(canonical, root, target);
  assertNoTargetCollision(targets, target, item.target);
  if (
    !Object.hasOwn(item, 'expected_target_sha256') ||
    (item.expected_target_sha256 !== null &&
      (typeof item.expected_target_sha256 !== 'string' ||
        !SHA256_RE.test(item.expected_target_sha256)))
  )
    throw new Error('Invalid derived expected_target_sha256');
  if (hashOrNull(currentBytes(target)) !== item.expected_target_sha256)
    throw new Error(`Unexpected local content: ${item.target}; review and update the plan`);
  // Inputs may refer to future materialized or derived outputs; existence is
  // checked by orchestration when it actually performs each derivation.
  for (const input of item.inputs) relativeFile(root, input);
}

function prepare(plan, root, canonical) {
  assertPlanShape(plan);
  const knowns = parseKnowns(plan);
  const manifest = verifyProviderAdapterSources(plan, canonical);
  const targets = [];
  const prepared = plan.files.map((item) => {
    if (item.provider && !plan.providers?.includes(item.provider))
      throw new Error('File provider is not selected');
    return prepareFileEntry(item, { root, canonical, knowns, manifest, targets });
  });
  for (const item of plan.derived_outputs ?? [])
    prepareDerivedEntry(item, { root, canonical, targets });
  return prepared;
}

/** The receipt path is itself a materialized-state path: reject any symlink
 * along it rather than following one into an unexpected location.
 */
function computeReceiptPath(root, canonical, runId) {
  let receiptPath = root;
  for (const part of [
    ...path.relative(root, canonical).split(path.sep),
    'state',
    'launch',
    'runs',
    runId,
    'materialization.json',
  ]) {
    receiptPath = path.join(receiptPath, part);
    try {
      if (fs.lstatSync(receiptPath).isSymbolicLink())
        throw new Error(`Receipt path cannot contain symlinks: ${receiptPath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return receiptPath;
}

function loadOrInitReceipt(receiptPath, plan, planSha256) {
  if (fs.existsSync(path.join(path.dirname(receiptPath), 'verification.json')))
    throw new Error('Run already verified; use a new linked run for changes');
  const receipt = {
    schema_version: 1,
    run_id: plan.run_id,
    plan_sha256: planSha256,
    status: 'materializing',
    files: [],
    providers: plan.providers ?? [],
    derived_outputs: (plan.derived_outputs ?? []).map((item) => ({ ...item, status: 'pending' })),
  };
  if (fs.existsSync(receiptPath)) {
    const previous = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    if (previous.plan_sha256 !== receipt.plan_sha256)
      throw new Error('Run ID already belongs to a different plan; use a new run ID');
    if (!Array.isArray(previous.files)) throw new Error('Invalid existing materialization receipt');
    receipt.files = previous.files;
  }
  return receipt;
}

function materializeFiles(prepared, root, receipt, save) {
  for (const { item, target, output, observed } of prepared) {
    if (relativeFile(root, item.target) !== target)
      throw new Error(`Output path changed after preflight: ${item.target}`);
    const current = currentBytes(target);
    if (hashOrNull(current) !== observed)
      throw new Error(`Output changed after preflight: ${item.target}`);
    if (!current?.equals(output)) atomicWrite(target, output);
    if (!fs.readFileSync(target).equals(output))
      throw new Error(`Write verification failed: ${item.target}`);
    const prior = receipt.files.find((entry) => entry.target === item.target);
    if (prior) {
      if (
        prior.source !== item.source ||
        prior.materialized_sha256 !== sha256(output) ||
        prior.status !== 'materialized'
      )
        throw new Error(`Existing receipt entry conflicts with plan: ${item.target}`);
    } else
      receipt.files.push({
        source: item.source,
        target: item.target,
        temporary_intent: item.temporary_intent === true,
        intent: item.intent ?? null,
        provider: item.provider ?? null,
        before_sha256: observed,
        materialized_sha256: sha256(output),
        status: 'materialized',
        derivation: item.derive?.length ? 'pending' : 'not-required',
      });
    save();
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    modeFlags: ['--check', '--write'],
    options: ['--plan', '--root', '--package'],
    defaults: {
      root: process.cwd(),
      package: path.dirname(path.dirname(fileURLToPath(import.meta.url))),
    },
  });
  if (!args.plan || !args.mode)
    throw new Error(
      'Usage: materialize-launch.mjs --plan PLAN [--root ROOT] [--package PACKAGE] (--check | --write)'
    );
  const root = fs.realpathSync(args.root);
  const canonical = fs.realpathSync(args.package);
  if (!isWithin(root, canonical) || canonical === root)
    throw new Error('Package must be a directory within the project root');
  const planBytes = fs.readFileSync(args.plan);
  const plan = JSON.parse(planBytes.toString('utf8'));
  const prepared = prepare(plan, root, canonical);
  const receiptPath = computeReceiptPath(root, canonical, plan.run_id);
  const receipt = loadOrInitReceipt(receiptPath, plan, sha256(planBytes));

  if (args.mode === '--check') {
    console.log(
      JSON.stringify({
        status: 'checked',
        files: prepared.length,
        derived_outputs: plan.derived_outputs?.length ?? 0,
        writes: false,
      })
    );
    return;
  }
  const save = () => atomicWrite(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  save();
  try {
    materializeFiles(prepared, root, receipt, save);
    receipt.status = 'materialized';
    save();
  } catch (error) {
    receipt.status = 'partial';
    receipt.error = error.message;
    save();
    throw error;
  }
  console.log(
    JSON.stringify({ status: receipt.status, files: prepared.length, receipt: receiptPath })
  );
}

try {
  main();
} catch (error) {
  console.error(`Launch materialization failed: ${error.message}`);
  process.exitCode = 1;
}
