import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./design-metrics.mjs', import.meta.url));
const stages = [
  'frame',
  'research',
  'evaluate',
  'solution',
  'review-gate',
  'address-feedback',
  'publish',
];
function fixture(t, partial = false) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'design-metrics-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const run = (...args) =>
    spawnSync(process.execPath, [cli, '--dir', dir, ...args], { encoding: 'utf8' });
  const ok = (...args) => {
    const r = run(...args);
    assert.equal(r.status, 0, r.stderr);
    return r;
  };
  const read = () => JSON.parse(fs.readFileSync(path.join(dir, 'stat.json'), 'utf8'));
  ok('init', '--ticket', 'DESIGN-1', ...(partial ? ['--coverage', 'partial'] : []));
  return { dir, run, ok, read };
}
function approval(f, id, result = 'passed') {
  f.ok(
    'check',
    'record',
    '--id',
    id,
    '--kind',
    'acceptance',
    '--name',
    'Design approval',
    '--result',
    result,
    '--source',
    'developer',
    '--evidence',
    'Observed MR decision'
  );
}
function reachReview(f) {
  for (const stage of stages.slice(0, 4)) {
    f.ok('stage', 'start', '--stage', stage);
    f.ok('stage', 'complete', '--stage', stage);
  }
  f.ok('stage', 'start', '--stage', 'review-gate');
}
test('design initializes seven stages, isolates lifecycle, and rejects implementation steps', (t) => {
  const f = fixture(t);
  assert.deepEqual(
    f.read().stages.map((s) => s.id),
    stages
  );
  assert.equal(f.read().lifecycle, 'design');
  assert.equal(f.run('stage', 'start', '--stage', 'implement').status, 1);
  assert.equal(f.run('step', 'add', '--id', 'x').status, 1);
  const file = path.join(f.dir, 'stat.json');
  const before = fs.readFileSync(file, 'utf8');
  const d = f.read();
  d.lifecycle = 'dev';
  fs.writeFileSync(file, JSON.stringify(d));
  assert.equal(f.run('validate').status, 1);
  fs.writeFileSync(file, before);
});
test('full design survives approval wait and completes with a justified feedback skip', (t) => {
  const f = fixture(t);
  reachReview(f);
  f.ok('wait', 'start', '--reason', 'approval', '--detail', 'MR review');
  f.ok('recover');
  assert.equal(f.read().intervals.at(-1).ended_at, null);
  f.ok('resume', '--activity', 'review');
  assert.equal(
    f.run(
      'stage',
      'skip',
      '--stage',
      'address-feedback',
      '--reason',
      'no_concerns',
      '--evidence',
      'MR approved'
    ).status,
    1
  );
  approval(f, 'gate-1');
  f.ok(
    'stage',
    'skip',
    '--stage',
    'address-feedback',
    '--reason',
    'no_concerns',
    '--evidence',
    'MR approved'
  );
  f.ok('stage', 'complete', '--stage', 'review-gate');
  f.ok('stage', 'start', '--stage', 'publish');
  f.ok('stage', 'complete', '--stage', 'publish');
  f.ok('complete');
  assert.ok(f.read().completed_at);
  const feedback = f.read().stages.find((s) => s.id === 'address-feedback');
  assert.equal(feedback.status, 'skipped');
  assert.equal(feedback.attempts.length, 0);
  assert.equal(f.read().metrics.first_pass_verification_rate, 1);
});
test('feedback retries invalidate old approval and count as rework', (t) => {
  const f = fixture(t);
  reachReview(f);
  approval(f, 'gate-1', 'failed');
  f.ok('stage', 'complete', '--stage', 'review-gate');
  f.ok('stage', 'start', '--stage', 'address-feedback');
  assert.equal(
    f.read().stages.find((s) => s.id === 'address-feedback').attempts[0].trigger,
    'review_feedback'
  );
  approval(f, 'feedback-1');
  f.ok('stage', 'retry', '--stage', 'address-feedback', '--reason', 'review_feedback');
  f.ok('stage', 'complete', '--stage', 'address-feedback');
  f.ok('stage', 'start', '--stage', 'publish');
  assert.equal(f.run('stage', 'complete', '--stage', 'publish').status, 1);
  approval(f, 'feedback-2');
  f.ok('stage', 'complete', '--stage', 'publish');
  f.ok('complete');
  assert.ok(f.read().metrics.rework_seconds > 0);
});
test('reopening a gate restores skipped feedback and clears completion', (t) => {
  const f = fixture(t, true);
  f.ok('stage', 'start', '--stage', 'review-gate');
  approval(f, 'gate-1');
  f.ok(
    'stage',
    'skip',
    '--stage',
    'address-feedback',
    '--reason',
    'no_concerns',
    '--evidence',
    'Approved'
  );
  f.ok('stage', 'complete', '--stage', 'review-gate');
  f.ok('stage', 'start', '--stage', 'publish');
  f.ok('stage', 'complete', '--stage', 'publish');
  f.ok('complete');
  f.ok('stage', 'retry', '--stage', 'review-gate', '--reason', 'scope_change');
  const d = f.read();
  assert.equal(d.completed_at, null);
  assert.equal(d.stages.find((s) => s.id === 'publish').status, 'pending');
  const feedback = d.stages.find((s) => s.id === 'address-feedback');
  assert.equal(feedback.status, 'pending');
  assert.equal(feedback.skip_history.length, 1);
  assert.equal(
    f.run(
      'stage',
      'skip',
      '--stage',
      'address-feedback',
      '--reason',
      'no_concerns',
      '--evidence',
      'Approved'
    ).status,
    1
  );
});
test('partial publish requires observed approval and does not invent earlier work', (t) => {
  const f = fixture(t, true);
  f.ok('stage', 'start', '--stage', 'publish');
  assert.equal(f.run('stage', 'complete', '--stage', 'publish').status, 1);
  approval(f, 'direct-approval');
  f.ok('stage', 'complete', '--stage', 'publish');
  assert.equal(f.read().completed_at, null);
  f.ok('complete');
  assert.equal(f.read().stages[0].status, 'pending');
});
test('reports contain stage rows and preserve design state and gate notes', (t) => {
  const f = fixture(t);
  f.ok('stage', 'start', '--stage', 'frame');
  const file = path.join(f.dir, 'Report.md');
  const notes = '# Design\n\n## State\ncurrent_stage: frame\n\n## Gate\nApproved: pending\n';
  fs.writeFileSync(file, notes);
  f.ok('report');
  f.ok('report');
  const report = fs.readFileSync(file, 'utf8');
  assert.ok(report.startsWith(notes));
  assert.ok(report.includes('## Stage Metrics'));
  assert.ok(report.includes('frame (active)'));
  assert.ok(report.includes('publish (pending)'));
  assert.equal(report.match(/<!-- design-metrics:start -->/g).length, 1);
  assert.equal(fs.existsSync(path.join(f.dir, '2-report.md')), false);
});

