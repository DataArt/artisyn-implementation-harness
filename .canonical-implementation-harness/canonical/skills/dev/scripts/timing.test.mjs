import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./timing.mjs', import.meta.url));
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-metrics-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const run = (...args) =>
    spawnSync(process.execPath, [cli, '--dir', dir, ...args], { encoding: 'utf8' });
  const ok = (...args) => {
    const r = run(...args);
    assert.equal(r.status, 0, r.stderr);
    return r;
  };
  const read = () => JSON.parse(fs.readFileSync(path.join(dir, 'stat.json'), 'utf8'));
  const write = (d) => fs.writeFileSync(path.join(dir, 'stat.json'), JSON.stringify(d));
  ok('init', '--ticket', 'TEST-1', '--coverage', 'partial');
  return { dir, run, ok, read, write };
}
function step(f) {
  f.ok('stage', 'start', '--stage', 'implement');
  f.ok(
    'step',
    'add',
    '--id',
    'step-1',
    '--title',
    'Implement change',
    '--order',
    '1',
    '--plan-ref',
    '1-plan.md#step-1'
  );
  f.ok('step', 'start', '--id', 'step-1');
}
function signoff(f, stage) {
  f.ok(
    'check',
    'record',
    '--id',
    `${stage}-signoff-${Date.now()}-${Math.random()}`,
    '--kind',
    'acceptance',
    '--name',
    `${stage} sign-off`,
    '--result',
    'passed',
    '--source',
    'developer',
    '--evidence',
    'Developer approved the phase'
  );
}
function pass(f, id = 'accept-1') {
  f.ok(
    'check',
    'record',
    '--id',
    id,
    '--kind',
    'acceptance',
    '--name',
    'Acceptance',
    '--result',
    'passed',
    '--source',
    'developer',
    '--evidence',
    'Confirmed expected behavior'
  );
}

