#!/usr/bin/env node
/** Exercise materialization in an isolated fake project; no real harness writes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const script = fileURLToPath(new URL('./materialize-launch.mjs', import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-copy-test-'));
const canonical = path.join(root, 'package');
const source = path.join(canonical, 'skills/demo/TEMPLATE.md');
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex');
let count = 0;
try {
  fs.mkdirSync(path.dirname(source), { recursive: true });
  fs.writeFileSync(source, 'Project {{PROJECT_KEY}}; ticket <TICKET>\n');
  fs.writeFileSync(
    path.join(path.dirname(source), 'INTENT.md'),
    'Adapt scope from project evidence.\n'
  );
  const plan = {
    schema_version: 1,
    run_id: 'test',
    knowns: { PROJECT_KEY: { value: 'FLR', status: 'verified', source: 'AGENTS.md' } },
    files: [
      {
        source: 'skills/demo/TEMPLATE.md',
        source_sha256: sha(fs.readFileSync(source)),
        target: 'output/demo.md',
        expected_target_sha256: null,
        intent: 'skills/demo/INTENT.md',
        replacements: { '{{PROJECT_KEY}}': 'PROJECT_KEY' },
        preserve_tokens: [],
        derive: [{ rule: 'Scope', action: 'Describe actual layer' }],
      },
    ],
  };
  const planFile = path.join(root, 'plan.json');
  function run(value, mode = '--check', success = true) {
    fs.writeFileSync(planFile, JSON.stringify(value));
    const result = spawnSync(
      process.execPath,
      [script, '--root', root, '--package', canonical, '--plan', planFile, mode],
      { encoding: 'utf8' }
    );
    assert.equal(result.status === 0, success, result.stderr + result.stdout);
    count++;
    return result;
  }
  run(plan);
  assert(!fs.existsSync(path.join(root, 'output')) && !fs.existsSync(path.join(root, '.harness')));
  run(plan, '--write');
  const target = path.join(root, 'output/demo.md');
  assert.equal(fs.readFileSync(target, 'utf8'), 'Project FLR; ticket <TICKET>\n');
  const receipt = JSON.parse(
    fs.readFileSync(path.join(root, '.harness/launch/runs/test/materialization.json'), 'utf8')
  );
  assert.equal(receipt.status, 'materialized');
  assert.equal(receipt.files[0].derivation, 'pending');
  run(plan, '--write');
  const receiptFile = path.join(root, '.harness/launch/runs/test/materialization.json');
  assert.deepEqual(JSON.parse(fs.readFileSync(receiptFile, 'utf8')).files, receipt.files);
  // Resuming a partial receipt retains completed entries and their original evidence.
  fs.writeFileSync(
    receiptFile,
    JSON.stringify({ ...receipt, status: 'partial', error: 'interrupted' })
  );
  run(plan, '--write');
  assert.deepEqual(JSON.parse(fs.readFileSync(receiptFile, 'utf8')).files, receipt.files);
  fs.writeFileSync(target, 'local customization');
  run(plan, '--write', false);
  assert.equal(fs.readFileSync(target, 'utf8'), 'local customization');
  for (const mutate of [
    (p) => {
      p.files[0].target = '../escape.md';
    },
    (p) => {
      p.files[0].target = 'package/skills/demo/TEMPLATE.md';
    },
    (p) => {
      p.files[0].source_sha256 = '0'.repeat(64);
    },
    (p) => {
      p.files[0].replacements = {};
    },
    (p) => {
      p.files.push({ ...p.files[0] });
    },
    (p) => {
      p.knowns.PROJECT_KEY.status = 'proposed';
    },
    (p) => {
      p.files[0].target = '.git/config';
    },
    (p) => {
      p.files[0].preserve_tokens = ['{{PROJECT_KEY}}'];
    },
  ]) {
    const value = structuredClone(plan);
    mutate(value);
    run(value, '--write', false);
  }
  const conflict = structuredClone(plan);
  conflict.files.unshift({ ...conflict.files[0], target: 'output/new.md' });
  run(conflict, '--write', false);
  assert(!fs.existsSync(path.join(root, 'output/new.md')));
  // Collision validation must be reached before a local-content conflict.
  const collision = structuredClone(plan);
  collision.files[0].target = 'fresh';
  collision.files.push({ ...collision.files[0], target: 'fresh/child' });
  assert.match(run(collision, '--write', false).stderr, /Output collision/);
  // A replacement value containing another token stays literal after one pass.
  const exact = structuredClone(plan);
  exact.run_id = 'exact';
  exact.files[0].target = 'output/exact.md';
  exact.knowns.PROJECT_KEY.value = '$& {{OTHER}}';
  exact.files[0].preserve_tokens = ['{{OTHER}}'];
  run(exact, '--write');
  assert.equal(
    fs.readFileSync(path.join(root, 'output/exact.md'), 'utf8'),
    'Project $& {{OTHER}}; ticket <TICKET>\n'
  );
  const reused = structuredClone(exact);
  reused.knowns.PROJECT_KEY.source = 'changed evidence';
  assert.match(run(reused, '--check', false).stderr, /different plan/);
  // Existing symlinks cannot route outputs into canonical files.
  fs.symlinkSync(path.dirname(source), path.join(root, 'canonical-link'), 'dir');
  const linked = structuredClone(plan);
  linked.files[0].target = 'canonical-link/new.md';
  run(linked, '--write', false);
  assert(!fs.existsSync(path.join(path.dirname(source), 'new.md')));
  // Receipt paths are contained too, including symlinked state directories.
  const outside = path.join(root, 'outside');
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(root, '.harness/launch/runs/escaped'), 'dir');
  const escaped = structuredClone(exact);
  escaped.run_id = 'escaped';
  run(escaped, '--write', false);
  assert.deepEqual(fs.readdirSync(outside), []);
  fs.symlinkSync(
    path.dirname(source),
    path.join(root, '.harness/launch/runs/canonical-receipt'),
    'dir'
  );
  const redirected = structuredClone(exact);
  redirected.run_id = 'canonical-receipt';
  assert.match(run(redirected, '--write', false).stderr, /Receipt path cannot contain symlinks/);
  assert(!fs.existsSync(path.join(path.dirname(source), 'materialization.json')));
  const gitMetadata = path.join(root, 'git-metadata');
  fs.mkdirSync(gitMetadata);
  fs.symlinkSync(gitMetadata, path.join(root, '.git'), 'dir');
  const gitAlias = structuredClone(exact);
  gitAlias.run_id = 'git-alias';
  gitAlias.files[0].target = 'git-metadata/config';
  assert.match(run(gitAlias, '--write', false).stderr, /git metadata/);
  const derivedGit = {
    schema_version: 1,
    run_id: 'derived-git',
    knowns: {},
    files: [],
    derived_outputs: [
      { target: 'git-metadata/config', expected_target_sha256: null, rule: 'Example', inputs: [] },
    ],
  };
  assert.match(run(derivedGit, '--write', false).stderr, /git metadata/);
  assert.deepEqual(fs.readdirSync(gitMetadata), []);
  const harnessOutput = structuredClone(exact);
  harnessOutput.run_id = 'metadata';
  harnessOutput.files[0].target = '.harness/launch/answers.json';
  assert.match(run(harnessOutput, '--write', false).stderr, /harness metadata/);
  const harnessDerived = structuredClone(derivedGit);
  harnessDerived.run_id = 'derived-metadata';
  harnessDerived.derived_outputs[0].target = '.harness/launch/answers.json';
  assert.match(run(harnessDerived, '--write', false).stderr, /harness metadata/);
  assert(!fs.existsSync(path.join(canonical, 'state')));

  // Preserve UTF-8 BOM bytes, matching the source decoder's behavior.
  fs.writeFileSync(source, '\uFEFFProject {{PROJECT_KEY}}\n');
  const bom = structuredClone(plan);
  bom.run_id = 'bom';
  bom.files[0].source_sha256 = sha(fs.readFileSync(source));
  bom.files[0].target = 'output/bom.md';
  run(bom, '--write');
  assert.equal(fs.readFileSync(path.join(root, 'output/bom.md'), 'utf8'), '\uFEFFProject FLR\n');
  const derived = {
    schema_version: 1,
    run_id: 'derived',
    knowns: {},
    files: [],
    derived_outputs: [
      {
        target: 'generated.md',
        expected_target_sha256: null,
        rule: 'Summarize repository evidence',
        inputs: ['output/bom.md', 'future.md'],
      },
    ],
  };
  run(derived);
  run(derived, '--write');
  assert(!fs.existsSync(path.join(root, 'generated.md')));
  const derivedReceipt = JSON.parse(
    fs.readFileSync(path.join(root, '.harness/launch/runs/derived/materialization.json'), 'utf8')
  );
  assert.equal(derivedReceipt.derived_outputs[0].status, 'pending');
  const duplicate = structuredClone(derived);
  duplicate.derived_outputs.push({ ...duplicate.derived_outputs[0] });
  assert.match(run(duplicate, '--write', false).stderr, /Output collision/);
  const unsafe = structuredClone(derived);
  unsafe.derived_outputs[0].inputs = ['../outside'];
  run(unsafe, '--write', false);
  fs.writeFileSync(path.join(root, 'generated.md'), 'local content');
  run(derived, '--write', false);
  fs.writeFileSync(source, Buffer.from([0xff]));
  bom.run_id = 'invalid';
  bom.files[0].source_sha256 = sha(fs.readFileSync(source));
  run(bom, '--write', false);
  console.log(`${count} materialization checks passed (isolated project).`);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