test('report refresh migrates legacy dev metrics markers in place', (t) => {
  const f = fixture(t);
  f.ok('stage', 'start', '--stage', 'frame');
  const file = path.join(f.dir, 'Report.md');
  fs.writeFileSync(
    file,
    '# Design\n\n## Stage Metrics\n\n<!-- dev-metrics:start -->\nOld totals\n<!-- dev-metrics:end -->\n\n## Gate\nApproved: pending\n'
  );
  f.ok('report');
  f.ok('report');
  const report = fs.readFileSync(file, 'utf8');
  assert.equal(report.match(/## Stage Metrics/g).length, 1);
  assert.equal(report.match(/<!-- design-metrics:start -->/g).length, 1);
  assert.equal(report.match(/<!-- dev-metrics:start -->/g), null);
  assert.ok(!report.includes('Old totals'));
  assert.ok(report.includes('## Gate\nApproved: pending'));
});
test('failed executable checks block publication despite approval and restore work', (t) => {
  const f = fixture(t, true);
  f.ok('stage', 'start', '--stage', 'publish');
  approval(f, 'approval');
  assert.equal(
    f.run(
      'check',
      '--kind',
      'test',
      '--name',
      'Docs',
      '--',
      process.execPath,
      '-e',
      'process.exit(2)'
    ).status,
    2
  );
  assert.equal(f.read().intervals.at(-1).activity, 'documentation');
  assert.equal(f.run('stage', 'complete', '--stage', 'publish').status, 1);
  f.ok(
    'check',
    '--kind',
    'test',
    '--name',
    'Docs',
    '--',
    process.execPath,
    '-e',
    'process.exit(0)'
  );
  f.ok('stage', 'complete', '--stage', 'publish');
  f.ok('complete');
});

test('CLI installs alone with its own constants and helpers', (t) => {
  const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'design-metrics-alone-'));
  t.after(() => fs.rmSync(isolated, { recursive: true, force: true }));
  const installed = path.join(isolated, 'design-metrics.mjs');
  fs.copyFileSync(cli, installed);
  fs.copyFileSync(new URL('./utils.mjs', import.meta.url), path.join(isolated, 'utils.mjs'));
  const constants = fs
    .readFileSync(new URL('./constants.mjs', import.meta.url), 'utf8')
    .replaceAll('stat.json', 'custom-stat.json')
    .replaceAll('Report.md', 'custom-report.md')
    .replaceAll('.design-metrics.lock', '.custom-metrics.lock');
  fs.writeFileSync(path.join(isolated, 'constants.mjs'), constants);
  const dir = path.join(isolated, 'ticket');
  const run = (...args) =>
    spawnSync(process.execPath, [installed, '--dir', dir, ...args], { encoding: 'utf8' });
  for (const args of [
    ['init', '--ticket', 'SOLO-1'],
    ['stage', 'start', '--stage', 'frame'],
    ['report'],
  ]) {
    const result = run(...args);
    assert.equal(result.status, 0, result.stderr);
  }
  assert.ok(fs.existsSync(path.join(dir, 'custom-stat.json')));
  assert.ok(
    fs
      .readFileSync(path.join(dir, 'custom-report.md'), 'utf8')
      .includes('[custom-stat.json](custom-stat.json)')
  );
  fs.writeFileSync(path.join(dir, '.custom-metrics.lock'), 'occupied');
  assert.equal(run('checkpoint').status, 1);
});
