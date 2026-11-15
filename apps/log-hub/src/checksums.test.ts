import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifySha256Sums } from './checksums.ts';

function withTempDir(fn: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'log-hub-checksums-test-'));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

test('all files match: passes silently', () => {
  withTempDir((dir) => {
    writeFileSync(join(dir, 'a.txt'), 'hello');
    writeFileSync(join(dir, 'b.txt'), 'world');
    const sums = `${sha256('hello')}  a.txt\n${sha256('world')}  b.txt\n`;
    assert.doesNotThrow(() => verifySha256Sums(dir, sums));
  });
});

test('tampered file content: throws naming the exact file', () => {
  withTempDir((dir) => {
    writeFileSync(join(dir, 'a.txt'), 'tampered-content');
    const sums = `${sha256('original-content')}  a.txt\n`;
    assert.throws(() => verifySha256Sums(dir, sums), /checksum mismatch for a\.txt/);
  });
});

test('file referenced in SHA256SUMS missing from disk: throws naming the file', () => {
  withTempDir((dir) => {
    const sums = `${sha256('anything')}  missing.txt\n`;
    assert.throws(() => verifySha256Sums(dir, sums), /missing\.txt/);
  });
});

test('SHA256SUMS line with extra whitespace/CRLF parses correctly', () => {
  withTempDir((dir) => {
    writeFileSync(join(dir, 'a.txt'), 'hello');
    const sums = `${sha256('hello')}  a.txt\r\n`;
    assert.doesNotThrow(() => verifySha256Sums(dir, sums));
  });
});

test('unparsable line throws a descriptive error', () => {
  withTempDir((dir) => {
    assert.throws(() => verifySha256Sums(dir, 'not-a-valid-sums-line\n'), /could not parse/);
  });
});
