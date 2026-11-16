#!/usr/bin/env node
/** Docs lint (D-07). Install instructions must work as written:
 *
 *   - no link to `/releases/latest`: it moves with every release; link the tag instead;
 *   - every `gh skill install` example carries `@<tag>`;
 *   - the full name `artisyn-implementation-harness` is only a package, repo, tag, ZIP or bin name,
 *     never a skill, folder or command (the skill is `implementation-harness`).
 *
 * Scans docs, the READMEs, CLAUDE.md, the skills, the agent and plugin folders and the GitHub
 * templates. Story folders keep history and the immutable patch bundles are skipped. Exit 1 with
 * the file and line of each hit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { root: { type: 'string' } } });
const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
);

const INCLUDE = [
  'docs',
  'README.md',
  'CLAUDE.md',
  'skills',
  '.claude',
  '.agents',
  '.claude-plugin',
  '.github',
];
const SKIP = ['docs/Stories', 'docs/.og', 'skills/implementation-harness/patch'];
const TEXT = /\.(md|ya?ml|json|txt)$/i;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.vitepress']);

// The full name used as a command, a folder or a skill name. A command is followed by a route word,
// so the GitHub Pages base path `/artisyn-implementation-harness/` and the package, repo, tag, ZIP
// and bin forms do not match.
const ROUTE = '(?:launch|patch|reindex-graph)';
const FULL_NAME_AS_NAME = [
  new RegExp(`(?<![\\w@./-])/artisyn-implementation-harness\\s+${ROUTE}\\b`), // slash command
  new RegExp(`\\$artisyn-implementation-harness\\s+${ROUTE}\\b`), // Codex command
  /(?<![\w@-])skills\/artisyn-implementation-harness(?![\w.-])/, // folder
  /^\s*name:\s*artisyn-implementation-harness\s*$/, // skill name in frontmatter
];
const FULL_NAME_HINT = 'the skill is implementation-harness';

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
    if (FULL_NAME_AS_NAME.some((pattern) => pattern.test(line)))
      hits.push(
        `${relative}:${index + 1}: artisyn-implementation-harness used as a skill, folder or command name; ${FULL_NAME_HINT}`
      );
  });
}

function walk(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return;
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink() || inList(relative, SKIP)) return;
  if (/(^|\/)artisyn-implementation-harness$/.test(relative))
    hits.push(`${relative}: the full name used as a folder name; ${FULL_NAME_HINT}`);
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
