/** State root for launch and patch apply: project-root resolution, ignore entries and the
 * split `package:` record. Covers plan AC-6 and AC-7 (Design - Install and Update, D-10 to D-13).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { git, load, pkgRoot, tmpDir, write, writeAll } from './helpers/harness.ts';

const modulePath = path.join(pkgRoot, 'scripts/lib/state-root.mjs');

const IGNORE_ENTRIES = [
  '.harness/state/objects/',
  '.harness/state/launch/runs/',
  '.harness/state/launch/reports/',
  '.harness/state/launch/package.local.json',
];
// Native realpath expands Windows 8.3 short names (RUNNER~1), which git never returns.
const real = (file: string) => fs.realpathSync.native(file);

describe('state-root.mjs: project root resolution', () => {
  it('prefers ARTISYN_HARNESS_PROJECT_ROOT, then the git top level, then cwd', async () => {
    const { resolveProjectRoot } = await load(modulePath);
    const repo = tmpDir();
    git(repo, ['init', '-q']);
    const nested = path.join(repo, 'a/b');
    fs.mkdirSync(nested, { recursive: true });
    const plain = tmpDir();
    const forced = tmpDir();

    assert.equal(
      resolveProjectRoot({ env: { ARTISYN_HARNESS_PROJECT_ROOT: forced }, cwd: nested }),
      forced
    );
    assert.equal(real(resolveProjectRoot({ env: {}, cwd: nested })), real(repo));
    assert.equal(real(resolveProjectRoot({ env: {}, cwd: plain })), real(plain));
  });

  it('never resolves from the package path or a provider folder', async () => {
    const { resolveProjectRoot } = await load(modulePath);
    const repo = tmpDir();
    git(repo, ['init', '-q']);
    const inside = path.join(repo, '.claude/skills/implementation-harness/scripts');
    fs.mkdirSync(inside, { recursive: true });
    assert.equal(real(resolveProjectRoot({ env: {}, cwd: inside })), real(repo));
  });
});

describe('state-root.mjs: ignore entries', () => {
  it('appends the four entries once and keeps existing lines', async () => {
    const { ensureGitignore } = await load(modulePath);
    const root = tmpDir();
    write(path.join(root, '.gitignore'), 'node_modules/\n');

    ensureGitignore(root);
    ensureGitignore(root);

    const lines = fs.readFileSync(path.join(root, '.gitignore'), 'utf8').split('\n');
    assert.ok(lines.includes('node_modules/'));
    for (const entry of IGNORE_ENTRIES) assert.equal(lines.filter((l) => l === entry).length, 1);
  });

  it('creates .gitignore when missing and never untracks files', async () => {
    const { ensureGitignore } = await load(modulePath);
    const root = tmpDir();
    git(root, ['init', '-q']);
    write(path.join(root, '.harness/state/objects/abc'), 'tracked object\n');
    git(root, ['add', '-A']);

    ensureGitignore(root);

    assert.ok(fs.existsSync(path.join(root, '.gitignore')));
    assert.equal(
      git(root, ['ls-files', '.harness/state/objects/abc']),
      '.harness/state/objects/abc'
    );
  });
});

describe('state-root.mjs: package record', () => {
  it('splits the committed record from the per-machine path', async () => {
    const { writePackageRecord } = await load(modulePath);
    const root = tmpDir();

    writePackageRecord(root, {
      name: '@dataart/artisyn-implementation-harness',
      version: '4.0.0',
      channel: 'npm',
      path: '/home/dev/proj/.claude/skills/implementation-harness',
    });

    const committed = JSON.parse(
      fs.readFileSync(path.join(root, '.harness/state/launch/package.json'), 'utf8')
    );
    const local = JSON.parse(
      fs.readFileSync(path.join(root, '.harness/state/launch/package.local.json'), 'utf8')
    );
    assert.deepEqual(committed, {
      name: '@dataart/artisyn-implementation-harness',
      version: '4.0.0',
      channel: 'npm',
    });
    assert.deepEqual(local, { path: '/home/dev/proj/.claude/skills/implementation-harness' });
  });

  it('re-resolves a missing local path from provider folders by name and version', async () => {
    const { writePackageRecord, resolvePackagePath } = await load(modulePath);
    const root = tmpDir();
    const name = '@dataart/artisyn-implementation-harness';
    writePackageRecord(root, { name, version: '4.0.0', channel: 'marketplace', path: '/gone' });
    fs.rmSync(path.join(root, '.harness/state/launch/package.local.json'));
    const installed = path.join(root, '.agents/skills/implementation-harness');
    writeAll(installed, { 'package.json': JSON.stringify({ name, version: '4.0.0' }) });

    const found = resolvePackagePath(root, { home: tmpDir() });

    assert.equal(fs.realpathSync(found), fs.realpathSync(installed));
    const local = JSON.parse(
      fs.readFileSync(path.join(root, '.harness/state/launch/package.local.json'), 'utf8')
    );
    assert.equal(fs.realpathSync(local.path), fs.realpathSync(installed));
  });

  it('finds the package in the host plugin cache and ignores other versions', async () => {
    const { writePackageRecord, resolvePackagePath } = await load(modulePath);
    const root = tmpDir();
    const home = tmpDir();
    const name = '@dataart/artisyn-implementation-harness';
    writePackageRecord(root, { name, version: '4.1.0', channel: 'marketplace', path: '/gone' });
    fs.rmSync(path.join(root, '.harness/state/launch/package.local.json'));
    const stale = path.join(
      home,
      '.claude/plugins/cache/dataart/artisyn/4.0.0/skills/implementation-harness'
    );
    const wanted = path.join(
      home,
      '.claude/plugins/cache/dataart/artisyn/4.1.0/skills/implementation-harness'
    );
    writeAll(stale, { 'package.json': JSON.stringify({ name, version: '4.0.0' }) });
    writeAll(wanted, { 'package.json': JSON.stringify({ name, version: '4.1.0' }) });

    const found = resolvePackagePath(root, { home });

    assert.equal(fs.realpathSync(found), fs.realpathSync(wanted));
  });

  it('returns null when no installed copy matches the recorded version', async () => {
    const { writePackageRecord, resolvePackagePath } = await load(modulePath);
    const root = tmpDir();
    const name = '@dataart/artisyn-implementation-harness';
    writePackageRecord(root, { name, version: '4.2.0', channel: 'zip', path: '/gone' });
    fs.rmSync(path.join(root, '.harness/state/launch/package.local.json'));
    writeAll(path.join(root, '.claude/skills/implementation-harness'), {
      'package.json': JSON.stringify({ name, version: '4.0.0' }),
    });

    assert.equal(resolvePackagePath(root, { home: tmpDir() }), null);
  });
});
