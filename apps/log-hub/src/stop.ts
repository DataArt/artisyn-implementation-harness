import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PROJECT_ROOT = join(__dirname, '..');

export interface ComposeDownRunner {
  run(args: string[]): void;
}

export const execFileComposeDownRunner: ComposeDownRunner = {
  run(args) {
    execFileSync('docker', ['compose', ...args], { cwd: DEFAULT_PROJECT_ROOT, stdio: 'inherit' });
  },
};

/** Stops the local stack if it was ever started; a no-op (not an error) if nothing to stop. */
export function stop(
  runner: ComposeDownRunner = execFileComposeDownRunner,
  projectRoot: string = DEFAULT_PROJECT_ROOT
): void {
  const composePath = join(projectRoot, '.local', 'docker-compose.yml');
  if (!existsSync(composePath)) {
    console.log('log-hub:stop — nothing to stop (log-hub:init was never run).');
    return;
  }
  runner.run(['-f', composePath, 'down']);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  stop();
}
