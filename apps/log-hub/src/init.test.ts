import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fetchAndVerifyRelease, scaffoldEnv, type Downloader } from './init.ts';

function withTempDir(fn: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'log-hub-init-test-'));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

test('fetchAndVerifyRelease: checksum mismatch aborts before any file is scaffolded elsewhere', async () => {
  await withTempDirAsync(async (dir) => {
    const downloader: Downloader = {
      async download(_url, destPath) {
        // Write wrong content for docker-compose.yml so its checksum will not match.
        writeFileSync(
          destPath,
          destPath.endsWith('SHA256SUMS')
            ? `${sha256('right')}  docker-compose.yml\n${sha256('x')}  install.sh\n`
            : 'wrong-content'
        );
      },
    };
    await assert.rejects(
      () => fetchAndVerifyRelease('1.4.1', dir, downloader),
      /checksum mismatch/
    );
  });
});

test('fetchAndVerifyRelease: all checksums match, resolves cleanly', async () => {
  await withTempDirAsync(async (dir) => {
    const downloader: Downloader = {
      async download(url, destPath) {
        const content = url.endsWith('install.sh') ? 'install-script' : 'compose-file';
        writeFileSync(
          destPath,
          url.endsWith('SHA256SUMS')
            ? `${sha256('install-script')}  install.sh\n${sha256('compose-file')}  docker-compose.yml\n`
            : content
        );
      },
    };
    await assert.doesNotReject(() => fetchAndVerifyRelease('1.4.1', dir, downloader));
  });
});

test('scaffoldEnv: first run creates .env from example with LOG_HUB_DATA_DIR and both secrets filled', () => {
  withTempDir((dir) => {
    const examplePath = join(dir, '.env.example');
    const envPath = join(dir, '.local', '.env');
    writeFileSync(
      examplePath,
      'AUTH_MODE=none\nLOG_HUB_DATA_DIR=\nPOSTGRES_PASSWORD=\nSESSION_SECRET=\n'
    );

    scaffoldEnv(examplePath, envPath, { dataDirFor: () => '/fake/data/dir' });

    const result = readFileSync(envPath, 'utf8');
    assert.match(result, /AUTH_MODE=none/);
    assert.match(result, /LOG_HUB_DATA_DIR=\/fake\/data\/dir/);
    assert.doesNotMatch(result, /POSTGRES_PASSWORD=\n/);
    assert.doesNotMatch(result, /SESSION_SECRET=\n/);
  });
});

test('scaffoldEnv: second run is byte-identical (idempotent)', () => {
  withTempDir((dir) => {
    const examplePath = join(dir, '.env.example');
    const envPath = join(dir, '.local', '.env');
    writeFileSync(examplePath, 'LOG_HUB_DATA_DIR=\nPOSTGRES_PASSWORD=\nSESSION_SECRET=\n');

    scaffoldEnv(examplePath, envPath, { dataDirFor: () => '/fake/data/dir' });
    const firstRun = readFileSync(envPath, 'utf8');
    scaffoldEnv(examplePath, envPath, { dataDirFor: () => '/fake/data/dir' });
    const secondRun = readFileSync(envPath, 'utf8');

    assert.equal(firstRun, secondRun);
  });
});

test('scaffoldEnv: partially hand-filled .env only has its empty lines filled', () => {
  withTempDir((dir) => {
    const examplePath = join(dir, '.env.example');
    const envPath = join(dir, '.local', '.env');
    writeFileSync(examplePath, 'LOG_HUB_DATA_DIR=\nPOSTGRES_PASSWORD=\nSESSION_SECRET=\n');
    // Simulate the file already existing with one line hand-filled.
    mkdirSync(join(dir, '.local'), { recursive: true });
    writeFileSync(envPath, 'LOG_HUB_DATA_DIR=/already/set\nPOSTGRES_PASSWORD=\nSESSION_SECRET=\n');

    scaffoldEnv(examplePath, envPath, { dataDirFor: () => '/fake/data/dir' });

    const result = readFileSync(envPath, 'utf8');
    assert.match(result, /LOG_HUB_DATA_DIR=\/already\/set/);
    assert.doesNotMatch(result, /LOG_HUB_DATA_DIR=\/fake\/data\/dir/);
    assert.doesNotMatch(result, /POSTGRES_PASSWORD=\n/);
  });
});

async function withTempDirAsync(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'log-hub-init-test-async-'));
  try {
    await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
