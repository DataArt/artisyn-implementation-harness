#!/usr/bin/env node
/** Every commit that touches the harness package carries scope `harness` (or `harness-release`
 * for the version commit), so harness changes stand apart in the history and in the changelog
 * Nx Release writes from them.
 *
 * Message mode, for the `commit-msg` hook:
 *   check-commit-scope.mjs --message-file FILE [--files a,b]   (files default to the staged ones)
 * Range mode, for CI:
 *   check-commit-scope.mjs --range BASE..HEAD [--root DIR]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    'message-file': { type: 'string' },
    files: { type: 'string' },
    range: { type: 'string' },
    root: { type: 'string' },
  },
});
const root = path.resolve(values.root ?? process.cwd());

const HARNESS_PATHS = [
  /^skills\/implementation-harness\//,
  /^skills\/\.claude-plugin\//,
  /^\.claude-plugin\//,
  /^\.agents\/plugins\//,
  /^\.github\/plugin\//,
  /^skills\.sh\.json$/,
];
const ALLOWED_SCOPES = new Set(['harness', 'harness-release']);

const isHarnessFile = (file) => HARNESS_PATHS.some((pattern) => pattern.test(file));
const scopeOf = (subject) => /^\w+(?:\(([^)]*)\))?!?:/.exec(subject)?.[1];

function git(args) {
  const run = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${run.stderr.trim()}`);
  return run.stdout;
}

/** A problem description, or null when the commit is fine. */
function problem(label, subject, files) {
  const harness = files.filter(isHarnessFile);
  if (harness.length === 0) return null;
  const scope = scopeOf(subject);
  if (ALLOWED_SCOPES.has(scope)) return null;
  const shown =
    harness.slice(0, 3).join(', ') + (harness.length > 3 ? `, +${harness.length - 3} more` : '');
  return `${label}: "${subject}" touches harness files (${shown}) but its scope is ${scope ? `"${scope}"` : 'missing'}. Use scope harness, for example feat(harness): ...`;
}

const failures = [];
if (values.range) {
  const log = git(['log', '--no-merges', '--format=%h%x09%s', values.range]).trim();
  for (const line of log ? log.split('\n') : []) {
    const [hash, ...rest] = line.split('\t');
    const files = git(['diff-tree', '--no-commit-id', '--name-only', '-r', '--root', '-z', hash])
      .split('\0')
      .filter(Boolean);
    const found = problem(hash, rest.join('\t'), files);
    if (found) failures.push(found);
  }
} else if (values['message-file']) {
  const subject = fs.readFileSync(values['message-file'], 'utf8').split('\n')[0].trim();
  if (!/^(Merge|Revert) /.test(subject)) {
    const files =
      values.files !== undefined
        ? values.files.split(',').filter(Boolean)
        : git(['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean);
    const found = problem('commit message', subject, files);
    if (found) failures.push(found);
  }
} else {
  console.error(
    'Usage: check-commit-scope.mjs --message-file FILE [--files a,b] | --range BASE..HEAD'
  );
  process.exit(2);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log('check-commit-scope: ok');
