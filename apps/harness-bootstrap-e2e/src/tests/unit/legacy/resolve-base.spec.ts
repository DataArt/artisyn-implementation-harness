/** The script patch apply calls to read a baseline from `.harness/state/objects/`, through the
 * legacy mapping and without the network. Covers review finding RF-038. Names the retired package
 * on purpose.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { pkgRoot, runNode, snapshot, tmpDir } from '../helpers/harness.ts';
import { LEGACY_README, LEGACY_SKILL, buildLegacyProject } from './legacy-3.5.0.ts';

const script = path.join(pkgRoot, 'scripts/resolve-base.mjs');

/** A project whose old state was copied into `.harness/state/` the way `migrate` does. */
function migratedProject() {
  const root = tmpDir();
  const legacy = buildLegacyProject(root, { legacyLaunch: false });
  fs.cpSync(legacy.stateDir, path.join(root, '.harness/state'), { recursive: true });
  return { root, legacy };
}
const resolve = (root: string, args: string[]) =>
  runNode(script, ['--root', root, ...args], { cwd: root });

describe('resolve-base.mjs', () => {
  it('resolves a state/objects baseline and writes its bytes', () => {
    const { root } = migratedProject();
    const out = path.join(tmpDir(), 'base');

    const result = resolve(root, ['--path', 'README.md', '--out', out]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(out, 'utf8'), LEGACY_README);
    assert.equal(JSON.parse(result.stdout).path, 'README.md');
  });

  it('reads an old release label as the new one and still gets the bytes from objects/', () => {
    const { root } = migratedProject();
    const out = path.join(tmpDir(), 'base');

    const result = resolve(root, ['--path', 'SKILL.md', '--out', out]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).label, 'release:artisyn-implementation-harness-v3.2.0');
    assert.equal(fs.readFileSync(out, 'utf8'), LEGACY_SKILL);
  });

  it('exits 4 and writes nothing when the baseline object is missing', () => {
    const { root, legacy } = migratedProject();
    fs.rmSync(path.join(root, '.harness/state/objects', legacy.skillSha));
    const out = path.join(tmpDir(), 'base');
    const before = snapshot(root);

    const result = resolve(root, ['--path', 'SKILL.md', '--out', out]);

    assert.equal(result.status, 4);
    assert.ok(!fs.existsSync(out), 'no output file');
    assert.deepEqual(snapshot(root), before);
  });

  it('exits 3 for a bundle or git snapshot with no object, and 2 for an unknown path', () => {
    const { root } = migratedProject();
    const index = path.join(root, '.harness/state/index.json');
    const data = JSON.parse(fs.readFileSync(index, 'utf8'));
    data.canonical['CHANGELOG.md'] = {
      recorded_sha256: 'f'.repeat(64),
      snapshot: 'bundle:63cc5487-12a1-4dc8-9841-6752e0372404',
    };
    fs.writeFileSync(index, JSON.stringify(data));

    assert.equal(resolve(root, ['--path', 'CHANGELOG.md']).status, 3);
    assert.equal(resolve(root, ['--path', 'nope.md']).status, 2);
  });

  it('finds an entry recorded under the old root doc name', () => {
    const { root } = migratedProject();
    const index = path.join(root, '.harness/state/index.json');
    const data = JSON.parse(fs.readFileSync(index, 'utf8'));
    data.canonical['harness-bootstrap.md'] = data.canonical['README.md'];
    fs.writeFileSync(index, JSON.stringify(data));

    const result = resolve(root, ['--path', 'implementation-harness.md']);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).path, 'harness-bootstrap.md');
  });
});
