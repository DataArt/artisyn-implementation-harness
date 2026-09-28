#!/usr/bin/env node
/** Verify recorded final output hashes before removing installation-only INTENT copies.
 * Evidence is supplied by the orchestrator after semantic verification; this script
 * checks integrity and cleanup, not the truth of natural-language claims.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { sha256, pruneEmptyAncestors } from './lib/fs-safe.mjs';
import { parseArgs } from './lib/cli.mjs';
import { RUN_ID_RE, RUNTIME_TOKEN_RE } from './lib/constants.mjs';

/** Resolve `relative` under `root` one path segment at a time, rejecting a
 * traversal segment or a symlink anywhere along the way. Unlike the
 * materializer's `relativeFile`, this never follows a real symlink to its
 * target — every path here identifies an already-materialized output, so a
 * symlink appearing on it now (rather than at plan/write time) is itself the
 * anomaly to reject, not something to resolve through.
 */
function resolveGuardedPath(root, relative) {
  if (
    typeof relative !== 'string' ||
    path.isAbsolute(relative) ||
    relative.includes('\\') ||
    relative.split('/').some((s) => !s || s === '.' || s === '..')
  )
    throw new Error('Unsafe output path');
  let current = root;
  for (const segment of relative.split('/')) {
    current = path.join(current, segment);
    try {
      if (fs.lstatSync(current).isSymbolicLink())
        throw new Error('Finalization paths cannot contain symlinks');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return current;
}

function loadMaterializedReceipt(root, packageRelative, runId) {
  const receiptPath = resolveGuardedPath(
    root,
    `${packageRelative}/state/launch/runs/${runId}/materialization.json`
  );
  return JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
}

function assertEvidenceMatchesRun(evidence, receipt, runId) {
  if (
    receipt.run_id !== runId ||
    receipt.status !== 'materialized' ||
    evidence.plan_sha256 !== receipt.plan_sha256
  )
    throw new Error('Evidence must match a materialized run');
  if (
    !Array.isArray(evidence.outputs) ||
    !Array.isArray(evidence.checks) ||
    !evidence.checks.length ||
    evidence.checks.some(
      (c) => c.status !== 'passed' || typeof c.evidence !== 'string' || !c.evidence.trim()
    )
  )
    throw new Error('Final audit checks with evidence are required');
  if (new Set(evidence.outputs.map((e) => e.target)).size !== evidence.outputs.length)
    throw new Error('Duplicate output evidence');
}

function makeOutputPathGuard(root, packageRelative) {
  return (target) => {
    if (
      target === packageRelative ||
      target.startsWith(packageRelative + '/') ||
      target === '.git' ||
      target.startsWith('.git/')
    )
      throw new Error('Output cannot modify package or git metadata');
    return resolveGuardedPath(root, target);
  };
}

/** Every permanent output (materialized files minus temporary INTENT copies,
 * plus every reserved derived output) must have matching, non-stale evidence.
 */
function verifyOutputEvidence(receipt, evidence, outputPath) {
  const outputs = [...receipt.files.filter((e) => !e.temporary_intent), ...receipt.derived_outputs];
  if (evidence.outputs.length !== outputs.length)
    throw new Error('Final evidence must cover exactly the permanent outputs');
  for (const output of outputs) {
    const check = evidence.outputs.find((e) => e.target === output.target);
    const bytes = fs.readFileSync(outputPath(output.target));
    if (
      !check ||
      check.status !== 'verified' ||
      typeof check.evidence !== 'string' ||
      !check.evidence.trim() ||
      check.sha256 !== sha256(bytes)
    )
      throw new Error(`Missing or stale final evidence: ${output.target}`);
    const tokens = bytes.toString('utf8').match(RUNTIME_TOKEN_RE) ?? [];
    if (tokens.some((token) => !(check.runtime_tokens ?? []).includes(token)))
      throw new Error(`Unresolved tokens in ${output.target}`);
  }
  return outputs;
}

/** Temporary INTENT copies are the only thing this script ever deletes, and
 * only once confirmed unchanged since they were written (a missing copy is
 * tolerated, so retrying an interrupted cleanup is safe).
 */
function verifyCleanupIntegrity(cleanup, outputPath) {
  for (const item of cleanup) {
    if (path.basename(item.target) !== 'INTENT.md') throw new Error('Refusing non-INTENT cleanup');
    const file = outputPath(item.target);
    if (fs.existsSync(file) && sha256(fs.readFileSync(file)) !== item.materialized_sha256)
      throw new Error(`INTENT changed: ${item.target}`);
  }
}

function performCleanup(cleanup, outputPath, root) {
  for (const item of cleanup) {
    const file = outputPath(item.target);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      pruneEmptyAncestors(root, file);
    }
  }
}

function writeVerificationReceipt(destination, result) {
  const temp = path.join(path.dirname(destination), `.verification-${crypto.randomUUID()}`);
  fs.writeFileSync(temp, JSON.stringify(result, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  fs.renameSync(temp, destination);
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    modeFlags: ['--check', '--write'],
    options: ['--root', '--package', '--run', '--evidence'],
    defaults: {
      root: process.cwd(),
      package: path.dirname(path.dirname(fileURLToPath(import.meta.url))),
    },
  });
  if (!args.mode || !RUN_ID_RE.test(args.run ?? '') || !args.evidence)
    throw new Error(
      'Usage: finalize-launch.mjs --run ID --evidence FILE [--root ROOT] [--package PACKAGE] (--check | --write)'
    );
  const root = fs.realpathSync(args.root);
  const pkg = fs.realpathSync(args.package);
  const packageRelative = path.relative(root, pkg).split(path.sep).join('/');
  resolveGuardedPath(root, packageRelative);
  const receipt = loadMaterializedReceipt(root, packageRelative, args.run);
  const evidence = JSON.parse(fs.readFileSync(args.evidence, 'utf8'));
  assertEvidenceMatchesRun(evidence, receipt, args.run);

  const outputPath = makeOutputPathGuard(root, packageRelative);
  const outputs = verifyOutputEvidence(receipt, evidence, outputPath);
  const cleanup = receipt.files.filter((e) => e.temporary_intent);
  verifyCleanupIntegrity(cleanup, outputPath);

  const result = {
    schema_version: 1,
    run_id: args.run,
    plan_sha256: receipt.plan_sha256,
    status: 'verified',
    outputs: evidence.outputs,
    checks: evidence.checks,
    removed_intents: cleanup.map((e) => e.target),
  };
  if (args.mode === '--write') {
    performCleanup(cleanup, outputPath, root);
    writeVerificationReceipt(
      resolveGuardedPath(
        root,
        `${packageRelative}/state/launch/runs/${args.run}/verification.json`
      ),
      result
    );
  }
  console.log(
    JSON.stringify({
      status: args.mode === '--check' ? 'checked' : 'verified',
      outputs: outputs.length,
      intents: cleanup.length,
      writes: args.mode === '--write',
    })
  );
}

try {
  main();
} catch (error) {
  console.error(`Launch finalization failed: ${error.message}`);
  process.exitCode = 1;
}
