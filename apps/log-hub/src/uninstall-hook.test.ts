import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { uninstallHook, stripLocalScopeKeys, type UninstallerRunner } from './uninstall-hook.ts';

function withTempRepoRoot(fn: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'log-hub-uninstall-hook-test-'));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('stripLocalScopeKeys: removes both keys, leaves other keys untouched', () => {
  withTempRepoRoot((root) => {
    const settingsLocalPath = join(root, 'settings.local.json');
    writeFileSync(
      settingsLocalPath,
      JSON.stringify({
        enabledPlugins: { 'log-hub-hooks@artisyn-a99d3904': true, 'other-plugin@foo': true },
        extraKnownMarketplaces: {
          'artisyn-a99d3904': { source: {} },
          'unrelated-marketplace': { source: {} },
        },
        env: { FOO: 'bar' },
      })
    );

    stripLocalScopeKeys(settingsLocalPath);

    const result = JSON.parse(readFileSync(settingsLocalPath, 'utf8'));
    assert.deepEqual(result.enabledPlugins, { 'other-plugin@foo': true });
    assert.deepEqual(result.extraKnownMarketplaces, { 'unrelated-marketplace': { source: {} } });
    assert.deepEqual(result.env, { FOO: 'bar' });
  });
});

test('stripLocalScopeKeys: fixture with nothing installed is untouched (exits cleanly)', () => {
  withTempRepoRoot((root) => {
    const settingsLocalPath = join(root, 'settings.local.json');
    const original = JSON.stringify({ env: { FOO: 'bar' } });
    writeFileSync(settingsLocalPath, original);

    stripLocalScopeKeys(settingsLocalPath);

    assert.equal(readFileSync(settingsLocalPath, 'utf8'), original);
  });
});

test('stripLocalScopeKeys: missing file is a no-op, does not throw', () => {
  withTempRepoRoot((root) => {
    assert.doesNotThrow(() => stripLocalScopeKeys(join(root, 'does-not-exist.json')));
  });
});

test('uninstallHook: no .artisyn/ present — does not call the uninstaller, still safe to run', () => {
  withTempRepoRoot((root) => {
    let called = false;
    const uninstallerRunner: UninstallerRunner = {
      run: () => {
        called = true;
      },
    };
    assert.doesNotThrow(() => uninstallHook({ uninstallerRunner, repoRoot: root }));
    assert.equal(called, false);
  });
});

test('uninstallHook: .artisyn/ present — calls the uninstaller, then strips local-scope keys', () => {
  withTempRepoRoot((root) => {
    mkdirSync(join(root, '.artisyn'), { recursive: true });
    mkdirSync(join(root, '.claude'), { recursive: true });
    writeFileSync(
      join(root, '.claude', 'settings.local.json'),
      JSON.stringify({ enabledPlugins: { 'log-hub-hooks@artisyn-abc': true } })
    );

    const calls: string[][] = [];
    const uninstallerRunner: UninstallerRunner = { run: (args) => calls.push(args) };
    uninstallHook({ uninstallerRunner, repoRoot: root });

    assert.deepEqual(calls, [['uninstall']]);
    const result = JSON.parse(readFileSync(join(root, '.claude', 'settings.local.json'), 'utf8'));
    assert.equal(result.enabledPlugins, undefined);
  });
});

test('uninstallHook: tarball URL follows a passed serverUrl override', () => {
  withTempRepoRoot((root) => {
    mkdirSync(join(root, '.artisyn'), { recursive: true });

    let tarballUrl = '';
    const uninstallerRunner: UninstallerRunner = {
      run: (_args, _cwd, url) => {
        tarballUrl = url;
      },
    };
    uninstallHook({ uninstallerRunner, repoRoot: root, serverUrl: 'https://log-hub.example.com' });

    assert.equal(tarballUrl, 'https://log-hub.example.com/static/artisyn-hooks-installer.tgz');
  });
});

test('uninstallHook: running twice in a row is a no-op the second time', () => {
  withTempRepoRoot((root) => {
    mkdirSync(join(root, '.artisyn'), { recursive: true });
    mkdirSync(join(root, '.claude'), { recursive: true });
    writeFileSync(
      join(root, '.claude', 'settings.local.json'),
      JSON.stringify({ enabledPlugins: { 'log-hub-hooks@artisyn-abc': true } })
    );

    const calls: string[][] = [];
    const uninstallerRunner: UninstallerRunner = { run: (args) => calls.push(args) };
    uninstallHook({ uninstallerRunner, repoRoot: root });
    const firstRun = readFileSync(join(root, '.claude', 'settings.local.json'), 'utf8');

    assert.doesNotThrow(() => uninstallHook({ uninstallerRunner, repoRoot: root }));
    const secondRun = readFileSync(join(root, '.claude', 'settings.local.json'), 'utf8');
    assert.equal(firstRun, secondRun);
    assert.ok(
      existsSync(join(root, '.artisyn')),
      'the test itself never removes .artisyn/ — only the real uninstaller does, which is mocked here'
    );
  });
});
