import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { runChecks, type GitProbe } from './verify.ts';

function withTempRepoRoot(fn: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'log-hub-verify-test-'));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const cleanGitProbe: GitProbe = {
  isIgnored: () => true,
  trackedUnder: () => [],
};

function seedCleanFixture(root: string): void {
  mkdirSync(join(root, '.claude'), { recursive: true });
  writeFileSync(
    join(root, '.claude', 'settings.json'),
    JSON.stringify({
      permissions: { deny: ['Read(./apps/log-hub/.local/**)', 'Read(./.artisyn/**)'] },
    })
  );
  const canonicalDir = join(root, '.canonical-implementation-harness', 'canonical');
  const stateDir = join(root, '.canonical-implementation-harness', 'state');
  mkdirSync(canonicalDir, { recursive: true });
  mkdirSync(stateDir, { recursive: true });
  const canonicalContent = '{"schemaVersion":1}';
  writeFileSync(join(canonicalDir, 'settings.json'), canonicalContent);
  const hash = createHash('sha256').update(canonicalContent).digest('hex');
  writeFileSync(
    join(stateDir, 'index.json'),
    JSON.stringify({ canonical: { 'canonical/settings.json': { recorded_sha256: hash } } })
  );
}

test('clean repo: passes with no failures', () => {
  withTempRepoRoot((root) => {
    seedCleanFixture(root);
    const failures = runChecks(root, cleanGitProbe);
    assert.deepEqual(failures, []);
  });
});

test('stray enabledPlugins key present: fails, names the exact assertion', () => {
  withTempRepoRoot((root) => {
    seedCleanFixture(root);
    writeFileSync(
      join(root, '.claude', 'settings.json'),
      JSON.stringify({
        enabledPlugins: { 'log-hub-hooks@artisyn-abc123': true },
        permissions: { deny: ['Read(./apps/log-hub/.local/**)', 'Read(./.artisyn/**)'] },
      })
    );
    const failures = runChecks(root, cleanGitProbe);
    assert.ok(
      failures.some(
        (f) =>
          f.assertion === 'no-plugin-keys' && f.message.includes('log-hub-hooks@artisyn-abc123')
      )
    );
  });
});

test('.artisyn/ tracked by git: fails, names the exact assertion', () => {
  withTempRepoRoot((root) => {
    seedCleanFixture(root);
    const trackedGitProbe: GitProbe = {
      isIgnored: () => true,
      trackedUnder: (_root, relPath) =>
        relPath === '.artisyn' ? ['.artisyn/marketplace/plugin.json'] : [],
    };
    const failures = runChecks(root, trackedGitProbe);
    assert.ok(failures.some((f) => f.assertion === 'untracked' && f.message.includes('.artisyn')));
  });
});

test('.artisyn/ not gitignored at all: fails, names the exact assertion', () => {
  withTempRepoRoot((root) => {
    seedCleanFixture(root);
    const notIgnoredGitProbe: GitProbe = {
      isIgnored: (_root, relPath) => !relPath.startsWith('.artisyn'),
      trackedUnder: () => [],
    };
    const failures = runChecks(root, notIgnoredGitProbe);
    assert.ok(failures.some((f) => f.assertion === 'gitignored' && f.message.includes('.artisyn')));
  });
});

test('missing permissions.deny entry: fails, names the exact assertion', () => {
  withTempRepoRoot((root) => {
    seedCleanFixture(root);
    writeFileSync(
      join(root, '.claude', 'settings.json'),
      JSON.stringify({ permissions: { deny: [] } })
    );
    const failures = runChecks(root, cleanGitProbe);
    assert.equal(failures.filter((f) => f.assertion === 'permissions-deny').length, 2);
  });
});

test('tampered canonical hash: fails, names the exact assertion', () => {
  withTempRepoRoot((root) => {
    seedCleanFixture(root);
    writeFileSync(
      join(root, '.canonical-implementation-harness', 'canonical', 'settings.json'),
      '{"tampered":true}'
    );
    const failures = runChecks(root, cleanGitProbe);
    assert.ok(failures.some((f) => f.assertion === 'canonical-hash'));
  });
});
