#!/usr/bin/env node
/** Resolve the baseline bytes for one canonical path from the project's `.harness/state/`.
 *
 *   resolve-base.mjs --path <canonical path> [--root <project>] [--out <file>]
 *
 * Old records are read through the legacy mapping (old release labels, the old root doc, the old
 * `adoptors/` folder); nothing is rewritten and no network call is made. The bytes always come from
 * `objects/`. Exit codes: 0 resolved; 2 usage or no such baseline entry; 3 the entry is not
 * object-backed (a `bundle:`, `git:` or `local:` snapshot: resolve it from its own source); 4 the
 * baseline object is missing (stop before writing anything).
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { legacyNamesOf, mapLegacyPath, resolveBase } from './lib/legacy-map.mjs';
import { resolveProjectRoot, stateDirOf } from './lib/state-root.mjs';

const { values } = parseArgs({
  options: { path: { type: 'string' }, root: { type: 'string' }, out: { type: 'string' } },
});
if (!values.path) {
  console.error(
    'Usage: resolve-base.mjs --path <canonical path> [--root <project>] [--out <file>]'
  );
  process.exit(2);
}

const root = values.root ? path.resolve(values.root) : resolveProjectRoot();
const stateDir = stateDirOf(root);
const indexFile = path.join(stateDir, 'index.json');
if (!fs.existsSync(indexFile)) {
  console.error(`No baseline index at ${path.relative(root, indexFile)}`);
  process.exit(2);
}

const canonical = JSON.parse(fs.readFileSync(indexFile, 'utf8')).canonical ?? {};
const key = [values.path, mapLegacyPath(values.path), ...legacyNamesOf(values.path)].find(
  (candidate) => canonical[candidate]
);
if (!key) {
  console.error(`No baseline entry for ${values.path}`);
  process.exit(2);
}

try {
  const { label, sha256, bytes } = resolveBase(stateDir, canonical[key]);
  if (values.out) fs.writeFileSync(values.out, bytes);
  console.log(JSON.stringify({ path: key, label, sha256, written: values.out ?? null }));
} catch (error) {
  console.error(error.message);
  process.exit(error.code === 'NOT_OBJECT_BACKED' ? 3 : error.code === 'MISSING_BASE' ? 4 : 1);
}