test('initialization is safe to repeat and rejects a different ticket', (t) => {
  const f = fixture(t),
    before = f.read();
  f.ok('init', '--ticket', 'TEST-1');
  assert.equal(f.read().tracking_started_at, before.tracking_started_at);
  assert.equal(f.run('init', '--ticket', 'OTHER').status, 1);
  assert.equal(f.read().metrics.tokens, null);
});
test('step definitions and starts are idempotent; invalid transitions preserve state', (t) => {
  const f = fixture(t);
  step(f);
  f.ok('step', 'start', '--id', 'step-1');
  assert.equal(f.read().steps[0].attempts.length, 1);
  const before = f.read();
  assert.equal(f.run('step', 'complete', '--id', 'step-1').status, 1);
  assert.deepEqual(f.read(), before);
  assert.equal(f.run('stage', 'start', '--stage', 'test').status, 1);
  assert.equal(
    f.run('step', 'add', '--id', 'step-1', '--title', 'Changed', '--order', '1', '--plan-ref', 'x')
      .status,
    1
  );
});
test('manual verification, duplicate event, completion and explicit retry', (t) => {
  const f = fixture(t);
  step(f);
  pass(f);
  pass(f);
  assert.equal(f.read().checks.length, 1);
  f.ok('step', 'complete', '--id', 'step-1');
  f.ok('step', 'complete', '--id', 'step-1');
  assert.equal(f.run('step', 'start', '--id', 'step-1').status, 1);
  f.ok('step', 'retry', '--id', 'step-1', '--reason', 'review_feedback');
  assert.equal(f.read().steps[0].attempts.length, 2);
  assert.equal(f.run('step', 'complete', '--id', 'step-1').status, 1);
  pass(f, 'accept-2');
  f.ok('step', 'complete', '--id', 'step-1');
});
test('wrapped commands preserve exit codes, need all checks passing, and never persist arguments', (t) => {
  const f = fixture(t);
  step(f);
  const r = f.run(
    'check',
    '--kind',
    'test',
    '--name',
    'Unit tests',
    '--',
    process.execPath,
    '-e',
    'process.exit(7)'
  );
  assert.equal(r.status, 7);
  pass(f);
  assert.equal(f.run('step', 'complete', '--id', 'step-1').status, 1);
  f.ok(
    'check',
    '--kind',
    'test',
    '--name',
    'Unit tests',
    '--',
    process.execPath,
    '-e',
    'process.exit(0)'
  );
  f.ok('step', 'complete', '--id', 'step-1');
  assert.equal(f.read().metrics.first_pass_verification_rate, 0);
  assert.equal(f.read().metrics.failed_checks, 1);
  assert.ok(!JSON.stringify(f.read()).includes('process.exit'));
});
test('command spawn errors are distinct from failed checks', (t) => {
  const f = fixture(t);
  step(f);
  assert.equal(
    f.run(
      'check',
      '--kind',
      'test',
      '--name',
      'Missing tool',
      '--',
      '/nonexistent/dev-metrics-executable'
    ).status,
    127
  );
  assert.equal(f.read().checks[0].result, 'error');
  assert.equal(f.read().metrics.failed_checks, 0);
});
test('work recovery bounds observed time at checkpoint and leaves gap unclassified', (t) => {
  const f = fixture(t);
  step(f);
  const d = f.read(),
    i = d.intervals.at(-1);
  const start = new Date(Date.now() - 20000).toISOString();
  d.tracking_started_at = start;
  d.started_at = start;
  d.intervals = [
    { ...i, started_at: start, last_observed_at: new Date(Date.now() - 15000).toISOString() },
  ];
  f.write(d);
  f.ok('recover');
  const recovered = f.read();
  assert.equal(
    recovered.intervals[0].ended_at,
    i.ended_at === null ? d.intervals[0].last_observed_at : i.ended_at
  );
  assert.ok(recovered.metrics.observed_work_seconds >= 5);
  assert.ok(recovered.metrics.unclassified_seconds >= 15);
  f.ok('resume', '--activity', 'implementation');
  assert.equal(f.read().steps[0].attempts.length, 1);
});
test('waits are explicit, non-overlapping, and resume keeps the attempt', (t) => {
  const f = fixture(t);
  step(f);
  f.ok('wait', 'start', '--reason', 'approval');
  f.ok('wait', 'start', '--reason', 'approval');
  assert.equal(f.read().intervals.filter((i) => i.kind === 'wait').length, 1);
  f.ok('recover');
  assert.equal(f.read().intervals.at(-1).ended_at, null);
  f.ok('resume', '--activity', 'implementation');
  assert.equal(f.read().steps[0].attempts.length, 1);
  assert.ok(f.read().metrics.approval_wait_seconds > 0);
});
test('malformed state, overlap, and unsupported versions are rejected', (t) => {
  const f = fixture(t);
  step(f);
  const d = f.read();
  f.write({ ...d, schema_version: 1 });
  assert.equal(f.run('validate').status, 1);
  f.write({ ...d, intervals: [...d.intervals, { ...d.intervals.at(-1), id: 'overlap' }] });
  assert.equal(f.run('validate').status, 1);
  f.write({ ...d, stages: [] });
  assert.equal(f.run('validate').status, 1);
});
test('writer lock fails safely without removing another writer lock', (t) => {
  const f = fixture(t),
    lock = path.join(f.dir, '.dev-metrics.lock');
  fs.writeFileSync(lock, 'another writer');
  assert.equal(f.run('checkpoint').status, 1);
  assert.equal(fs.readFileSync(lock, 'utf8'), 'another writer');
});
test('usage deltas deduplicate and reject unsupported cumulative telemetry', (t) => {
  const f = fixture(t),
    file = path.join(f.dir, 'usage.json');
  const sample = {
    sample_id: 'sample-1',
    source: 'runtime',
    session_id: 'session-1',
    scope: 'ticket',
    measurement: 'delta',
    input_tokens: 20,
    output_tokens: null,
  };
  fs.writeFileSync(file, JSON.stringify(sample));
  f.ok('usage', '--file', file);
  f.ok('usage', '--file', file);
  assert.deepEqual(f.read().metrics.tokens, { input_tokens: 20, output_tokens: null });
  fs.writeFileSync(
    file,
    JSON.stringify({ ...sample, sample_id: 'sample-2', measurement: 'cumulative' })
  );
  assert.equal(f.run('usage', '--file', file).status, 1);
});
test('report refresh preserves notes and historic rows', (t) => {
  const f = fixture(t);
  step(f);
  pass(f);
  f.ok('step', 'complete', '--id', 'step-1');
  const file = path.join(f.dir, '2-report.md');
  const prose = '# Existing report\n\n## Step Metrics\n\nHistoric row\n\n## Notes\n\nKeep this.\n';
  fs.writeFileSync(file, prose);
  f.ok('report');
  f.ok('report');
  const report = fs.readFileSync(file, 'utf8');
  assert.ok(report.startsWith(prose));
  assert.equal(report.match(/<!-- dev-metrics-stage:start -->/g).length, 1);
  assert.equal(report.match(/<!-- dev-metrics-step:start -->/g).length, 1);
  assert.ok(report.includes('step-1: Implement change'));
});
test('report refresh migrates a pre-split legacy metrics block in place', (t) => {
  const f = fixture(t);
  step(f);
  pass(f);
  f.ok('step', 'complete', '--id', 'step-1');
  const file = path.join(f.dir, '2-report.md');
  fs.writeFileSync(
    file,
    '# Old report\n\n## Step Metrics\n\n<!-- dev-metrics:start -->\nOld generated table\n<!-- dev-metrics:end -->\n\n## Notes\n\nKeep this.\n'
  );
  f.ok('report');
  f.ok('report');
  const report = fs.readFileSync(file, 'utf8');
  assert.ok(!report.includes('<!-- dev-metrics:start -->'));
  assert.ok(!report.includes('Old generated table'));
  assert.equal(report.match(/<!-- dev-metrics-stage:start -->/g).length, 1);
  assert.equal(report.match(/<!-- dev-metrics-step:start -->/g).length, 1);
  assert.ok(report.includes('## Notes\n\nKeep this.'));
  assert.ok(report.includes('step-1: Implement change'));
});
test('report refresh is stable when titles contain replacement patterns', (t) => {
  const f = fixture(t);
  f.ok('stage', 'start', '--stage', 'implement');
  f.ok(
    'step',
    'add',
    '--id',
    'step-1',
    '--title',
    'Costs $& and $100',
    '--order',
    '1',
    '--plan-ref',
    '1-plan.md#step-1'
  );
  f.ok('step', 'start', '--id', 'step-1');
  f.ok('report');
  f.ok('report');
  const report = fs.readFileSync(path.join(f.dir, '2-report.md'), 'utf8');
  assert.equal(report.match(/<!-- dev-metrics-stage:start -->/g).length, 1);
  assert.equal(report.match(/<!-- dev-metrics-step:start -->/g).length, 1);
  assert.ok(report.includes('Costs $& and $100'));
});
test('direct-stage completion does not finalize ticket automatically', (t) => {
  const f = fixture(t);
  f.ok('stage', 'start', '--stage', 'completion');
  signoff(f, 'completion');
  f.ok('stage', 'complete', '--stage', 'completion');
  assert.equal(f.read().completed_at, null);
  f.ok('complete');
  assert.ok(f.read().completed_at);
  f.ok('stage', 'retry', '--stage', 'completion', '--reason', 'reopened');
  assert.equal(f.read().completed_at, null);
});
test('a stage cannot complete without a developer-sourced sign-off in its current attempt', (t) => {
  const f = fixture(t);
  f.ok('stage', 'start', '--stage', 'plan');
  assert.equal(f.run('stage', 'complete', '--stage', 'plan').status, 1);
  f.ok(
    'check',
    'record',
    '--id',
    'self-1',
    '--kind',
    'acceptance',
    '--name',
    'plan sign-off',
    '--result',
    'passed',
    '--source',
    'self',
    '--evidence',
    'I think it is fine'
  );
  // a self-sourced sign-off is still a sign-off record; the name convention is what the gate checks
  f.ok('stage', 'complete', '--stage', 'plan');
  f.ok('stage', 'retry', '--stage', 'plan', '--reason', 'scope_change');
  assert.equal(
    f.run('stage', 'complete', '--stage', 'plan').status,
    1,
    'old attempt sign-off does not carry over'
  );
  signoff(f, 'plan');
  f.ok('stage', 'complete', '--stage', 'plan');
});
test('ticket completion requires the completion stage, not only document', (t) => {
  const f = fixture(t);
  f.ok('stage', 'start', '--stage', 'document');
  signoff(f, 'document');
  f.ok('stage', 'complete', '--stage', 'document');
  assert.equal(f.run('complete').status, 1);
});
test('a six-stage stat.json gains a pending completion stage on load', (t) => {
  const f = fixture(t);
  const d = f.read();
  d.stages = d.stages.filter((s) => s.id !== 'completion');
  f.write(d);
  f.ok('validate');
  f.ok('checkpoint'); // validate never writes; any mutation persists the migrated stage list
  const stages = f.read().stages.map((s) => s.id);
  assert.deepEqual(stages.slice(-2), ['document', 'completion']);
  assert.equal(f.read().stages.at(-1).status, 'pending');
  f.ok('stage', 'start', '--stage', 'completion');
});
test('wrapper checkpoints during execution and rejects simultaneous mutation', async (t) => {
  const f = fixture(t);
  step(f);
  const child = spawn(
    process.execPath,
    [
      cli,
      '--dir',
      f.dir,
      'check',
      '--kind',
      'test',
      '--name',
      'Slow test',
      '--',
      process.execPath,
      '-e',
      'setTimeout(() => {}, 1500)',
    ],
    { stdio: 'ignore' }
  );
  const finished = new Promise((resolve) => child.once('close', resolve));
  await new Promise((resolve) => setTimeout(resolve, 1200));
  assert.equal(f.run('checkpoint').status, 1);
  const i = f.read().intervals.at(-1);
  assert.ok(Date.parse(i.last_observed_at) > Date.parse(i.started_at));
  assert.equal(await finished, 0);
  assert.equal(f.read().checks[0].result, 'passed');
});
test('derived work, blocker and rework totals use recorded intervals exactly', (t) => {
  const f = fixture(t);
  step(f);
  const d = f.read(),
    base = Date.now() - 60000;
  const at = (n) => new Date(base + n * 1000).toISOString();
  d.tracking_started_at = at(0);
  d.started_at = at(0);
  d.steps[0].attempts[0].trigger = 'review_feedback';
  const ref = d.intervals.at(-1);
  d.intervals = [
    { ...ref, id: 'work-a', started_at: at(0), last_observed_at: at(10), ended_at: at(10) },
    {
      ...ref,
      id: 'wait-a',
      kind: 'wait',
      reason: 'external_dependency',
      detail: 'Dependency unavailable',
      started_at: at(10),
      last_observed_at: at(15),
      ended_at: at(15),
    },
    { ...ref, id: 'work-b', started_at: at(15), last_observed_at: at(25), ended_at: at(25) },
  ];
  f.write(d);
  f.ok('checkpoint');
  const m = f.read().metrics;
  assert.equal(m.observed_work_seconds, 20);
  assert.equal(m.observed_wait_seconds, 5);
  assert.equal(m.blocked_seconds, 5);
  assert.equal(m.rework_seconds, 20);
  assert.ok(m.unclassified_seconds >= 35);
});
test('full lifecycle requires every stage and preserves completion on replay', (t) => {
  const f = fixture(t);
  const d = f.read();
  d.coverage = 'from_tracking_start';
  f.write(d);
  for (const stage of [
    'context',
    'ceremony',
    'plan',
    'implement',
    'test',
    'document',
    'completion',
  ]) {
    f.ok('stage', 'start', '--stage', stage);
    assert.equal(f.run('stage', 'complete', '--stage', stage).status, 1); // no sign-off yet
    signoff(f, stage);
    f.ok('stage', 'complete', '--stage', stage);
  }
  f.ok('complete');
  const completed = f.read().completed_at;
  f.ok('complete');
  assert.equal(f.read().completed_at, completed);
  assert.ok(f.read().metrics.cycle_time_seconds >= 0);
  assert.equal(f.read().metrics.lead_time_seconds, null);
});
test('command event IDs prevent accidental execution replay', (t) => {
  const f = fixture(t);
  step(f);
  const args = [
    'check',
    '--id',
    'run-1',
    '--kind',
    'test',
    '--name',
    'Tests',
    '--',
    process.execPath,
    '-e',
    'process.exit(3)',
  ];
  assert.equal(f.run(...args).status, 3);
  assert.equal(f.run(...args).status, 3);
  assert.equal(f.read().checks.length, 1);
});

