import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveServerUrl } from './install-hook.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PROJECT_ROOT = join(__dirname, '..');

export interface UninstallerRunner {
  run(args: string[], cwd: string, tarballUrl: string): void;
}

export const npxUninstallerRunner: UninstallerRunner = {
  run(args, cwd, tarballUrl) {
    execFileSync('npx', ['--yes', '-p', tarballUrl, 'artisyn-hooks', ...args], {
      cwd,
      stdio: 'inherit',
    });
  },
};

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

/**
 * Removes any `log-hub-hooks@*` / `artisyn-*` keys left in `.claude/settings.local.json` by our
 * own local-scope registration — the gap upstream's own `uninstall` does not cover, because it
 * only knows about the project-scope keys it itself writes. Idempotent: safe to call when the
 * file or the keys are already absent.
 */
export function stripLocalScopeKeys(settingsLocalPath: string): void {
  if (!existsSync(settingsLocalPath)) {
    return;
  }
  const raw = readFileSync(settingsLocalPath, 'utf8');
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return; // Not valid JSON — leave it alone rather than guess.
  }

  let changed = false;
  const enabledPlugins = parsed.enabledPlugins as Record<string, unknown> | undefined;
  if (enabledPlugins) {
    for (const key of Object.keys(enabledPlugins)) {
      if (key.startsWith('log-hub-hooks@')) {
        delete enabledPlugins[key];
        changed = true;
      }
    }
    if (Object.keys(enabledPlugins).length === 0) {
      delete parsed.enabledPlugins;
    }
  }

  const extraKnownMarketplaces = parsed.extraKnownMarketplaces as
    Record<string, unknown> | undefined;
  if (extraKnownMarketplaces) {
    for (const key of Object.keys(extraKnownMarketplaces)) {
      if (key.startsWith('artisyn-')) {
        delete extraKnownMarketplaces[key];
        changed = true;
      }
    }
    if (Object.keys(extraKnownMarketplaces).length === 0) {
      delete parsed.extraKnownMarketplaces;
    }
  }

  if (changed) {
    writeFileSync(settingsLocalPath, `${JSON.stringify(parsed, null, 2)}\n`);
  }
}

export interface UninstallHookOptions {
  uninstallerRunner?: UninstallerRunner;
  repoRoot?: string;
  serverUrl?: string;
}

/**
 * Uninstalls the hook: runs the upstream uninstaller (a no-op if nothing is installed under
 * `.artisyn/`), then strips any local-scope keys it left behind in `.claude/settings.local.json`.
 * Safe to run twice in a row. The uninstaller tarball is fetched from the same resolved server
 * (`LOG_HUB_SERVER_URL` override, else loopback) the hook was installed against.
 */
export function uninstallHook(options: UninstallHookOptions = {}): void {
  const repoRoot = options.repoRoot ?? findRepoRoot(DEFAULT_PROJECT_ROOT);
  const uninstallerRunner = options.uninstallerRunner ?? npxUninstallerRunner;
  const serverUrl = options.serverUrl ?? resolveServerUrl();
  const tarballUrl = `${serverUrl}/static/artisyn-hooks-installer.tgz`;

  if (existsSync(join(repoRoot, '.artisyn'))) {
    uninstallerRunner.run(['uninstall'], repoRoot, tarballUrl);
  }

  stripLocalScopeKeys(join(repoRoot, '.claude', 'settings.local.json'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('log-hub:uninstall-hook — starting...');
  try {
    uninstallHook();
    console.log('log-hub:uninstall-hook — done.');
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
