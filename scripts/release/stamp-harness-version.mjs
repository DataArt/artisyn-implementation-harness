#!/usr/bin/env node
/** Stamp the harness version into every file that carries it, or check that they all agree.
 *
 * `skills/implementation-harness/package.json` is the one version source. The stamp writes it into
 * the SKILL.md frontmatter of the harness and the shim, `plugin.json`, and both marketplace files
 * (their `version` and their `ref`, the release tag). `--check` writes nothing and exits 1 on any
 * mismatch; it is the version gate on every PR. Values are replaced in place, so formatting stays.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: { root: { type: 'string' }, check: { type: 'boolean', default: false } },
});
const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
);
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const version = JSON.parse(read('skills/implementation-harness/package.json')).version;
const tag = `artisyn-implementation-harness-v${version}`;

// Each pattern matches only the value itself, so a replace swaps the value and nothing else.
const JSON_VERSION = /(?<="version"\s*:\s*")[^"]*(?=")/;
const JSON_REF = /(?<="ref"\s*:\s*")[^"]*(?=")/;
const FRONTMATTER_VERSION = /(?<=^\s+version:\s*["']?)[^"'\s]+(?=["']?\s*$)/m;

/** Split a SKILL.md into its frontmatter and the rest, so the body is never touched. */
function splitFrontmatter(text) {
  const match = /^---\r?\n[\s\S]*?\r?\n---/.exec(text);
  return match ? [match[0], text.slice(match[0].length)] : ['', text];
}

const fields = [];
function addJson(file, name, pattern, expected) {
  fields.push({
    file,
    name,
    expected,
    read: (text) => pattern.exec(text)?.[0],
    write: (text) => text.replace(pattern, expected),
  });
}
function addSkill(file, optional = false) {
  if (optional && !fs.existsSync(path.join(root, file))) return;
  fields.push({
    file,
    name: 'metadata.version',
    expected: version,
    read: (text) => FRONTMATTER_VERSION.exec(splitFrontmatter(text)[0])?.[0],
    write: (text) => {
      const [head, rest] = splitFrontmatter(text);
      return head.replace(FRONTMATTER_VERSION, version) + rest;
    },
  });
}

addSkill('skills/implementation-harness/SKILL.md');
addSkill('skills/harness-bootstrap/SKILL.md', true); // gone from 5.0.0
addJson('.claude-plugin/plugin.json', 'version', JSON_VERSION, version);
for (const file of ['.claude-plugin/marketplace.json', '.agents/plugins/marketplace.json']) {
  addJson(file, 'plugins[0].version', JSON_VERSION, version);
  addJson(file, 'plugins[0].source.ref', JSON_REF, tag);
}

const files = new Map(); // relative path -> current text, updated as fields are written
for (const { file } of fields) if (!files.has(file)) files.set(file, read(file));
const mismatches = fields.filter((field) => field.read(files.get(field.file)) !== field.expected);

if (values.check) {
  for (const field of mismatches)
    console.error(
      `${field.file}: ${field.name} is ${field.read(files.get(field.file)) ?? 'missing'}, expected ${field.expected}`
    );
  if (mismatches.length > 0) process.exit(1);
  console.log(`stamp-harness-version: all ${fields.length} fields match ${version}`);
} else {
  for (const field of mismatches) {
    if (field.read(files.get(field.file)) === undefined)
      throw new Error(`${field.file}: no ${field.name} to stamp`);
    files.set(field.file, field.write(files.get(field.file)));
  }
  for (const field of mismatches)
    fs.writeFileSync(path.join(root, field.file), files.get(field.file));
  console.log(`stamp-harness-version: ${mismatches.length} field(s) updated to ${version}`);
}