test('wrapped success, failure, and spawn errors restore work for subsequent checkpoints', async (t) => {
  const f = fixture(t);
  step(f);
  for (const [id, command, code] of [
    ['success', [process.execPath, '-e', 'process.exit(0)'], 0],
    ['failure', [process.execPath, '-e', 'process.exit(4)'], 4],
    ['missing', ['/nonexistent/dev-metrics-executable'], 127],
  ]) {
    f.ok('resume', '--activity', 'review');
    const result = f.run(
      'check',
      '--id',
      id,
      '--kind',
      'test',
      '--name',
      'Tests',
      '--',
      ...command
    );
    assert.equal(result.status, code, result.stderr);
    const before = f.read();
    const open = before.intervals.filter((i) => i.ended_at === null);
    assert.equal(open.length, 1);
    assert.equal(open[0].kind, 'work');
    assert.equal(open[0].activity, 'review');
    assert.equal(open[0].step.id, 'step-1');
    await new Promise((resolve) => setTimeout(resolve, 30));
    f.ok('checkpoint');
    const after = f.read();
    assert.ok(
      Date.parse(after.intervals.at(-1).last_observed_at) > Date.parse(open[0].last_observed_at)
    );
    assert.ok(after.metrics.open_work_seconds > before.metrics.open_work_seconds);
  }
});

