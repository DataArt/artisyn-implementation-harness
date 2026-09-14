#!/usr/bin/env node
/** Validate a launch JSON plan and deterministically materialize declared files.
 * Node standard library only. --check performs whole-plan preflight without writes.
 * Receipts track materialization, never INTENT derivation or launch completion.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const within = (root, file) =>
  file === root ||
  (!path.relative(root, file).startsWith(`..${path.sep}`) &&
    path.relative(root, file) !== '..' &&
    !path.isAbsolute(path.relative(root, file)));
function resolveExisting(file) {
  try {
    return fs.realpathSync(file);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // Reject dangling links rather than treating them as missing output files.
    if (fs.existsSync(path.dirname(file))) {
      try {
        if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`Dangling symlink: ${file}`);
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    const parent = path.dirname(file);
    if (parent === file) throw error;
    return path.join(resolveExisting(parent), path.basename(file));
  }
}
function relativeFile(root, value) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('\\') ||
    value.includes('\0') ||
    path.isAbsolute(value) ||
    value.split('/').some((p) => ['', '.', '..'].includes(p))
  )
    throw new Error(`Unsafe relative path: ${value}`);
  const resolved = resolveExisting(path.join(root, value));
  if (!within(root, resolved)) throw new Error(`Path escapes root: ${value}`);
  return resolved;
}
function atomicWrite(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = path.join(path.dirname(file), `.launch-${crypto.randomUUID()}`);
  try {
    fs.writeFileSync(temporary, data, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
const currentBytes = (file) => (fs.existsSync(file) ? fs.readFileSync(file) : null);
const hashOrNull = (bytes) => (bytes === null ? null : sha(bytes));
function prepare(plan, root, canonical) {
  if (
    !object(plan) ||
    plan.schema_version !== 1 ||
    typeof plan.run_id !== 'string' ||
    !/^[a-zA-Z0-9_-]+$/.test(plan.run_id)
  )
    throw new Error('Expected schema_version 1 and a simple run_id');
  if (
    !object(plan.knowns) ||
    !Array.isArray(plan.files) ||
    !Array.isArray(plan.derived_outputs ?? []) ||
    !(plan.files.length + (plan.derived_outputs?.length ?? 0))
  )
    throw new Error('Expected knowns object and nonempty files or derived_outputs array');
  const knowns = new Map();
  for (const [key, entry] of Object.entries(plan.knowns)) {
    if (
      !/^[A-Z][A-Z0-9_]*$/.test(key) ||
      !object(entry) ||
      !['verified', 'confirmed'].includes(entry.status) ||
      typeof entry.value !== 'string' ||
      !entry.source
    )
      throw new Error(
        `Known needs a string value, evidence source, and verified/confirmed status: ${key}`
      );
    knowns.set(key, entry.value);
  }
  const targets = [];
  const prepared = plan.files.map((item) => {
    if (!object(item)) throw new Error('File entry must be an object');
    const source = relativeFile(canonical, item.source);
    const target = relativeFile(root, item.target);
    if (
      within(canonical, target) ||
      within(resolveExisting(path.join(root, '.git')), target) ||
      within(resolveExisting(path.join(root, '.harness')), target)
    )
      throw new Error('Output cannot modify canonical package, git metadata, or harness metadata');
    if (targets.some((t) => within(t, target) || within(target, t)))
      throw new Error(`Output collision: ${item.target}`);
    targets.push(target);
    if (
      !['skills', 'agents', 'docs', 'workflows'].includes(
        path.relative(canonical, source).split(path.sep)[0]
      )
    )
      throw new Error(
        'Only declared canonical skills, agents, docs, and workflows may be materialized'
      );
    const data = fs.readFileSync(source);
    if (sha(data) !== item.source_sha256)
      throw new Error(`Canonical source changed: ${item.source}`);
    if (!Object.hasOwn(item, 'expected_target_sha256'))
      throw new Error('Declare expected_target_sha256 (null for a new file)');
    const expected = item.expected_target_sha256;
    if (expected !== null && (typeof expected !== 'string' || !/^[a-f0-9]{64}$/.test(expected)))
      throw new Error('Invalid expected_target_sha256');
    if (item.intent != null && !fs.statSync(relativeFile(canonical, item.intent)).isFile())
      throw new Error(`Missing INTENT: ${item.intent}`);
    const actions = item.derive ?? [];
    if (!Array.isArray(actions) || actions.some((a) => !object(a) || !a.rule || !a.action))
      throw new Error('Each derivation needs its INTENT rule and planned action');
    if (actions.length && item.intent == null)
      throw new Error('INTENT derivation requires an intent path');
    const replacements = item.replacements ?? {};
    const preserve = item.preserve_tokens ?? [];
    if (
      !object(replacements) ||
      !Array.isArray(preserve) ||
      preserve.some((t) => typeof t !== 'string')
    )
      throw new Error('Invalid replacements or preserve_tokens');
    let text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(data);
    for (const [token, key] of Object.entries(replacements)) {
      if (!/^\{\{[A-Z][A-Z0-9_]*\}\}$/.test(token) || !knowns.has(key) || !text.includes(token))
        throw new Error(`Invalid/missing replacement ${token} in ${item.source}`);
      if (preserve.includes(token)) throw new Error('A token cannot be replaced and preserved');
    }
    // A single pass never interprets replacement values as additional rules.
    text = text.replace(/\{\{[A-Z][A-Z0-9_]*\}\}/g, (token) =>
      Object.hasOwn(replacements, token) ? knowns.get(replacements[token]) : token
    );
    const unresolved = [...new Set(text.match(/\{\{[A-Z][A-Z0-9_]*\}\}/g) ?? [])].filter(
      (t) => !preserve.includes(t)
    );
    if (unresolved.length)
      throw new Error(
        `Undeclared remaining tokens in ${item.source}: ${unresolved.sort().join(', ')}`
      );
    const output = Buffer.from(text);
    const current = currentBytes(target);
    const observed = hashOrNull(current);
    if (!current?.equals(output) && observed !== expected)
      throw new Error(`Unexpected local content: ${item.target}; review and update the plan`);
    return { item, target, output, observed };
  });
  for (const item of plan.derived_outputs ?? []) {
    if (
      !object(item) ||
      typeof item.rule !== 'string' ||
      !item.rule.trim() ||
      !Array.isArray(item.inputs) ||
      item.inputs.some((input) => typeof input !== 'string')
    )
      throw new Error('Derived outputs need target, expected_target_sha256, rule, and inputs');
    const target = relativeFile(root, item.target);
    if (
      within(canonical, target) ||
      within(resolveExisting(path.join(root, '.git')), target) ||
      within(resolveExisting(path.join(root, '.harness')), target)
    )
      throw new Error('Output cannot modify canonical package, git metadata, or harness metadata');
    if (targets.some((t) => within(t, target) || within(target, t)))
      throw new Error(`Output collision: ${item.target}`);
    targets.push(target);
    if (
      !Object.hasOwn(item, 'expected_target_sha256') ||
      (item.expected_target_sha256 !== null &&
        (typeof item.expected_target_sha256 !== 'string' ||
          !/^[a-f0-9]{64}$/.test(item.expected_target_sha256)))
    )
      throw new Error('Invalid derived expected_target_sha256');
    if (hashOrNull(currentBytes(target)) !== item.expected_target_sha256)
      throw new Error(`Unexpected local content: ${item.target}; review and update the plan`);
    for (const input of item.inputs) relativeFile(root, input);
  }
  // Inputs may refer to future materialized or derived outputs; existence is
  // checked by orchestration when it actually performs each derivation.
  return prepared;
}
function main() {
  const args = {
    root: process.cwd(),
    package: path.dirname(path.dirname(fileURLToPath(import.meta.url))),
  };
  for (let i = 2; i < process.argv.length; i++) {
    const option = process.argv[i];
    if (['--check', '--write'].includes(option)) {
      if (args.mode) throw new Error('Choose exactly one of --check or --write');
      args.mode = option;
    } else if (
      ['--plan', '--root', '--package'].includes(option) &&
      process.argv[i + 1] &&
      !process.argv[i + 1].startsWith('--')
    )
      args[option.slice(2)] = process.argv[++i];
    else throw new Error(`Unknown or incomplete argument: ${option}`);
  }
  if (!args.plan || !args.mode)
    throw new Error(
      'Usage: materialize-launch.mjs --plan PLAN [--root ROOT] [--package PACKAGE] (--check | --write)'
    );
  const root = fs.realpathSync(args.root),
    canonical = fs.realpathSync(args.package);
  const planBytes = fs.readFileSync(args.plan),
    plan = JSON.parse(planBytes.toString('utf8'));
  const prepared = prepare(plan, root, canonical);
  // State paths must not redirect receipt writes into canonical content.
  let receiptPath = root;
  for (const part of ['.harness', 'launch', 'runs', plan.run_id, 'materialization.json']) {
    receiptPath = path.join(receiptPath, part);
    try {
      if (fs.lstatSync(receiptPath).isSymbolicLink())
        throw new Error(`Receipt path cannot contain symlinks: ${receiptPath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const receipt = {
    schema_version: 1,
    run_id: plan.run_id,
    plan_sha256: sha(planBytes),
    status: 'materializing',
    files: [],
    derived_outputs: (plan.derived_outputs ?? []).map((item) => ({ ...item, status: 'pending' })),
  };
  if (fs.existsSync(receiptPath)) {
    const previous = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    if (previous.plan_sha256 !== receipt.plan_sha256)
      throw new Error('Run ID already belongs to a different plan; use a new run ID');
    if (!Array.isArray(previous.files)) throw new Error('Invalid existing materialization receipt');
    receipt.files = previous.files;
  }
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
          prior.materialized_sha256 !== sha(output) ||
          prior.status !== 'materialized'
        )
          throw new Error(`Existing receipt entry conflicts with plan: ${item.target}`);
      } else
        receipt.files.push({
          source: item.source,
          target: item.target,
          before_sha256: observed,
          materialized_sha256: sha(output),
          status: 'materialized',
          derivation: item.derive?.length ? 'pending' : 'not-required',
        });
      save();
    }
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
