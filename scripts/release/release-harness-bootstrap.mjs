#!/usr/bin/env node
// Zips .canonical-implementation-harness at its current CHANGELOG.md version into releases/.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILL_DIR = path.join(ROOT, '.canonical-implementation-harness');
const CHANGELOG = path.join(SKILL_DIR, 'CHANGELOG.md');
const RELEASES_DIR = path.join(ROOT, 'releases', 'harness-bootstrap');

function readCurrentVersion() {
  const text = fs.readFileSync(CHANGELOG, 'utf8');
  const match = text.match(/^##\s+(\d+\.\d+\.\d+)\s*$/m);
  if (!match) throw new Error(`No "## X.Y.Z" heading found in ${CHANGELOG}`);
  return match[1];
}

function main() {
  const force = process.argv.includes('--force');
  const version = readCurrentVersion();
  const outputIndex = process.argv.indexOf('--out');
  const zipName = `artisyn-harness-bootstrap-v${version}.zip`;
  const outPath =
    outputIndex >= 0
      ? path.resolve(process.argv[outputIndex + 1] ?? '')
      : path.join(RELEASES_DIR, zipName);
  if (outputIndex >= 0 && !process.argv[outputIndex + 1])
    throw new Error('--out requires an archive path');

  if (fs.existsSync(outPath) && !force) {
    console.error(`${outPath} already exists. Pass --force to overwrite.`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (fs.existsSync(outPath)) fs.rmSync(outPath);

  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-release-'));
  try {
    fs.cpSync(SKILL_DIR, path.join(staging, 'harness-bootstrap'), {
      recursive: true,
      filter: (source) => source !== path.join(SKILL_DIR, 'state'),
    });
    const result = spawnSync(
      'zip',
      ['-r', '-X', outPath, 'harness-bootstrap', '-x', '*.DS_Store', 'harness-bootstrap/state/*'],
      {
        cwd: staging,
        stdio: 'inherit',
      }
    );
    if (result.status !== 0) {
      throw new Error(`zip failed with exit code ${result.status}`);
    }
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }

  console.log(`\nPackaged harness-bootstrap v${version} -> ${outPath}`);
}

main();
