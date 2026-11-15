/** Read-time mapping for the retired package name (D-04). Old snapshot refs and paths are
 * resolved when read; history files are never rewritten, bytes come from objects/ only.
 * Covers plan AC-11. Names the retired package on purpose.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { load, pkgRoot, snapshot, tmpDir } from '../helpers/harness.ts';
import { LEGACY_README, LEGACY_SKILL, buildLegacyProject } from './legacy-3.5.0.ts';

const modulePath = path.join(pkgRoot, 'scripts/lib/legacy-map.mjs');

describe('legacy-map.mjs: labels and paths', () => {
  it('maps old release snapshot refs label-only and leaves new names alone', async () => {
    const { mapLegacyRef } = await load(modulePath);
    assert.equal(
      mapLegacyRef('release:artisyn-harness-bootstrap-v3.5.0.zip'),
      'release:artisyn-implementation-harness-v3.5.0'
    );
    assert.equal(
      mapLegacyRef('release:artisyn-implementation-harness-v4.0.0'),
      'release:artisyn-implementation-harness-v4.0.0'
    );
    assert.equal(
      mapLegacyRef('bundle:63cc5487-12a1-4dc8-9841-6752e0372404'),
      'bundle:63cc5487-12a1-4dc8-9841-6752e0372404'
    );
  });

  it('maps the old root doc and adoptors/ paths', async () => {
    const { mapLegacyPath } = await load(modulePath);
    assert.equal(mapLegacyPath('harness-bootstrap.md'), 'implementation-harness.md');
    assert.equal(mapLegacyPath('canonical/adoptors/claude/x.md'), 'canonical/adaptors/claude/x.md');
    assert.equal(mapLegacyPath('README.md'), 'README.md');
  });
});

describe('legacy-map.mjs: bases come from objects/', () => {
  async function migratedState() {
    const root = tmpDir();
    const legacy = buildLegacyProject(root, { legacyLaunch: false });
    const stateDir = path.join(root, '.harness/state');
    fs.cpSync(legacy.stateDir, stateDir, { recursive: true });
    return { stateDir, legacy };
  }

  it('resolves a state/objects ref and a mapped release ref to the recorded bytes', async () => {
    const { resolveBase } = await load(modulePath);
    const { stateDir, legacy } = await migratedState();

    const readme = resolveBase(stateDir, {
      recorded_sha256: legacy.readmeSha,
      snapshot: `state/objects/${legacy.readmeSha}`,
    });
    const skill = resolveBase(stateDir, {
      recorded_sha256: legacy.skillSha,
      snapshot: 'release:artisyn-harness-bootstrap-v3.2.0.zip',
    });

    assert.equal(readme.bytes.toString(), LEGACY_README);
    assert.equal(skill.bytes.toString(), LEGACY_SKILL);
    assert.equal(skill.label, 'release:artisyn-implementation-harness-v3.2.0');
  });

  it('aborts on a missing base without writing anything', async () => {
    const { resolveBase } = await load(modulePath);
    const { stateDir, legacy } = await migratedState();
    fs.rmSync(path.join(stateDir, 'objects', legacy.skillSha));
    const before = snapshot(stateDir);

    assert.throws(
      () =>
        resolveBase(stateDir, {
          recorded_sha256: legacy.skillSha,
          snapshot: 'release:artisyn-harness-bootstrap-v3.2.0.zip',
        }),
      (error: Error & { code?: string }) => error.code === 'MISSING_BASE'
    );
    assert.deepEqual(snapshot(stateDir), before);
  });

  it('tells git, bundle and local refs apart from a lost baseline', async () => {
    const { resolveBase } = await load(modulePath);
    const { stateDir } = await migratedState();
    for (const snapshot of [
      'git:0123abc',
      'bundle:63cc5487-12a1-4dc8-9841-6752e0372404',
      'local:x',
    ]) {
      assert.throws(
        () => resolveBase(stateDir, { recorded_sha256: 'f'.repeat(64), snapshot }),
        (error: Error & { code?: string }) => error.code === 'NOT_OBJECT_BACKED',
        snapshot
      );
    }
  });

  it('never makes a network call', async () => {
    const source = fs.readFileSync(modulePath, 'utf8');
    assert.ok(!/\bfetch\(|node:https?|node:net/.test(source));
  });
});
