/** Versioning on the PR (TD-5): `yarn harness:version` stamps the version the commits call for,
 * and `--check` is the version gate. A fake Nx stands in for `nx release`: it writes the version
 * named by FAKE_NEXT and a changelog entry, the way Nx replaces an entry of the same version.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { git, repoScript, runNode, tmpDir, write, writeAll } from '../helpers/harness.ts';

const script = repoScript('scripts/release/version-harness.mjs');
const TAG = (version: string) => `artisyn-implementation-harness-v${version}`;
const PACKAGE_JSON = 'skills/implementation-harness/package.json';
const CHANGELOG = 'skills/implementation-harness/CHANGELOG.md';

const FAKE_NX = `import fs from 'node:fs';
const [, , command, sub, version] = process.argv;
if (command !== 'release') process.exit(2);
if (sub === 'version') {
  const file = 'skills/implementation-harness/package.json';
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  pkg.version = process.env.FAKE_NEXT;
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\\n');
} else if (sub === 'changelog') {
  const file = 'skills/implementation-harness/CHANGELOG.md';
  const text = fs.readFileSync(file, 'utf8').replace(new RegExp('^# ' + version + ' [\\\\s\\\\S]*?(?=^# )', 'm'), '');
  fs.writeFileSync(file, '# ' + version + ' (today)\\n\\n- a change\\n\\n' + text);
} else process.exit(2);
`;

const skillMd = (version: string) =>
  `---\nname: implementation-harness\ndescription: test\nmetadata:\n  version: "${version}"\n---\n\nBody.\n`;
const marketplace = (version: string) =>
  JSON.stringify(
    { name: 'dataart', plugins: [{ name: 'artisyn', version, source: { ref: TAG(version) } }] },
    null,
    2
  );

/** A repo released at `released` (tagged), with one more commit on top. */
function repo(released: string) {
  const root = tmpDir('version-harness-');
  writeAll(root, {
    [PACKAGE_JSON]: JSON.stringify({ name: '@dataart/x', version: released }, null, 2) + '\n',
    [CHANGELOG]: '# Curated history (3.5.0 and earlier)\n\n## 3.5.0\n\n- by hand\n',
    'skills/implementation-harness/SKILL.md': skillMd(released),
    '.claude-plugin/plugin.json': JSON.stringify({ name: 'artisyn', version: released }, null, 2),
    '.claude-plugin/marketplace.json': marketplace(released),
    '.agents/plugins/marketplace.json': marketplace(released),
  });
  git(root, ['init', '-q']);
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'release']);
  git(root, ['tag', TAG(released)]);
  write(path.join(root, 'skills/implementation-harness/new.md'), 'x');
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'feat(harness): a feature']);
  const fake = write(path.join(tmpDir('fake-nx-'), 'nx.mjs'), FAKE_NX);
  return { root, nx: `${process.execPath} ${fake}` };
}

const versionHarness = (root: string, nx: string, next: string, args: string[] = []) =>
  runNode(script, ['--root', root, ...args], {
    cwd: root,
    env: { NX_CMD: nx, FAKE_NEXT: next },
  });
const read = (root: string, file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('version-harness.mjs', () => {
  it('stamps the package, the manifests and one changelog entry, the same on a re-run', () => {
    const { root, nx } = repo('4.0.0');
    for (let i = 0; i < 2; i++) {
      const result = versionHarness(root, nx, '4.1.0');
      assert.equal(result.status, 0, result.stdout + result.stderr);
    }
    assert.equal(JSON.parse(read(root, PACKAGE_JSON)).version, '4.1.0');
    assert.match(
      read(root, '.claude-plugin/marketplace.json'),
      /artisyn-implementation-harness-v4\.1\.0/
    );
    assert.equal(read(root, CHANGELOG).match(/^# 4\.1\.0/gm)?.length, 1);
  });

  it('drops a stale entry when later commits change the version', () => {
    const { root, nx } = repo('4.0.0');
    assert.equal(versionHarness(root, nx, '4.0.1').status, 0);
    assert.equal(versionHarness(root, nx, '4.1.0').status, 0);
    const changelog = read(root, CHANGELOG);
    assert.match(changelog, /^# 4\.1\.0/m);
    assert.doesNotMatch(changelog, /^# 4\.0\.1/m);
    assert.match(changelog, /## 3\.5\.0/, 'the curated history stays');
  });

  it('passes the check on a stamped branch and leaves the files as they were', () => {
    const { root, nx } = repo('4.0.0');
    versionHarness(root, nx, '4.1.0');
    const before = read(root, PACKAGE_JSON);
    const result = versionHarness(root, nx, '4.1.0', ['--check']);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(read(root, PACKAGE_JSON), before);
  });

  it('fails the check when the branch is not stamped', () => {
    const { root, nx } = repo('4.0.0');
    const result = versionHarness(root, nx, '4.1.0', ['--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /stamped 4\.0\.0, but its commits since 4\.0\.0 make it 4\.1\.0/);
    assert.match(result.stderr, /yarn harness:version/);
    assert.equal(JSON.parse(read(root, PACKAGE_JSON)).version, '4.0.0', 'nothing kept');
  });

  it('fails the check when the stamp is out of date after more commits', () => {
    const { root, nx } = repo('4.0.0');
    versionHarness(root, nx, '4.0.1');
    const result = versionHarness(root, nx, '4.1.0', ['--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no entry for 4\.1\.0/);
    assert.match(result.stderr, /entry for 4\.0\.1, which this branch does not release/);
  });

  it('passes the check when the branch does not release the harness', () => {
    const { root, nx } = repo('4.0.0');
    const result = versionHarness(root, nx, '4.0.0', ['--check']);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /no harness release/);
  });

  it('fails clearly when no harness tag is reachable', () => {
    const { root, nx } = repo('4.0.0');
    git(root, ['tag', '-d', TAG('4.0.0')]);
    const result = versionHarness(root, nx, '4.1.0', ['--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /git fetch --tags/);
  });

  describe('while the base branch carries an unreleased version', () => {
    /** main has merged 4.1.0 (stamped, not tagged yet); this branch starts there. */
    function pendingRepo() {
      const { root, nx } = repo('4.0.0');
      versionHarness(root, nx, '4.1.0');
      git(root, ['add', '-A']);
      git(root, ['commit', '-q', '-m', 'chore(harness-release): 4.1.0']);
      git(root, ['branch', 'base']);
      return { root, nx };
    }

    it('fails a branch that changes the harness, before anything else', () => {
      const { root, nx } = pendingRepo();
      write(path.join(root, 'skills/implementation-harness/other.md'), 'y');
      git(root, ['add', '-A']);
      git(root, ['commit', '-q', '-m', 'fix(harness): another change']);

      const result = versionHarness(root, nx, '4.1.0', ['--check', '--base', 'base']);

      assert.equal(result.status, 1);
      assert.match(result.stderr, /base carries 4\.1\.0, which is not released yet/);
      assert.match(result.stderr, /release` environment/);
    });

    it('passes a branch that does not touch the harness', () => {
      const { root, nx } = pendingRepo();
      write(path.join(root, 'docs/a.md'), 'x');
      git(root, ['add', '-A']);
      git(root, ['commit', '-q', '-m', 'docs: a page']);

      const result = versionHarness(root, nx, '4.1.0', ['--check', '--base', 'base']);

      assert.equal(result.status, 0, result.stdout + result.stderr);
    });
  });
});