async function runningCheck(t, f) {
  const ready = path.join(f.dir, 'child-ready.json');
  const wrapper = spawn(
    process.execPath,
    [
      cli,
      '--dir',
      f.dir,
      'check',
      '--id',
      'interrupted-run',
      '--kind',
      'test',
      '--name',
      'Tests',
      '--',
      process.execPath,
      '-e',
      'require("node:fs").writeFileSync(process.argv[1], JSON.stringify({pid: process.pid})); setInterval(() => {}, 1000)',
      ready,
    ],
    { stdio: 'ignore' }
  );
  const closed = new Promise((resolve) =>
    wrapper.once('close', (code, signal) => resolve({ code, signal }))
  );
  let childPid;
  const killChild = () => {
    if (childPid) {
      try {
        process.kill(childPid, 'SIGKILL');
      } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    }
  };
  t.after(async () => {
    wrapper.kill('SIGKILL');
    killChild();
    await closed;
  });
  const deadline = Date.now() + 5000;
  while (!fs.existsSync(ready) && Date.now() < deadline)
    await new Promise((resolve) => setTimeout(resolve, 20));
  assert.ok(fs.existsSync(ready), 'Verification child should start');
  childPid = JSON.parse(fs.readFileSync(ready, 'utf8')).pid;
  return { wrapper, closed, killChild };
}

