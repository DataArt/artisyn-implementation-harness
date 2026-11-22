import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const load = () => import('./check-bundle-budget.mjs');
const BASE = '/artisyn-implementation-harness';

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-'));
  const js = 'console.log("a");'.repeat(200);
  const css = 'body{color:red}'.repeat(100);
  fs.mkdirSync(path.join(dir, '_next/static/chunks'), { recursive: true });
  fs.mkdirSync(path.join(dir, '_next/static/css'), { recursive: true });
  fs.writeFileSync(path.join(dir, '_next/static/chunks/a.js'), js);
  fs.writeFileSync(path.join(dir, '_next/static/css/a.css'), css);
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    `<html><head><link rel="stylesheet" href="${BASE}/_next/static/css/a.css"><script src="${BASE}/_next/static/chunks/a.js" async></script></head></html>`
  );
  const expected = zlib.gzipSync(js).length + zlib.gzipSync(css).length;
  return { dir, expected };
}

test('check-bundle-budget: sums the gzip size of the JS and CSS that index.html references', async () => {
  const { measure } = await load();
  const { dir, expected } = fixture();
  const result = measure(dir, BASE);
  assert.equal(result.files.length, 2);
  assert.equal(result.gzipBytes, expected);
});

test('check-bundle-budget: passes under the ceiling and fails above it', async () => {
  const { checkBudget } = await load();
  const { dir, expected } = fixture();
  assert.equal(checkBudget(dir, { basePath: BASE, ceilingBytes: expected }).ok, true);
  assert.equal(checkBudget(dir, { basePath: BASE, ceilingBytes: expected - 1 }).ok, false);
});

test('check-bundle-budget: fails on a missing referenced file or no references', async () => {
  const { measure } = await load();
  const { dir } = fixture();
  fs.rmSync(path.join(dir, '_next/static/css/a.css'));
  assert.throws(() => measure(dir, BASE), /not found/);
  fs.writeFileSync(path.join(dir, 'index.html'), '<html></html>');
  assert.throws(() => measure(dir, BASE), /no .*referenced/i);
});
