import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PROJECT_ROOT = join(__dirname, '..');

export const DEFAULT_SERVER_URL = 'http://127.0.0.1:5003';

/** Resolves the target server: `LOG_HUB_SERVER_URL` if set, else the loopback default. */
export function resolveServerUrl(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_HUB_SERVER_URL?.trim() || DEFAULT_SERVER_URL;
}

function isLoopback(serverUrl: string): boolean {
  try {
    const { hostname } = new URL(serverUrl);
    return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';
  } catch {
    return false;
  }
}

/**
 * Disclosure text shown before every install/upgrade — recomputed per call so it always names
 * the actual target, and adds an explicit non-loopback warning when `LOG_HUB_SERVER_URL` points
 * elsewhere: Mode 1 (`AUTH_MODE=none`) has no authentication of its own, so a non-loopback target
 * must already enforce access control by some other means (network policy, reverse proxy, etc).
 */
export function disclosureText(serverUrl: string): string {
  const remoteWarning = isLoopback(serverUrl)
    ? ''
    : `\n  WARNING: ${serverUrl} is not loopback-only. Log Hub's own auth mode (Mode 1,
  AUTH_MODE=none) has no built-in authentication — confirm this server already restricts access
  by some other means (network policy, reverse proxy, VPN) before continuing.\n`;
  return `Artisyn Log Hub uploads, to ${serverUrl}:
  - full Claude Code transcripts of this project (prompts, tool inputs/results, file
    contents, command output), including earlier sessions still on disk; transcripts
    are not redacted
  - git metadata (remote URL without credentials, user.name, branch) and project context
  - OpenTelemetry cost/usage records
${remoteWarning}
See "docs/Engineering Guide/07 Log Hub Setup.md" for the full disclosure.`;
}

export interface Prompter {
  confirm(message: string): Promise<boolean>;
  ask(message: string): Promise<string>;
}

export const readlinePrompter: Prompter = {
  confirm(message) {
    return new Promise((resolve) => {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      rl.question(`${message} (type "yes" to continue): `, (answer) => {
        rl.close();
        resolve(answer.trim() === 'yes');
      });
    });
  },
  ask(message) {
    return new Promise((resolve) => {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      rl.question(`${message}: `, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  },
};

export interface HookInstallerRunner {
  run(args: string[], cwd: string, tarballUrl: string): void;
}

/**
 * Runs the hook installer via `npx`. Confirmed necessary, not just preferred: `yarn dlx` refuses
 * a plain `http://` package source ("Unsafe http requests must be explicitly whitelisted") and
 * this server is loopback-only Mode 1 by default (Decision 2), so there is no https URL to give
 * it instead. The tarball is always fetched from the resolved server (loopback or remote), never
 * a separate location.
 */
export const npxHookInstallerRunner: HookInstallerRunner = {
  run(args, cwd, tarballUrl) {
    execFileSync('npx', ['--yes', '-p', tarballUrl, 'artisyn-hooks', ...args], {
      cwd,
      stdio: 'inherit',
    });
  },
};

export interface ClaudeCliRunner {
  run(args: string[], cwd: string): void;
}

export const execFileClaudeCliRunner: ClaudeCliRunner = {
  run(args, cwd) {
    execFileSync('claude', args, { cwd, stdio: 'inherit' });
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

/** Extracts the installer-chosen marketplace name (`artisyn-<hash>`) from a settings.json string. */
export function extractMarketplaceName(settingsJson: string): string {
  const match = /"enabledPlugins"\s*:\s*\{\s*"log-hub-hooks@([\w-]+)"/.exec(settingsJson);
  if (!match) {
    throw new Error(
      'install-hook: could not find a log-hub-hooks@<marketplace> key in .claude/settings.json after install'
    );
  }
  return match[1];
}

export interface InstallHookOptions {
  mode: 'install' | 'upgrade';
  apiKey?: string;
  serverUrl?: string;
  prompter?: Prompter;
  installerRunner?: HookInstallerRunner;
  claudeRunner?: ClaudeCliRunner;
  repoRoot?: string;
}

/**
 * Installs or upgrades the Log Hub Claude Code hook, then re-registers the plugin at **local**
 * scope and restores `.claude/settings.json` to its pre-run content — fails closed (throws)
 * if the restored file does not match the pre-run snapshot exactly.
 */
export async function installHook(options: InstallHookOptions): Promise<void> {
  const repoRoot = options.repoRoot ?? findRepoRoot(DEFAULT_PROJECT_ROOT);
  const prompter = options.prompter ?? readlinePrompter;
  const installerRunner = options.installerRunner ?? npxHookInstallerRunner;
  const claudeRunner = options.claudeRunner ?? execFileClaudeCliRunner;
  const settingsPath = join(repoRoot, '.claude', 'settings.json');
  const serverUrl = options.serverUrl ?? resolveServerUrl();
  const tarballUrl = `${serverUrl}/static/artisyn-hooks-installer.tgz`;

  const confirmed = await prompter.confirm(disclosureText(serverUrl));
  if (!confirmed) {
    throw new Error('install-hook: not confirmed — nothing installed.');
  }

  let apiKey = options.apiKey;
  if (options.mode === 'install' && !apiKey) {
    apiKey = await prompter.ask('Log Hub API key');
  }

  const preRunSnapshot = existsSync(settingsPath) ? readFileSync(settingsPath, 'utf8') : '{}';
  let marketplaceName: string;

  // Restore settings.json unconditionally, even if the installer or marketplace extraction
  // throws — a half-finished run must never leave the committed file modified.
  try {
    const args =
      options.mode === 'install'
        ? ['install', '--server-url', serverUrl, '--api-key', apiKey ?? '', '--otel-traces=no']
        : ['upgrade'];
    installerRunner.run(args, repoRoot, tarballUrl);
    marketplaceName = extractMarketplaceName(readFileSync(settingsPath, 'utf8'));
  } finally {
    writeFileSync(settingsPath, preRunSnapshot);
  }

  const restored = readFileSync(settingsPath, 'utf8');
  if (restored !== preRunSnapshot) {
    throw new Error(
      'install-hook: .claude/settings.json did not restore to its pre-run content — aborting.'
    );
  }

  claudeRunner.run(
    ['plugin', 'marketplace', 'add', './.artisyn/marketplace', '--scope', 'local'],
    repoRoot
  );
  claudeRunner.run(
    ['plugin', 'install', `log-hub-hooks@${marketplaceName}`, '--scope', 'local', '-y'],
    repoRoot
  );
}

async function main(): Promise<void> {
  const mode = process.argv.includes('--upgrade') ? 'upgrade' : 'install';
  console.log(`log-hub:${mode === 'upgrade' ? 'upgrade-hook' : 'install-hook'} — starting...`);
  await installHook({ mode, apiKey: process.env.LOG_HUB_API_KEY });
  console.log(
    `log-hub:${mode === 'upgrade' ? 'upgrade-hook' : 'install-hook'} — done. .claude/settings.json unchanged; plugin registered at local scope.`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
