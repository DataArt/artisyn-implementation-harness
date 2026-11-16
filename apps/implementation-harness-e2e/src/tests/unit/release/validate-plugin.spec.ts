/** The strict plugin validation wrapper: errors and unexpected warnings fail, the one expected
 * root CLAUDE.md warning does not. Uses a fake `claude` that prints a canned JSON report.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'vitest';
import { repoScript, runNode, tmpDir, write } from '../helpers/harness.ts';

const script = repoScript('scripts/validate-plugin.mjs');

function run(report: unknown, exitCode = 0) {
  const dir = tmpDir();
  const fake = write(
    path.join(dir, 'fake-claude.mjs'),
    `process.stdout.write(${JSON.stringify(typeof report === 'string' ? report : JSON.stringify(report))}); process.exit(${exitCode});`
  );
  return runNode(script, ['--root', dir], { env: { CLAUDE_CMD: `${process.execPath} ${fake}` } });
}

const section = (errors: unknown[] = [], warnings: unknown[] = []) => ({
  file: '/x/.claude-plugin/plugin.json',
  errors,
  warnings,
});
const rootWarning = {
  path: 'root',
  message: 'CLAUDE.md at the plugin root is not loaded as project context.',
};

describe('validate-plugin.mjs', () => {
  it('passes a clean report, including the expected root CLAUDE.md warning', () => {
    const result = run({
      success: true,
      manifest: section(),
      contents: [section([], [rootWarning])],
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });

  it('fails on an unexpected warning and names it', () => {
    const result = run({
      success: true,
      manifest: section(
        [],
        [{ path: 'plugins.0.description', message: 'unrecognized field "foo"' }]
      ),
      contents: [],
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unrecognized field "foo"/);
  });

  it('fails on an error', () => {
    const result = run({
      success: false,
      manifest: section([{ message: 'name is required' }]),
      contents: [],
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /name is required/);
  });

  it('reads the report after install log lines a package runner prints first', () => {
    // `yarn dlx` writes its install log to stdout before the validator's JSON.
    const log = '➤ YN0000: · Yarn 4.9.2\n➤ YN0000: ┌ Resolution step\n➤ YN0000: └ Completed\n';
    const clean = { success: true, manifest: section(), contents: [section([], [rootWarning])] };
    const passed = run(log + JSON.stringify(clean, null, 2));
    assert.equal(passed.status, 0, passed.stdout + passed.stderr);

    const broken = { success: false, manifest: section([{ message: 'name is required' }]) };
    const failed = run(log + JSON.stringify(broken));
    assert.equal(failed.status, 1);
    assert.match(failed.stderr, /name is required/);
  });

  it('fails when the validator prints no JSON', () => {
    const result = run('not json', 2);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no JSON report/);
  });
});
