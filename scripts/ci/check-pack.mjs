#!/usr/bin/env node
/** Package allowlist gate (D-08). `yarn pack --dry-run` in the harness package lists exactly the
 * files the npm tarball and the release ZIP will carry. This fails when a required file is
 * missing or when anything outside the allowlist, or anything forbidden, would ship.
 */
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { root: { type: 'string' } } });
const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
);
const packageDir = path.join(root, 'skills/implementation-harness');

const ALLOWED_TOP = new Set([
  'package.json',
  'SKILL.md',
  'README.md',
  'CHANGELOG.md',
  'implementation-harness.md',
  'bin',
  'canonical',
  'patch',
  'patterns',
  'references',
  'reports',
  'scripts',
]);
const REQUIRED = ['package.json', 'SKILL.md', 'bin/artisyn-implementation-harness.mjs'];
const FORBIDDEN = [
  /(^|\/)state(\/|$)/,
  /(^|\/)\.DS_Store$/,
  /(^|\/)\.env/,
  /\.local\./,
  /(^|\/)fixtures(\/|$)/,
  /(^|\/)node_modules(\/|$)/,
];

const pack = spawnSync('yarn', ['pack', '--dry-run', '--json'], {
  cwd: packageDir,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  shell: process.platform === 'win32',
});
if (pack.status !== 0) {
  console.error(`yarn pack --dry-run failed:\n${pack.stderr || pack.stdout}`);
  process.exit(1);
}

const files = pack.stdout
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    try {
      return JSON.parse(line).location;
    } catch {
      return undefined;
    }
  })
  .filter(Boolean);

const problems = [];
for (const required of REQUIRED)
  if (!files.includes(required)) problems.push(`missing from the package: ${required}`);
for (const file of files) {
  const top = file.split('/')[0];
  if (!ALLOWED_TOP.has(top)) problems.push(`outside the allowlist: ${file}`);
  if (FORBIDDEN.some((pattern) => pattern.test(file)))
    problems.push(`forbidden in the package: ${file}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
console.log(`check-pack: ${files.length} files, allowlist and required files ok`);