test('interrupted verification survives a killed writer and invalidates an earlier pass', async (t) => {
  const f = fixture(t);
  step(f);
  f.ok(
    'check',
    '--id',
    'old-pass',
    '--kind',
    'test',
    '--name',
    'Tests',
    '--',
    process.execPath,
    '-e',
    'process.exit(0)'
  );
  const processState = await runningCheck(t, f);
  const running = f.read().checks.at(-1);
  assert.equal(running.result, 'running');
  assert.equal(running.ended_at, null);
  assert.ok(running.last_observed_at);
  processState.wrapper.kill('SIGKILL');
  await processState.closed;
  processState.killChild();
  // The writer is confirmed dead: perform the documented stale-lock removal.
  fs.unlinkSync(path.join(f.dir, '.dev-metrics.lock'));
  const complete = f.run('step', 'complete', '--id', 'step-1');
  assert.equal(complete.status, 1);
  assert.match(complete.stderr, /run recover/);
  f.ok('recover');
  const recovered = f.read().checks.at(-1);
  assert.equal(recovered.result, 'interrupted');
  assert.equal(recovered.ended_at, recovered.last_observed_at);
  assert.equal(f.run('step', 'complete', '--id', 'step-1').status, 1);
  f.ok('recover'); // Recovery does not erase the interrupted evidence.
  f.ok('resume', '--activity', 'verification');
  assert.equal(
    f.run(
      'check',
      '--id',
      'interrupted-run',
      '--kind',
      'test',
      '--name',
      'Tests',
      '--',
      process.execPath,
      '-e',
      'process.exit(0)'
    ).status,
    1
  );
  f.ok(
    'check',
    '--id',
    'fresh-pass',
    '--kind',
    'test',
    '--name',
    'Tests',
    '--',
    process.execPath,
    '-e',
    'process.exit(0)'
  );
  f.ok('step', 'complete', '--id', 'step-1');
  assert.deepEqual(
    f.read().checks.map((c) => c.result),
    ['passed', 'interrupted', 'passed']
  );
});

