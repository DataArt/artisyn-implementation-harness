import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stop, type ComposeDownRunner } from './stop.ts';

function withTempProjectRoot(fn: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'log-hub-stop-test-'));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('stop: no-op when init has never run, does not call docker', () => {
  withTempProjectRoot((root) => {
    const calls: string[][] = [];
    const runner: ComposeDownRunner = { run: (args) => calls.push(args) };
    assert.doesNotThrow(() => stop(runner, root));
    assert.equal(calls.length, 0);
  });
});

test('stop: calls docker compose down when a compose file exists', () => {
  withTempProjectRoot((root) => {
    mkdirSync(join(root, '.local'), { recursive: true });
    writeFileSync(join(root, '.local', 'docker-compose.yml'), 'services: {}\n');
    const calls: string[][] = [];
    const runner: ComposeDownRunner = { run: (args) => calls.push(args) };
    stop(runner, root);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].slice(-1), ['down']);
  });
});
