#!/usr/bin/env node
/** Validate the plugin and marketplace manifests with `claude plugin validate`, strictly.
 *
 * `--strict` alone cannot pass here: the repo root is the plugin root and holds a CLAUDE.md, which
 * the validator warns about. That one warning is expected. Every other warning and every error
 * fails the run. Set CLAUDE_CMD to run the validator another way, for example
 * `yarn dlx --quiet -p @anthropic-ai/claude-code claude`.
 */
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { root: { type: 'string' } } });
const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
);
const [bin, ...baseArgs] = (process.env.CLAUDE_CMD ?? 'claude').split(/\s+/).filter(Boolean);
const TARGETS = ['.', '.claude-plugin/plugin.json'];

const EXPECTED_WARNINGS = [{ path: 'root', includes: 'CLAUDE.md at the plugin root' }];
const isExpected = (warning) =>
  EXPECTED_WARNINGS.some(
    (entry) => warning.path === entry.path && String(warning.message).includes(entry.includes)
  );

function validate(target) {
  const run = spawnSync(bin, [...baseArgs, 'plugin', 'validate', '--json', target], {
    cwd: root,
    encoding: 'utf8',
  });
  // A package runner (`yarn dlx`) may print install log lines before the report.
  const start = run.stdout.search(/^\{/m);
  let report;
  try {
    report = JSON.parse(start === -1 ? run.stdout : run.stdout.slice(start));
  } catch {
    return [
      `${target}: no JSON report (exit ${run.status}): ${(run.stderr || run.stdout).trim().slice(0, 200)}`,
    ];
  }
  const failures = [];
  const sections = [report.manifest, ...(report.contents ?? [])].filter(Boolean);
  for (const section of sections) {
    const label = path.relative(root, section.file) || section.file;
    for (const error of section.errors ?? [])
      failures.push(`${target}: error in ${label}: ${error.message ?? JSON.stringify(error)}`);
    for (const warning of section.warnings ?? [])
      if (!isExpected(warning))
        failures.push(`${target}: warning in ${label}: ${warning.path}: ${warning.message}`);
  }
  if (report.success === false && failures.length === 0)
    failures.push(`${target}: validator reported failure`);
  return failures;
}

const failures = TARGETS.flatMap(validate);
if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
console.log(`validate-plugin: ${TARGETS.length} target(s) clean`);
