import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { deriveQuality } from './quality.mjs';

const header = `## Review Findings

| ID | Stage | Origin | Kind | Deviation type | Severity | Classification | Finding | Evidence | Resolution | TD | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;
const issue =
  '| RF-001 | test | pr-review; hld-audit | deviation | contradiction | high | introduced | Wrong backup default | infra/main.tf; HLD/Reliability.md | tech-debt | TD-1 | User approved deferral, 2026-09-14; fix backup policy |\n';
const debt = `
## Tech Debt

| # | Description | Type | Tracker | Finding | Owner | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| TD-1 | Correct backup | cleanup | — | RF-001 | Infra owner | Set local redundancy |
`;
const tests = `
## Test Results

| Project | Written | Passed | Failed | Skipped | Evidence |
| --- | --- | --- | --- | --- | --- |
| infra-unit | 3 | 8 | 0 | 1 | runner.json; git diff |
`;
const report = header + issue + debt + tests;

test('one issue seen in two reviews counts once with independent dimensions and linked debt', () => {
  const q = deriveQuality(report, [
    { kind: 'test', result: 'failed' },
    { kind: 'test', result: 'passed' },
    { kind: 'build', result: 'failed' },
  ]);
  assert.equal(q.findings.total, 1);
  assert.equal(q.findings.pr_review.total, 1);
  assert.equal(q.findings.deviations_by_type.contradiction, 1);
  assert.equal(q.findings.by_severity.high, 1);
  assert.equal(q.findings.by_resolution['tech-debt'], 1);
  assert.deepEqual(q.tech_debt, { total: 1, ticketed: 0, unticketed: 1 });
  assert.deepEqual(q.tests, { written: 3, passed: 8, failed: 0, skipped: 1, scopes: 1 });
  assert.equal(q.test_runs.failed, 1);
  assert.deepEqual(q.closure_issues, []);
});

test('old report evidence remains unknown; observed empty ledger is not missing ledger', () => {
  const legacy = deriveQuality(
    '## PR Review\n\nNo findings — LGTM.\n\n## Test Results\n\n| Project | Tests |\n| --- | --- |\n| app | ✅ |\n'
  );
  assert.equal(legacy.findings, null);
  assert.equal(legacy.tests, null);
  assert.equal(legacy.tech_debt, null);
  const empty = deriveQuality(header);
  assert.equal(empty.findings.total, 0);
  assert.equal(empty.tests, null);
});

test('unknown test scope prevents misleading partial aggregate; explicit zero is retained', () => {
  const q = deriveQuality(
    report + '| second-suite | 0 | unavailable | unavailable | — | diff reviewed |\n'
  );
  assert.equal(q.tests.written, 3);
  assert.equal(q.tests.failed, null);
  assert.equal(q.tests.passed, null);
});

test('invalid and duplicate records fail instead of corrupting quality counts', () => {
  for (const text of [
    header + issue + issue + debt,
    report.replace('| high |', '| Must fix |'),
    report.replace('| contradiction |', '| typo |'),
    report.replace('pr-review; hld-audit', 'pr-review; pr-review'),
    report.replace('Wrong backup default', 'Wrong | backup default'),
    report.replace('| 3 | 8 |', '| -1 | 8 |'),
    report.replace('runner.json; git diff', '—'),
    report + header,
    report.replace('RF-001 | Infra owner', 'RF-099 | Infra owner'),
  ])
    assert.throws(() => deriveQuality(text), /Quality:/);
});

test('escaped pipes, comments and fenced examples do not add findings', () => {
  const q = deriveQuality(
    report.replace('Wrong backup default', 'Wrong backup \\| default') +
      '\n<!--\n' +
      header +
      issue +
      '\n-->\n```markdown\n' +
      header +
      issue +
      '```\n'
  );
  assert.equal(q.findings.total, 1);
});

test('open findings and unsupported terminal resolutions cannot pass structural closure', () => {
  assert.match(
    deriveQuality(report.replace('| tech-debt |', '| open |')).closure_issues.join(),
    /RF-001: open/
  );
  assert.match(
    deriveQuality(report.replace('| Infra owner |', '| — |')).closure_issues.join(),
    /owner/
  );
  assert.match(
    deriveQuality(
      report.replace('User approved deferral, 2026-09-14; fix backup policy', '—')
    ).closure_issues.join(),
    /missing resolution/
  );
});

test('CLI report is idempotent, preserves prose, persists summary, and blocks invalid closure', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-quality-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const cli = fileURLToPath(new URL('./timing.mjs', import.meta.url));
  const run = (...args) =>
    spawnSync(process.execPath, [cli, ...args, '--dir', dir], { encoding: 'utf8' });
  const ok = (...args) => {
    const r = run(...args);
    assert.equal(r.status, 0, r.stderr);
  };
  ok('init', '--ticket', 'LOCAL-1', '--coverage', 'partial');
  fs.writeFileSync(path.join(dir, '2-report.md'), '# Preserve me\n\n' + report);
  ok('report');
  const state = () => JSON.parse(fs.readFileSync(path.join(dir, 'stat.json')));
  const original = state().quality;
  ok('report');
  const refreshed = state().quality;
  assert.equal(refreshed.source_sha256, original.source_sha256);
  assert.deepEqual(refreshed.findings, original.findings);
  assert.equal(
    fs.readFileSync(path.join(dir, '2-report.md'), 'utf8').match(/Quality \(recorded inventory\)/g)
      .length,
    1
  );
  assert.ok(fs.readFileSync(path.join(dir, '2-report.md'), 'utf8').startsWith('# Preserve me'));
  ok('quality', 'validate');
  fs.writeFileSync(path.join(dir, '2-report.md'), report.replace('| tech-debt |', '| open |'));
  assert.equal(run('quality', 'validate').status, 1);
  fs.writeFileSync(path.join(dir, '2-report.md'), report.replace('| 3 | 8 | 0 |', '| 3 | 8 | 2 |'));
  assert.equal(run('quality', 'validate').status, 1);
  const before = fs.readFileSync(path.join(dir, 'stat.json'), 'utf8');
  fs.writeFileSync(path.join(dir, '2-report.md'), header + issue + issue + debt);
  assert.equal(run('report').status, 1);
  assert.equal(fs.readFileSync(path.join(dir, 'stat.json'), 'utf8'), before);
});

test('a failing scope blocks closure even when another scope has unknown case counts', () => {
  const q = deriveQuality(
    report.replace('| 3 | 8 | 0 |', '| 3 | 8 | 2 |') +
      '| second-suite | 0 | unavailable | unavailable | — | diff |\n'
  );
  assert.equal(q.tests.failed, null);
  assert.match(q.closure_issues.join(), /latest test case failures remain/);
});

test('additional tables cannot silently hide findings', () => {
  assert.throws(
    () => deriveQuality(header + issue + header.replace('## Review Findings', '') + issue),
    /multiple tables/
  );
});
