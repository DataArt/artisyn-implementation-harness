#!/usr/bin/env node
/** Rename gate (D-01). Two rules over the repository's files:
 *
 *   1. The retired name `harness-bootstrap` appears only in history (it was never published).
 *   2. The full name `artisyn-implementation-harness` is only a package, repo, tag, ZIP or bin
 *      name. It is never a skill, folder or command (the skill is `implementation-harness`).
 *
 * In a git checkout the file list is `git ls-files` (tracked plus untracked, minus ignored), so
 * local folders like `.idea/` never count. Elsewhere the tree is walked. `--scope code` skips the
 * docs scope (docs/, CLAUDE.md, the root README.md), which the Document stage rewrites.
 * Exit 1 and a list of hits when anything is found.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: { root: { type: 'string' }, scope: { type: 'string', default: 'all' } },
});
const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
);
if (!['all', 'code'].includes(values.scope)) {
  console.error('--scope must be "all" or "code"');
  process.exit(2);
}

const SKIP_SEGMENTS = new Set(['node_modules', '.git', '.nx', '.yarn', 'dist']);
const skipped = (file) =>
  file.split('/').some((segment) => SKIP_SEGMENTS.has(segment)) ||
  file.includes('.vitepress/cache/');

/** Places where the retired name is history: directory prefixes and exact files. */
const RETIRED_NAME_ALLOWED = [
  'skills/implementation-harness/patch', // immutable bundle history
  '.harness/state', // recorded run history
  '.harness/evolve',
  '.harness/reflections',
  'docs/Stories', // story history
  'docs/.og', // generated graph
  'docs/Harness/08 Security Scan', // dated scan reports of the old package, and the index that links them
  'apps/implementation-harness-e2e/runs', // recorded agent runs
  'scripts/check-rename.mjs', // this gate
  'apps/implementation-harness-e2e/src/tests/unit/release/check-rename.spec.ts', // its spec
];
const RETIRED_NAME_ALLOWED_BASENAMES = ['CHANGELOG.md']; // released history entries

/** Story history keeps superseded names; the gate and its own spec hold deliberately wrong examples. */
const FULL_NAME_ALLOWED = [
  'docs/Stories',
  'docs/.og',
  'scripts/check-rename.mjs',
  'apps/implementation-harness-e2e/src/tests/unit/release/check-rename.spec.ts',
];
const DOCS_SCOPE = ['docs', 'CLAUDE.md', 'README.md'];

const inList = (relative, list) =>
  list.some((entry) => relative === entry || relative.startsWith(`${entry}/`));

const RETIRED = /harness-bootstrap/;
// The full name used as a command, a folder or a skill name. A command is followed by a route
// word, so the GitHub Pages base path `/artisyn-implementation-harness/` and the package, repo,
// tag, ZIP and bin forms do not match.
const ROUTE = '(?:launch|patch|reindex-graph)';
const FULL_NAME_AS_NAME = [
  new RegExp(`(?<![\\w@./-])/artisyn-implementation-harness\\s+${ROUTE}\\b`), // slash command
  new RegExp(`\\$artisyn-implementation-harness\\s+${ROUTE}\\b`), // Codex command
  /(?<![\w@-])skills\/artisyn-implementation-harness(?![\w.-])/, // folder
  /^\s*name:\s*artisyn-implementation-harness\s*$/, // skill name in frontmatter
];

/** Relative POSIX paths of the files to scan. */
function listFiles() {
  if (fs.existsSync(path.join(root, '.git'))) {
    const git = spawnSync(
      'git',
      ['-C', root, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
      { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
    );
    if (git.status === 0)
      return [...new Set(git.stdout.split('\0').filter(Boolean))].filter((file) => {
        try {
          return fs.lstatSync(path.join(root, file)).isFile();
        } catch {
          return false; // staged for deletion
        }
      });
  }
  const files = [];
  const walk = (relative) => {
    for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) walk(child);
      else if (entry.isFile()) files.push(child);
    }
  };
  walk('');
  return files;
}

const hits = [];
const isText = (buffer) => !buffer.subarray(0, 8000).includes(0);

for (const file of listFiles()) {
  if (skipped(file)) continue;
  if (values.scope === 'code' && inList(file, DOCS_SCOPE)) continue;
  const retiredAllowed =
    inList(file, RETIRED_NAME_ALLOWED) ||
    RETIRED_NAME_ALLOWED_BASENAMES.includes(path.basename(file));
  const fullNameAllowed = inList(file, FULL_NAME_ALLOWED);

  if (!retiredAllowed && RETIRED.test(file)) hits.push(`${file}: path names the retired package`);
  if (!fullNameAllowed && /(^|\/)artisyn-implementation-harness(\/|$)/.test(file))
    hits.push(`${file}: the full name used as a folder name`);

  const buffer = fs.readFileSync(path.join(root, file));
  if (!isText(buffer)) continue;
  buffer
    .toString('utf8')
    .split('\n')
    .forEach((line, index) => {
      if (!retiredAllowed && RETIRED.test(line))
        hits.push(`${file}:${index + 1}: retired name harness-bootstrap`);
      if (!fullNameAllowed && FULL_NAME_AS_NAME.some((pattern) => pattern.test(line)))
        hits.push(
          `${file}:${index + 1}: artisyn-implementation-harness used as a skill, folder or command name`
        );
    });
}

if (hits.length > 0) {
  for (const hit of hits) console.log(hit);
  console.log(`\ncheck-rename: ${hits.length} hit(s)`);
  process.exit(1);
}
console.log(`check-rename: clean (scope ${values.scope})`);
