#!/usr/bin/env node
/** Copy the legacy shim into the package so the npm tarball and the release ZIP carry it.
 *
 * The shim's source of truth is `skills/harness-bootstrap/SKILL.md`: the plugin and skills.sh find it
 * there. The package copy at `skills/implementation-harness/legacy/harness-bootstrap/SKILL.md`
 * is generated and ignored by git. Run by `prepack` and by the release ZIP step.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { root: { type: 'string' } } });
const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
);
const source = path.join(root, 'skills/harness-bootstrap/SKILL.md');
const target = path.join(root, 'skills/implementation-harness/legacy/harness-bootstrap/SKILL.md');

if (!fs.existsSync(source)) {
  // From 5.0.0 the shim is gone; the package then ships no legacy copy.
  fs.rmSync(target, { force: true });
  console.log('pack-shim: no shim source, nothing to pack');
} else {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`pack-shim: ${path.relative(root, source)} -> ${path.relative(root, target)}`);
}
