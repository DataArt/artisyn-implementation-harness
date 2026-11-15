/** The project-level state root `.harness/state/` for launch and patch apply.
 *
 * State never lives in the package: the package is read-only and replaceable. The root is
 * resolved from the project, not from the package path or the provider folder, so every
 * provider and every channel share one state tree.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const STATE_RELATIVE = '.harness/state';
export const PACKAGE_NAME = '@dataart/artisyn-implementation-harness';

/** Appended to the project `.gitignore`: generated, per-run or per-machine files. */
export const IGNORE_ENTRIES = [
  `${STATE_RELATIVE}/objects/`,
  `${STATE_RELATIVE}/launch/runs/`,
  `${STATE_RELATIVE}/launch/reports/`,
  `${STATE_RELATIVE}/launch/package.local.json`,
];

const PROVIDER_SKILL_FOLDERS = ['.claude/skills', '.agents/skills', '.github/skills'];
const PLUGIN_CACHE_ROOTS = ['.claude/plugins', '.codex/plugins', '.copilot/plugins'];
const PACKAGE_FOLDER = 'implementation-harness';
const CACHE_SEARCH_DEPTH = 8;

/** `ARTISYN_HARNESS_PROJECT_ROOT` (CI and tests), then the git top level, then the cwd. */
export function resolveProjectRoot({ env = process.env, cwd = process.cwd() } = {}) {
  const forced = env.ARTISYN_HARNESS_PROJECT_ROOT;
  if (forced) return path.resolve(forced);
  const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' });
  if (git.status === 0 && git.stdout.trim()) return path.resolve(git.stdout.trim());
  return path.resolve(cwd);
}

export const stateDirOf = (root) => path.join(root, ...STATE_RELATIVE.split('/'));

/** Create the state root and the launch folder; returns the state root. */
export function ensureStateDirs(root) {
  const state = stateDirOf(root);
  fs.mkdirSync(path.join(state, 'launch'), { recursive: true });
  return state;
}

/** Append the ignore entries that are missing. Idempotent; never removes or untracks anything. */
export function ensureGitignore(root) {
  const file = path.join(root, '.gitignore');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const present = new Set(existing.split(/\r?\n/));
  const added = IGNORE_ENTRIES.filter((entry) => !present.has(entry));
  if (added.length === 0) return { added };
  const separator = existing === '' || existing.endsWith('\n') ? '' : '\n';
  const header = present.has('# Artisyn implementation harness: generated state')
    ? ''
    : '# Artisyn implementation harness: generated state\n';
  fs.writeFileSync(file, `${existing}${separator}${header}${added.join('\n')}\n`);
  return { added };
}

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

/** Split the `package:` record: the committed identity and the ignored per-machine path. */
export function writePackageRecord(root, { name, version, channel, path: packagePath }) {
  const launch = path.join(stateDirOf(root), 'launch');
  writeJson(path.join(launch, 'package.json'), { name, version, channel });
  writeJson(path.join(launch, 'package.local.json'), { path: packagePath });
}

/** The name and version of an installed package folder, from its `package.json`. */
export function readPackageIdentity(packageDir) {
  try {
    const { name, version } = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')
    );
    if (typeof name === 'string' && typeof version === 'string') return { name, version };
  } catch {
    // fall through to the SKILL.md stamp
  }
  try {
    const skill = fs.readFileSync(path.join(packageDir, 'SKILL.md'), 'utf8');
    const version = skill.match(/^\s+version:\s*"?([^"\s]+)"?\s*$/m)?.[1];
    if (version) return { name: PACKAGE_NAME, version };
  } catch {
    // no readable identity
  }
  return null;
}

const matches = (dir, record) => {
  const identity = readPackageIdentity(dir);
  return identity !== null && identity.name === record.name && identity.version === record.version;
};

function* findInCache(dir, depth) {
  if (depth < 0) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name === PACKAGE_FOLDER) yield full;
    else yield* findInCache(full, depth - 1);
  }
}

/** The installed package matching the recorded name and version: the local path if it still
 * matches, else the provider skills folders of the project, else the host plugin caches.
 * Rewrites the local file when it finds a different location; returns null when nothing matches.
 */
export function resolvePackagePath(root, { home = os.homedir() } = {}) {
  const launch = path.join(stateDirOf(root), 'launch');
  const record = JSON.parse(fs.readFileSync(path.join(launch, 'package.json'), 'utf8'));
  const localFile = path.join(launch, 'package.local.json');
  let recorded = null;
  try {
    recorded = JSON.parse(fs.readFileSync(localFile, 'utf8')).path;
  } catch {
    // missing or unreadable: re-resolve below
  }
  if (recorded && matches(recorded, record)) return recorded;

  const candidates = PROVIDER_SKILL_FOLDERS.map((folder) =>
    path.join(root, folder, PACKAGE_FOLDER)
  );
  for (const cache of PLUGIN_CACHE_ROOTS)
    candidates.push(...findInCache(path.join(home, cache), CACHE_SEARCH_DEPTH));
  const found = candidates.find((candidate) => matches(candidate, record));
  if (!found) return null;
  writeJson(localFile, { path: found });
  return found;
}
