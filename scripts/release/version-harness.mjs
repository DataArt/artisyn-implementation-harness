#!/usr/bin/env node
/** Version the harness on the feature branch, or check that a PR did (TD-5).
 *
 * The version comes from the latest harness tag reachable from HEAD plus the conventional commits
 * after it (Nx Release), so a re-run gives the same result. Write mode stamps package.json, every
 * manifest (stamp-harness-version.mjs) and the changelog entry; the developer commits them as
 * `chore(harness-release): <version>` and pushes like any commit. `--check` keeps nothing it
 * writes and exits 1 when the branch is not stamped with the computed version; it is the version
 * gate on every PR. It also fails while the base branch (`--base`, default origin/main) carries a
 * version that is not released yet and this branch changes the harness: that release is waiting
 * for approval, and its tag is what the next version is computed from. After the merge,
 * release-harness.yml builds the version main carries and, once approved, tags and publishes it.
 * Set NX_CMD to run Nx another way (the tests use a fake).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    root: { type: 'string' },
    check: { type: 'boolean', default: false },
    base: { type: 'string', default: 'origin/main' },
  },
});
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(values.root ?? path.join(scriptDir, '..', '..'));
const onWindows = process.platform === 'win32';

const PROJECT = 'artisyn-implementation-harness';
const TAG_PREFIX = `${PROJECT}-v`;
const PACKAGE_JSON = path.join(root, 'skills/implementation-harness/package.json');
const CHANGELOG = path.join(root, 'skills/implementation-harness/CHANGELOG.md');
const [nxBin, ...nxBase] = (process.env.NX_CMD ?? 'yarn nx').split(/\s+/).filter(Boolean);

const readVersion = () => JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8')).version;
const parse = (version) => version.split('.').map(Number);
const greater = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

function run(bin, args, quiet) {
  const result = spawnSync(bin, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: quiet ? 'pipe' : 'inherit',
    shell: onWindows,
  });
  if (result.status !== 0) {
    if (quiet) process.stderr.write(`${result.stdout ?? ''}${result.stderr ?? ''}`);
    throw new Error(`${bin} ${args.join(' ')} exited ${result.status}`);
  }
  return result;
}
const nx = (args, quiet) =>
  run(nxBin, [...nxBase, 'release', ...args, `--projects=${PROJECT}`], quiet);
const stamp = (args, quiet) =>
  run(
    process.execPath,
    [path.join(scriptDir, 'stamp-harness-version.mjs'), '--root', root, ...args],
    quiet
  );

function latestTagVersion() {
  const tags = spawnSync(
    'git',
    ['tag', '--merged', 'HEAD', '--list', `${TAG_PREFIX}*`, '--sort=-version:refname'],
    { cwd: root, encoding: 'utf8' }
  );
  const tag = tags.stdout?.split('\n').find(Boolean);
  if (!tag) {
    console.error(`No ${TAG_PREFIX}* tag is reachable from HEAD. Fetch tags: git fetch --tags`);
    process.exit(1);
  }
  return tag.slice(TAG_PREFIX.length);
}

const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });

/** The version the base branch carries when it is above the last release: merged, not yet tagged. */
function pendingOnBase(released) {
  const shown = git(['show', `${values.base}:skills/implementation-harness/package.json`]);
  if (shown.status !== 0) return null; // no such base, or no package there yet
  const version = JSON.parse(shown.stdout).version;
  return greater(version, released) ? version : null;
}
const changesHarness = () =>
  git(['diff', '--quiet', `${values.base}...HEAD`, '--', 'skills/implementation-harness'])
    .status !== 0;

/** Changelog sections are `# <version> (<date>)`; the curated history below them has no version. */
const ENTRY = /^# (\d+\.\d+\.\d+)\b.*$/gm;
const unreleasedEntries = (text, released) =>
  [...text.matchAll(ENTRY)].map((m) => m[1]).filter((version) => greater(version, released));

/** Drop entries for versions above the last release that are not this one: left by an earlier run. */
function dropStaleEntries(released, next) {
  const text = fs.readFileSync(CHANGELOG, 'utf8');
  const heads = [...text.matchAll(/^# .*$/gm)];
  let kept = text;
  for (let i = heads.length - 1; i >= 0; i--) {
    const version = /^# (\d+\.\d+\.\d+)\b/.exec(heads[i][0])?.[1];
    if (!version || version === next || !greater(version, released)) continue;
    const end = i + 1 < heads.length ? heads[i + 1].index : kept.length;
    kept = kept.slice(0, heads[i].index) + kept.slice(end);
  }
  if (kept !== text) fs.writeFileSync(CHANGELOG, kept);
}

const released = latestTagVersion();
const versionArgs = ['version', '--git-commit=false', '--git-tag=false', '--stage-changes=false'];

if (values.check) {
  const original = fs.readFileSync(PACKAGE_JSON, 'utf8');
  const stamped = readVersion();
  let next;
  try {
    nx(versionArgs, true);
    next = readVersion();
  } finally {
    fs.writeFileSync(PACKAGE_JSON, original);
  }
  const problems = [];
  const pending = pendingOnBase(released);
  if (pending && changesHarness()) {
    console.error(
      `version-harness: ${values.base} carries ${pending}, which is not released yet. Approve its release in the \`release\` environment, then re-run this check.`
    );
    process.exit(1);
  }
  if (stamped !== next)
    problems.push(
      `the harness is stamped ${stamped}, but its commits since ${released} make it ${next}`
    );
  const changelog = fs.readFileSync(CHANGELOG, 'utf8');
  const entries = unreleasedEntries(changelog, released);
  if (next !== released && !entries.includes(next))
    problems.push(`CHANGELOG.md has no entry for ${next}`);
  for (const version of entries.filter((version) => version !== next))
    problems.push(`CHANGELOG.md has an entry for ${version}, which this branch does not release`);
  try {
    stamp(['--check'], true);
  } catch {
    problems.push('the manifests do not match package.json (see above)');
  }
  if (problems.length > 0) {
    for (const problem of problems) console.error(`version-harness: ${problem}`);
    console.error('Run `yarn harness:version` on the branch and commit the result.');
    process.exit(1);
  }
  console.log(
    next === released
      ? `version-harness: no harness release on this branch (stays ${released})`
      : `version-harness: stamped ${next} matches the commits since ${released}`
  );
} else {
  nx(versionArgs, false);
  const next = readVersion();
  stamp([], false);
  if (next === released) {
    console.log(`\nNo harness release on this branch: the version stays ${released}.`);
  } else {
    dropStaleEntries(released, next);
    nx(
      [
        'changelog',
        next,
        '--git-commit=false',
        '--git-tag=false',
        '--git-push=false',
        '--stage-changes=false',
      ],
      false
    );
    console.log(`\nHarness stamped ${next}. Commit it: chore(harness-release): ${next}`);
  }
}
