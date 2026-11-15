import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  installHook,
  extractMarketplaceName,
  type Prompter,
  type HookInstallerRunner,
  type ClaudeCliRunner,
} from './install-hook.ts';

function withTempRepoRoot(fn: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'log-hub-install-hook-test-'));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const yesPrompter: Prompter = {
  confirm: async () => true,
  ask: async () => 'test-api-key',
};

const noPrompter: Prompter = {
  confirm: async () => false,
  ask: async () => '',
};

test('extractMarketplaceName: parses the installer-chosen name', () => {
  const settings = '{\n  "enabledPlugins": {\n    "log-hub-hooks@artisyn-a99d3904": true\n  }\n}';
  assert.equal(extractMarketplaceName(settings), 'artisyn-a99d3904');
});

test('extractMarketplaceName: throws a descriptive error when absent', () => {
  assert.throws(() => extractMarketplaceName('{}'), /could not find/);
});

test('installHook: disclosure not confirmed aborts before any installer call', async () => {
  withTempRepoRoot((root) => {
    mkdirSync(join(root, '.claude'), { recursive: true });
    writeFileSync(join(root, '.claude', 'settings.json'), '{}');
    let installerCalled = false;
    const installerRunner: HookInstallerRunner = {
      run: () => {
        installerCalled = true;
      },
    };
    const claudeRunner: ClaudeCliRunner = { run: () => {} };

    assert.rejects(
      () =>
        installHook({
          mode: 'install',
          prompter: noPrompter,
          installerRunner,
          claudeRunner,
          repoRoot: root,
        }),
      /not confirmed/
    );
    assert.equal(installerCalled, false);
  });
});

test('installHook: restores settings.json even when the installer run throws', async () => {
  await withTempRepoRootAsync(async (root) => {
    const settingsPath = join(root, '.claude', 'settings.json');
    mkdirSync(join(root, '.claude'), { recursive: true });
    const preRun = '{"permissions":{"deny":["Bash(git push:*)"]}}';
    writeFileSync(settingsPath, preRun);

    const installerRunner: HookInstallerRunner = {
      run: () => {
        // Simulate the installer having written its own keys before it then fails.
        writeFileSync(settingsPath, '{"enabledPlugins":{"log-hub-hooks@artisyn-abc123":true}}');
        throw new Error('simulated installer failure');
      },
    };
    const claudeRunner: ClaudeCliRunner = { run: () => {} };

    await assert.rejects(
      () =>
        installHook({
          mode: 'install',
          apiKey: 'k',
          prompter: yesPrompter,
          installerRunner,
          claudeRunner,
          repoRoot: root,
        }),
      /simulated installer failure/
    );
    // The file must be restored even though installHook itself rejected.
    assert.equal(readFileSync(settingsPath, 'utf8'), preRun);
  });
});

test('installHook: happy path restores settings.json byte-for-byte and registers at local scope', async () => {
  await withTempRepoRootAsync(async (root) => {
    const settingsPath = join(root, '.claude', 'settings.json');
    mkdirSync(join(root, '.claude'), { recursive: true });
    const preRun = '{"permissions":{"deny":["Bash(git push:*)"]}}';
    writeFileSync(settingsPath, preRun);

    const claudeCalls: string[][] = [];
    const installerRunner: HookInstallerRunner = {
      run: (args) => {
        assert.deepEqual(args.slice(0, 1), ['install']);
        writeFileSync(
          settingsPath,
          '{"enabledPlugins":{"log-hub-hooks@artisyn-a99d3904":true},"permissions":{"deny":["Bash(git push:*)"]}}'
        );
      },
    };
    const claudeRunner: ClaudeCliRunner = { run: (args) => claudeCalls.push(args) };

    await installHook({
      mode: 'install',
      apiKey: 'k',
      prompter: yesPrompter,
      installerRunner,
      claudeRunner,
      repoRoot: root,
    });

    assert.equal(readFileSync(settingsPath, 'utf8'), preRun);
    assert.equal(claudeCalls.length, 2);
    assert.deepEqual(claudeCalls[0], [
      'plugin',
      'marketplace',
      'add',
      './.artisyn/marketplace',
      '--scope',
      'local',
    ]);
    assert.deepEqual(claudeCalls[1], [
      'plugin',
      'install',
      'log-hub-hooks@artisyn-a99d3904',
      '--scope',
      'local',
      '-y',
    ]);
  });
});

async function withTempRepoRootAsync(fn: (root: string) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), 'log-hub-install-hook-test-async-'));
  try {
    await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
