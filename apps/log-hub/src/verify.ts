import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PROJECT_ROOT = join(__dirname, '..');

function findRepoRoot(from: string): string {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: from,
      encoding: 'utf8',
    }).trim();
  } catch {
    return join(from, '..', '..');
  }
}

export interface GitProbe {
  isIgnored(repoRoot: string, relativePath: string): boolean;
  trackedUnder(repoRoot: string, relativePath: string): string[];
}

export const execFileGitProbe: GitProbe = {
  isIgnored(repoRoot, relativePath) {
    try {
      execFileSync('git', ['check-ignore', '-q', relativePath], { cwd: repoRoot });
      return true;
    } catch (err) {
      // git check-ignore exits 1 when not ignored, which execFileSync throws for — distinguish
      // from an actual tooling failure (exit code > 1) by re-throwing only the latter.
      const code = (err as { status?: number }).status;
      if (code === 1) return false;
      throw err;
    }
  },
  trackedUnder(repoRoot, relativePath) {
    const out = execFileSync('git', ['ls-files', relativePath], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    return out.split('\n').filter((line) => line.length > 0);
  },
};

export interface VerifyFailure {
  assertion: string;
  message: string;
}

/**
 * Runs all four canonical-isolation assertions and returns the list of failures (empty = pass).
 * No Docker, no network — must finish in a few seconds, safe to run in CI on every PR.
 */
export function runChecks(
  repoRoot: string,
  gitProbe: GitProbe = execFileGitProbe
): VerifyFailure[] {
  const failures: VerifyFailure[] = [];
  const settingsPath = join(repoRoot, '.claude', 'settings.json');

  // 1. No Log Hub plugin keys in the committed settings.json.
  if (existsSync(settingsPath)) {
    const raw = readFileSync(settingsPath, 'utf8');
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const enabledPlugins = parsed.enabledPlugins as Record<string, unknown> | undefined;
      const stray = enabledPlugins
        ? Object.keys(enabledPlugins).filter((k) => k.startsWith('log-hub-hooks@'))
        : [];
      const extraKnownMarketplaces = parsed.extraKnownMarketplaces as
        Record<string, unknown> | undefined;
      const strayMarketplaces = extraKnownMarketplaces
        ? Object.keys(extraKnownMarketplaces).filter((k) => k.startsWith('artisyn-'))
        : [];
      if (stray.length > 0 || strayMarketplaces.length > 0) {
        failures.push({
          assertion: 'no-plugin-keys',
          message: `.claude/settings.json has Log Hub plugin keys committed: ${[...stray, ...strayMarketplaces].join(', ')}`,
        });
      }
    } catch {
      failures.push({
        assertion: 'no-plugin-keys',
        message: '.claude/settings.json is not valid JSON',
      });
    }
  }

  // 2. .artisyn/ and apps/log-hub/.local/ are gitignored and have no tracked files. Probed via a
  // placeholder path inside each directory, not the bare directory name: a directory-only
  // .gitignore pattern (trailing `/`) only matches a bare path that git can confirm is a
  // directory, which requires it to exist on disk — on a fresh clone where nobody has run
  // `log-hub:init` yet, neither directory exists, and `git check-ignore .artisyn` would (wrongly)
  // report "not ignored". A nested placeholder path needs no such confirmation.
  for (const relPath of ['.artisyn', 'apps/log-hub/.local']) {
    if (!gitProbe.isIgnored(repoRoot, `${relPath}/.verify-probe`)) {
      failures.push({
        assertion: 'gitignored',
        message: `${relPath} is not covered by .gitignore`,
      });
      continue;
    }
    const tracked = gitProbe.trackedUnder(repoRoot, relPath);
    if (tracked.length > 0) {
      failures.push({
        assertion: 'untracked',
        message: `${relPath} has tracked files: ${tracked.join(', ')}`,
      });
    }
  }

  // 3. Both permissions.deny entries are present.
  if (existsSync(settingsPath)) {
    const raw = readFileSync(settingsPath, 'utf8');
    try {
      const parsed = JSON.parse(raw) as { permissions?: { deny?: string[] } };
      const deny = parsed.permissions?.deny ?? [];
      for (const required of ['Read(./apps/log-hub/.local/**)', 'Read(./.artisyn/**)']) {
        if (!deny.includes(required)) {
          failures.push({
            assertion: 'permissions-deny',
            message: `.claude/settings.json's permissions.deny is missing "${required}"`,
          });
        }
      }
    } catch {
      failures.push({
        assertion: 'permissions-deny',
        message: '.claude/settings.json is not valid JSON',
      });
    }
  } else {
    failures.push({
      assertion: 'permissions-deny',
      message: '.claude/settings.json does not exist',
    });
  }

  // 4. canonical/settings.json's current hash matches the bootstrap's recorded hash.
  const canonicalSettingsPath = join(
    repoRoot,
    '.canonical-implementation-harness',
    'canonical',
    'settings.json'
  );
  const stateIndexPath = join(repoRoot, '.canonical-implementation-harness', 'state', 'index.json');
  if (existsSync(canonicalSettingsPath) && existsSync(stateIndexPath)) {
    const actualHash = createHash('sha256')
      .update(readFileSync(canonicalSettingsPath))
      .digest('hex');
    const stateIndex = JSON.parse(readFileSync(stateIndexPath, 'utf8')) as {
      canonical?: Record<string, { recorded_sha256?: string }>;
    };
    const recordedHash = stateIndex.canonical?.['canonical/settings.json']?.recorded_sha256;
    if (!recordedHash) {
      failures.push({
        assertion: 'canonical-hash',
        message: 'state/index.json has no recorded_sha256 for canonical/settings.json',
      });
    } else if (actualHash !== recordedHash) {
      failures.push({
        assertion: 'canonical-hash',
        message: `canonical/settings.json's hash (${actualHash}) does not match the recorded hash (${recordedHash})`,
      });
    }
  }

  return failures;
}

function main(): void {
  const repoRoot = findRepoRoot(DEFAULT_PROJECT_ROOT);
  const failures = runChecks(repoRoot);
  if (failures.length === 0) {
    console.log('log-hub:verify — canonical isolation holds. All checks passed.');
    return;
  }
  console.error('log-hub:verify — FAILED:');
  for (const f of failures) {
    console.error(`  [${f.assertion}] ${f.message}`);
  }
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
