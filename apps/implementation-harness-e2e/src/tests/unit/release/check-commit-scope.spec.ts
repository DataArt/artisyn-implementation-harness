/** Commit scope check (D-16): every commit that touches the harness package carries scope
 * `harness`, or `harness-release` for the release commit. Covers plan AC-20.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'vitest';
import { git, repoScript, runNode, tmpDir, write } from '../helpers/harness.ts';

const script = repoScript('scripts/check-commit-scope.mjs');
const HARNESS_FILE = 'skills/implementation-harness/SKILL.md';

function checkMessage(message: string, files: string[]) {
  const dir = tmpDir();
  const file = write(path.join(dir, 'MSG'), message + '\n');
  return runNode(script, ['--message-file', file, '--files', files.join(',')]);
}

describe('check-commit-scope.mjs: message mode (commit-msg hook)', () => {
  it('accepts any scope when no harness file is touched', () => {
    assert.equal(checkMessage('feat(web-docs): add page', ['apps/web-docs/a.md']).status, 0);
    assert.equal(checkMessage('fix: no scope at all', ['apps/web-docs/a.md']).status, 0);
  });

  it('rejects a commit that touches the package without scope harness', () => {
    const result = checkMessage('feat(web-docs): add page', [HARNESS_FILE]);
    assert.equal(result.status, 1);
    assert.match(result.stdout + result.stderr, /harness/);
  });

  it('rejects a commit without any scope that touches the package', () => {
    assert.equal(checkMessage('fix: typo', [HARNESS_FILE]).status, 1);
  });

  it('accepts scope harness, including the breaking form', () => {
    assert.equal(checkMessage('feat(harness): add cli', [HARNESS_FILE]).status, 0);
    assert.equal(checkMessage('feat(harness)!: rename the package', [HARNESS_FILE]).status, 0);
  });

  it('accepts scope harness-release for the stamped release commit', () => {
    assert.equal(checkMessage('chore(harness-release): 4.0.0', [HARNESS_FILE]).status, 0);
  });

  it('treats the plugin manifests as harness files too', () => {
    for (const file of [
      'skills/.claude-plugin/plugin.json',
      '.claude-plugin/marketplace.json',
      '.agents/plugins/marketplace.json',
      '.github/plugin/marketplace.json',
    ]) {
      assert.equal(checkMessage('feat(web-docs): x', [file]).status, 1, file);
    }
  });
});

describe('check-commit-scope.mjs: file names git would quote', () => {
  it('still sees a harness file with a non-ASCII name in range mode', () => {
    const repo = tmpDir();
    git(repo, ['init', '-q']);
    write(path.join(repo, 'README.md'), 'x\n');
    git(repo, ['add', '-A']);
    git(repo, ['commit', '-q', '-m', 'chore: init']);
    const base = git(repo, ['rev-parse', 'HEAD']);

    write(path.join(repo, 'skills/implementation-harness/café.md'), 'one\n');
    git(repo, ['add', '-A']);
    git(repo, ['commit', '-q', '-m', 'fix(web-docs): wrong scope']);

    const result = runNode(script, ['--range', `${base}..HEAD`, '--root', repo]);
    assert.equal(result.status, 1, result.stdout + result.stderr);
  });

  it('still sees a staged harness file with a non-ASCII name in message mode', () => {
    const repo = tmpDir();
    git(repo, ['init', '-q']);
    write(path.join(repo, 'skills/implementation-harness/café.md'), 'one\n');
    git(repo, ['add', '-A']);
    const message = write(path.join(repo, 'MSG'), 'fix(web-docs): wrong scope\n');

    const result = runNode(script, ['--message-file', message, '--root', repo], { cwd: repo });
    assert.equal(result.status, 1, result.stdout + result.stderr);
  });
});

describe('check-commit-scope.mjs: range mode (CI)', () => {
  it('fails naming the offending commit and passes when all commits comply', () => {
    const repo = tmpDir();
    git(repo, ['init', '-q']);
    write(path.join(repo, 'README.md'), 'x\n');
    git(repo, ['add', '-A']);
    git(repo, ['commit', '-q', '-m', 'chore: init']);
    const base = git(repo, ['rev-parse', 'HEAD']);

    write(path.join(repo, HARNESS_FILE), 'one\n');
    git(repo, ['add', '-A']);
    git(repo, ['commit', '-q', '-m', 'feat(harness): add skill']);
    const ok = runNode(script, ['--range', `${base}..HEAD`, '--root', repo]);
    assert.equal(ok.status, 0, ok.stdout + ok.stderr);

    write(path.join(repo, HARNESS_FILE), 'two\n');
    git(repo, ['add', '-A']);
    git(repo, ['commit', '-q', '-m', 'fix(web-docs): wrong scope']);
    const bad = runNode(script, ['--range', `${base}..HEAD`, '--root', repo]);
    assert.equal(bad.status, 1);
    assert.ok(
      (bad.stdout + bad.stderr).includes(git(repo, ['rev-parse', '--short', 'HEAD']).slice(0, 7))
    );
  });
});
