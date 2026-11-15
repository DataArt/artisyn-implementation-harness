import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serve, upgrade, type ComposeRunner } from './serve.ts';

function withTempProjectRoot(fn: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'log-hub-serve-test-'));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

async function withTempProjectRootAsync(fn: (root: string) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), 'log-hub-serve-test-async-'));
  try {
    await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function seedInitializedProject(root: string): void {
  mkdirSync(join(root, '.local'), { recursive: true });
  writeFileSync(join(root, '.local', 'docker-compose.yml'), 'services: {}\n');
  writeFileSync(join(root, '.local', '.env'), 'AUTH_MODE=none\n');
  writeFileSync(join(root, '.env.example'), 'LOG_HUB_VERSION=1.4.1\n');
}

test('serve: aborts with a clear message when init has not run', () => {
  withTempProjectRoot((root) => {
    const calls: string[][] = [];
    const runner: ComposeRunner = { run: (args) => calls.push(args) };
    assert.throws(() => serve(runner, root), /log-hub:init/);
    assert.equal(calls.length, 0, 'docker compose must never be called without a compose file');
  });
});

test('serve: calls docker compose pull then up -d with the expected argv', () => {
  withTempProjectRoot((root) => {
    seedInitializedProject(root);
    const calls: string[][] = [];
    const runner: ComposeRunner = { run: (args) => calls.push(args) };
    serve(runner, root);
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0].slice(-1), ['pull']);
    assert.deepEqual(calls[1].slice(-2), ['up', '-d']);
  });
});

test('upgrade: calls fetchAndVerify before any docker compose call, never touches .env', async () => {
  await withTempProjectRootAsync(async (root) => {
    seedInitializedProject(root);
    const envBefore = readFileSync(join(root, '.local', '.env'), 'utf8');
    const order: string[] = [];
    const runner: ComposeRunner = {
      run: (args) => {
        order.push('docker');
        void args;
      },
    };
    const fetchAndVerify = async () => {
      order.push('fetch');
    };
    await upgrade(fetchAndVerify, runner, root);
    assert.deepEqual(order, ['fetch', 'docker', 'docker']);
    const envAfter = readFileSync(join(root, '.local', '.env'), 'utf8');
    assert.equal(envBefore, envAfter);
  });
});