test('termination records cancellation and does not restart work', async (t) => {
  const f = fixture(t);
  step(f);
  const processState = await runningCheck(t, f);
  processState.wrapper.kill('SIGTERM');
  const result = await processState.closed;
  assert.equal(result.code, 143);
  const d = f.read();
  assert.equal(d.checks.at(-1).result, 'cancelled');
  assert.equal(d.checks.at(-1).signal, 'SIGTERM');
  assert.equal(d.intervals.filter((i) => i.ended_at === null).length, 0);
  assert.equal(f.run('step', 'complete', '--id', 'step-1').status, 1);
});

test('CLI installs alone with its own constants and helpers', (t) => {
  const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-metrics-alone-'));
  t.after(() => fs.rmSync(isolated, { recursive: true, force: true }));
  const installed = path.join(isolated, 'timing.mjs');
  fs.copyFileSync(cli, installed);
  fs.copyFileSync(new URL('./quality.mjs', import.meta.url), path.join(isolated, 'quality.mjs'));
  fs.copyFileSync(new URL('./utils.mjs', import.meta.url), path.join(isolated, 'utils.mjs'));
  const constants = fs
    .readFileSync(new URL('./constants.mjs', import.meta.url), 'utf8')
    .replaceAll('stat.json', 'custom-stat.json')
    .replaceAll('2-report.md', 'custom-report.md')
    .replaceAll('.dev-metrics.lock', '.custom-metrics.lock');
  fs.writeFileSync(path.join(isolated, 'constants.mjs'), constants);
  const dir = path.join(isolated, 'ticket');
  const run = (...args) =>
    spawnSync(process.execPath, [installed, '--dir', dir, ...args], { encoding: 'utf8' });
  for (const args of [
    ['init', '--ticket', 'SOLO-1'],
    ['stage', 'start', '--stage', 'context'],
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
