#!/usr/bin/env node
// Zips .claude/skills/harness-bootstrap at its current CHANGELOG.md version into releases/.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILL_DIR = path.join(ROOT, '.claude', 'skills', 'harness-bootstrap');
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
  const zipName = `artisyn-harness-bootstrap-v${version}.zip`;
  const outPath = path.join(RELEASES_DIR, zipName);

  if (fs.existsSync(outPath) && !force) {
    console.error(`${outPath} already exists. Pass --force to overwrite.`);
    process.exit(1);
  }

  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  if (fs.existsSync(outPath)) fs.rmSync(outPath);

  const result = spawnSync(
    'zip',
    ['-r', '-X', outPath, 'harness-bootstrap', '-x', '*.DS_Store', 'harness-bootstrap/state/*'],
    {
      cwd: path.join(ROOT, '.claude', 'skills'),
      stdio: 'inherit',
    }
  );
  if (result.status !== 0) {
    throw new Error(`zip failed with exit code ${result.status}`);
  }

  console.log(`\nReleased harness-bootstrap v${version} -> ${path.relative(ROOT, outPath)}`);
}

main();
