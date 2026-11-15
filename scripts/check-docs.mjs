#!/usr/bin/env node
/** Docs lint (D-07). Install instructions must be pinned:
 *
 *   - no link to `/releases/latest`: the root `v*` releases may be newer and are not harness installs;
 *   - every `gh skill install` example carries `@<tag>`.
 *
 * Scans docs, the READMEs, CLAUDE.md, the package docs and the GitHub templates. Story folders keep
 * history and the immutable patch bundles are skipped. Exit 1 with the file and line of each hit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { root: { type: 'string' } } });
const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
);

const INCLUDE = ['docs', 'README.md', 'CLAUDE.md', 'skills', '.github'];
const SKIP = ['docs/Stories', 'docs/.og', 'skills/implementation-harness/patch'];
const TEXT = /\.(md|ya?ml|json|txt)$/i;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.vitepress']);

const inList = (relative, list) =>
  list.some((entry) => relative === entry || relative.startsWith(`${entry}/`));
const hits = [];

function scan(relative) {
  const lines = fs.readFileSync(path.join(root, relative), 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (/https?:\/\/\S*\/releases\/latest\b/.test(line))
      hits.push(
        `${relative}:${index + 1}: a /releases/latest link is never a harness install source; link the tag URL`
      );
    // An install example has a repo argument; prose that only names the command is not an example.
    const example = /gh skill install\s+[\w.-]+\/[\w.-]+(.*)$/.exec(line);
    if (example && !/\S+@\S+/.test(example[1]))
      hits.push(`${relative}:${index + 1}: gh skill install must be pinned with @<tag>`);
  });
}

function walk(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return;
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink() || inList(relative, SKIP)) return;
  if (stat.isFile()) {
    if (TEXT.test(relative)) scan(relative);
    return;
  }
  for (const entry of fs.readdirSync(absolute)) {
    if (SKIP_DIRS.has(entry)) continue;
    walk(relative ? `${relative}/${entry}` : entry);
  }
}

for (const entry of INCLUDE) walk(entry);
if (hits.length > 0) {
  for (const hit of hits) console.log(hit);
  console.log(`\ncheck-docs: ${hits.length} hit(s)`);
  process.exit(1);
}
console.log('check-docs: clean');
