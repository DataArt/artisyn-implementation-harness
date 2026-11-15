import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAndVerifyRelease, readVersion } from './init.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PROJECT_ROOT = join(__dirname, '..');

export interface ComposeRunner {
  run(args: string[]): void;
}

export const execFileComposeRunner: ComposeRunner = {
  run(args) {
    execFileSync('docker', ['compose', ...args], { cwd: DEFAULT_PROJECT_ROOT, stdio: 'inherit' });
  },
};

function paths(projectRoot: string) {
  const localDir = join(projectRoot, '.local');
  return {
    localDir,
    composePath: join(localDir, 'docker-compose.yml'),
    envPath: join(localDir, '.env'),
  };
}

/**
 * Brings the already-initialized local Log Hub stack up. Aborts with a clear message if
 * `log-hub:init` has not been run yet (no `.local/docker-compose.yml` present) — never attempts
 * a Docker call against a missing compose file.
 */
export function serve(
  runner: ComposeRunner = execFileComposeRunner,
  projectRoot: string = DEFAULT_PROJECT_ROOT
): void {
  const { composePath, envPath } = paths(projectRoot);
  if (!existsSync(composePath)) {
    throw new Error('log-hub:serve — nothing to serve yet. Run "yarn nx run log-hub:init" first.');
  }
  runner.run(['--env-file', envPath, '-f', composePath, 'pull']);
  runner.run(['--env-file', envPath, '-f', composePath, 'up', '-d']);
}

/**
 * Re-downloads and re-verifies the pinned release (never touching `.local/.env`), then brings
 * the stack up on the refreshed image — the same effect as `serve`, applied after a version bump.
 */
export async function upgrade(
  fetchAndVerify: typeof fetchAndVerifyRelease = fetchAndVerifyRelease,
  runner: ComposeRunner = execFileComposeRunner,
  projectRoot: string = DEFAULT_PROJECT_ROOT
): Promise<void> {
  const version = readVersion(join(projectRoot, '.env.example'));
  await fetchAndVerify(version, paths(projectRoot).localDir);
  serve(runner, projectRoot);
}

async function main(): Promise<void> {
  if (process.argv.includes('--upgrade')) {
    console.log('log-hub:upgrade — refreshing release and restarting...');
    await upgrade();
    console.log('log-hub:upgrade — done.');
  } else {
    console.log('log-hub:serve — starting...');
    serve();
    console.log('log-hub:serve — up on 127.0.0.1:5003.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
