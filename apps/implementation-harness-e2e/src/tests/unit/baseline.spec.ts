/** Reading a baseline from `.harness/state/objects/` (scripts/lib/baseline.mjs) and the script patch
 * apply calls for it (scripts/resolve-base.mjs): bytes come from objects/ only, never the network.
 * Covers review finding RF-038.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { load, pkgRoot, runNode, sha256, snapshot, tmpDir, writeAll } from './helpers/harness.ts';

const modulePath = path.join(pkgRoot, 'scripts/lib/baseline.mjs');
const script = path.join(pkgRoot, 'scripts/resolve-base.mjs');
const README = 'readme v1\n';
const SKILL = 'skill v1\n';

/** A project with two baselines: one named by its object, one by a release label. */
function project() {
  const root = tmpDir();
  const readmeSha = sha256(README);
  const skillSha = sha256(SKILL);
  const index = {
    schema_version: 2,
    canonical: {
      'README.md': { recorded_sha256: readmeSha, snapshot: `state/objects/${readmeSha}` },
      'SKILL.md': {
        recorded_sha256: skillSha,
        snapshot: 'release:artisyn-implementation-harness-v4.0.0',
      },
    },
  };
  const stateDir = path.join(root, '.harness/state');
  writeAll(stateDir, {
    'index.json': JSON.stringify(index, null, 2) + '\n',
    [`objects/${readmeSha}`]: README,
    [`objects/${skillSha}`]: SKILL,
  });
  return { root, stateDir, readmeSha, skillSha };
}
const resolve = (root: string, args: string[]) =>
  runNode(script, ['--root', root, ...args], { cwd: root });

describe('baseline.mjs', () => {
  it('resolves an objects ref and a release label to the recorded bytes', async () => {
    const { resolveBase } = await load(modulePath);
    const { stateDir, readmeSha, skillSha } = project();

    const readme = resolveBase(stateDir, {
      recorded_sha256: readmeSha,
      snapshot: `state/objects/${readmeSha}`,
    });
    const skill = resolveBase(stateDir, {
      recorded_sha256: skillSha,
      snapshot: 'release:artisyn-implementation-harness-v4.0.0',
    });

    assert.equal(readme.bytes.toString(), README);
    assert.equal(skill.bytes.toString(), SKILL);
    assert.equal(skill.label, 'release:artisyn-implementation-harness-v4.0.0');
  });

  it('tells git, bundle and local refs apart from a lost baseline', async () => {
    const { resolveBase } = await load(modulePath);
    const { stateDir } = project();
    for (const ref of ['git:0123abc', 'bundle:63cc5487-12a1-4dc8-9841-6752e0372404', 'local:x'])
      assert.throws(
        () => resolveBase(stateDir, { recorded_sha256: 'f'.repeat(64), snapshot: ref }),
        (error: Error & { code?: string }) => error.code === 'NOT_OBJECT_BACKED',
        ref
      );
  });

  it('never makes a network call', () => {
    const source = fs.readFileSync(modulePath, 'utf8');
    assert.ok(!/\bfetch\(|node:https?|node:net/.test(source));
  });
});

describe('resolve-base.mjs', () => {
  it('resolves a baseline and writes its bytes', () => {
    const { root } = project();
    const out = path.join(tmpDir(), 'base');

    const result = resolve(root, ['--path', 'SKILL.md', '--out', out]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(out, 'utf8'), SKILL);
    assert.equal(JSON.parse(result.stdout).path, 'SKILL.md');
  });

  it('exits 4 and writes nothing when the baseline object is missing', () => {
    const { root, skillSha } = project();
    fs.rmSync(path.join(root, '.harness/state/objects', skillSha));
    const out = path.join(tmpDir(), 'base');
    const before = snapshot(root);

    const result = resolve(root, ['--path', 'SKILL.md', '--out', out]);

    assert.equal(result.status, 4);
    assert.ok(!fs.existsSync(out), 'no output file');
    assert.deepEqual(snapshot(root), before);
  });

  it('exits 3 for a bundle snapshot with no object, and 2 for an unknown path', () => {
    const { root } = project();
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
});
