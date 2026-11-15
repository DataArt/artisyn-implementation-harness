/** Migration of 3.5.0 state into `.harness/state/` (D-14). Copy, verify by hash, mark the
 * source, keep it; idempotent; abort on conflicts. Covers plan AC-9 and AC-10. Names the
 * retired package on purpose.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { load, pkgRoot, sha256, snapshot, tmpDir, write } from '../helpers/harness.ts';
import { RUN_A, RUN_B, buildLegacyProject } from './legacy-3.5.0.ts';

const modulePath = path.join(pkgRoot, 'scripts/lib/migrator.mjs');
const SHIM = '---\nname: harness-bootstrap\nmetadata:\n  deprecated: "true"\n---\nshim\n';

async function migrateIn(root: string, shimSource: string | null = SHIM) {
  const { migrate } = await load(modulePath);
  return migrate({ root, shim: shimSource });
}

describe('migrator.mjs: 3.5.0 provider install', () => {
  it('copies state with matching hashes, records provenance and marks the source', async () => {
    const root = tmpDir();
    const legacy = buildLegacyProject(root);

    const result = await migrateIn(root);

    assert.equal(result.status, 'migrated');
    assert.equal(result.exitCode, 0);
    const state = path.join(root, '.harness/state');
    for (const rel of [
      'answers.json',
      'index.json',
      `objects/${legacy.readmeSha}`,
      `objects/${legacy.skillSha}`,
      'operations/launch.json',
      'launch/runs/run-a/materialization.json',
      'launch/reports/r1.md',
      'patch/APPLIED.md',
    ]) {
      assert.equal(
        sha256(fs.readFileSync(path.join(state, rel))),
        sha256(fs.readFileSync(path.join(legacy.stateDir, rel))),
        rel
      );
    }
    assert.ok(fs.existsSync(path.join(legacy.stateDir, 'MIGRATED.md')), 'marker at the source');
    assert.ok(fs.existsSync(path.join(legacy.stateDir, 'answers.json')), 'source kept');
    const provenance = JSON.parse(fs.readFileSync(path.join(state, 'provenance.json'), 'utf8'));
    assert.ok(JSON.stringify(provenance).includes('harness-bootstrap/state'));
  });

  it('keeps package state first and imports only legacy runs whose IDs are absent', async () => {
    const root = tmpDir();
    buildLegacyProject(root);

    await migrateIn(root);

    const runs = path.join(root, '.harness/state/launch/runs');
    assert.equal(fs.readFileSync(path.join(runs, 'run-a/materialization.json'), 'utf8'), RUN_A);
    assert.equal(fs.readFileSync(path.join(runs, 'run-b/materialization.json'), 'utf8'), RUN_B);
    const provenance = JSON.stringify(
      JSON.parse(fs.readFileSync(path.join(root, '.harness/state/provenance.json'), 'utf8'))
    );
    assert.ok(provenance.includes('run-b'));
    assert.ok(!provenance.includes('"run-a"'), 'run-a came from package state only');
  });

  it('leaves one harness-bootstrap folder holding only the shim and the marked state', async () => {
    const root = tmpDir();
    const legacy = buildLegacyProject(root);

    await migrateIn(root);

    assert.deepEqual(fs.readdirSync(legacy.packageDir).sort(), ['SKILL.md', 'state']);
    assert.equal(fs.readFileSync(path.join(legacy.packageDir, 'SKILL.md'), 'utf8'), SHIM);
    assert.ok(fs.existsSync(path.join(legacy.stateDir, 'MIGRATED.md')));
    const folders = fs
      .readdirSync(path.join(root, '.claude/skills'))
      .filter((name) => name.includes('harness-bootstrap'));
    assert.deepEqual(folders, ['harness-bootstrap']);
  });

  it('skips the shim replacement when no shim source is available', async () => {
    const root = tmpDir();
    const legacy = buildLegacyProject(root);

    const result = await migrateIn(root, null);

    assert.equal(result.status, 'migrated');
    assert.ok(result.warnings.some((w: string) => /shim/i.test(w)));
    assert.ok(fs.existsSync(path.join(legacy.packageDir, 'harness-bootstrap.md')));
  });

  it('places the shim on a later run when the first run had no shim source', async () => {
    const root = tmpDir();
    const legacy = buildLegacyProject(root);

    const first = await migrateIn(root, null);
    assert.equal(first.status, 'migrated');
    assert.ok(
      fs.existsSync(path.join(legacy.packageDir, 'harness-bootstrap.md')),
      'old package kept'
    );

    const second = await migrateIn(root);
    assert.equal(second.status, 'shim-placed');
    assert.equal(second.exitCode, 0);
    assert.deepEqual(fs.readdirSync(legacy.packageDir).sort(), ['SKILL.md', 'state']);
    assert.equal(fs.readFileSync(path.join(legacy.packageDir, 'SKILL.md'), 'utf8'), SHIM);

    const before = snapshot(root);
    const third = await migrateIn(root);
    assert.equal(third.status, 'already-migrated');
    assert.deepEqual(snapshot(root), before, 'once the shim is in place nothing changes');
  });

  it('keeps warning, and changes nothing, while no shim source exists', async () => {
    const root = tmpDir();
    buildLegacyProject(root);
    await migrateIn(root, null);
    const before = snapshot(root);

    const again = await migrateIn(root, null);

    assert.equal(again.status, 'already-migrated');
    assert.ok(again.warnings.some((w: string) => /shim/i.test(w)));
    assert.deepEqual(snapshot(root), before);
  });

  it('is idempotent: a second run changes nothing', async () => {
    const root = tmpDir();
    buildLegacyProject(root);
    await migrateIn(root);
    const before = snapshot(root);

    const second = await migrateIn(root);

    assert.equal(second.status, 'already-migrated');
    assert.equal(second.exitCode, 0);
    assert.deepEqual(snapshot(root), before);
  });

  it('aborts with exit 4 and moves nothing when the same run ID has different bytes', async () => {
    const root = tmpDir();
    buildLegacyProject(root);
    write(
      path.join(root, '.harness/launch/runs/run-a/materialization.json'),
      '{"different":true}\n'
    );
    const before = snapshot(root);

    const result = await migrateIn(root);

    assert.equal(result.status, 'conflict');
    assert.equal(result.exitCode, 4);
    assert.deepEqual(snapshot(root), before);
    assert.ok(!fs.existsSync(path.join(root, '.harness/state')));
  });

  it('reports nothing to migrate for a project without old state', async () => {
    const root = tmpDir();

    const result = await migrateIn(root);

    assert.equal(result.status, 'nothing-to-migrate');
    assert.equal(result.exitCode, 0);
  });
});

describe('migrator.mjs: 3.5.0 root-extract install and legacy .harness/launch', () => {
  it('migrates <project>/.canonical-implementation-harness/state without a shim', async () => {
    const root = tmpDir();
    const legacy = buildLegacyProject(root, {
      packageRelative: '.canonical-implementation-harness',
      legacyLaunch: false,
    });

    const result = await migrateIn(root);

    assert.equal(result.status, 'migrated');
    assert.ok(fs.existsSync(path.join(root, '.harness/state/index.json')));
    assert.ok(fs.existsSync(path.join(legacy.stateDir, 'MIGRATED.md')));
    assert.ok(
      fs.existsSync(path.join(legacy.packageDir, 'harness-bootstrap.md')),
      'not a skill folder'
    );
  });

  it('imports a lone legacy .harness/launch folder', async () => {
    const root = tmpDir();
    write(path.join(root, '.harness/launch/runs/only/materialization.json'), RUN_B);

    const result = await migrateIn(root);

    assert.equal(result.status, 'migrated');
    assert.equal(
      fs.readFileSync(
        path.join(root, '.harness/state/launch/runs/only/materialization.json'),
        'utf8'
      ),
      RUN_B
    );
  });
});
