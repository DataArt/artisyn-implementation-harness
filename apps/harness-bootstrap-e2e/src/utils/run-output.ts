import fs from 'node:fs';
import path from 'node:path';
import { appRoot } from './paths.ts';

/** Live agent cases cost real money and an hour of wall clock, so their
 * workspaces and results are kept rather than discarded: `vitest.agent-e2e.config.ts`
 * sets HB_E2E_PERSIST_RUNS. Unit and integration still use a throwaway OS
 * tmpdir — they create fixtures constantly and would otherwise bury `runs/`
 * in noise. HB_E2E_KEEP_TMP opts those layers in for a debugging session.
 */
export const persistRuns =
  process.env.HB_E2E_PERSIST_RUNS === '1' || process.env.HB_E2E_KEEP_TMP === '1';

export const runsRoot = path.join(appRoot, 'runs');

/** `2026-10-01T14-32-07` — sortable, and legal on every filesystem. */
function timestamp(): string {
  return new Date()
    .toISOString()
    .replace(/\.\d+Z$/, '')
    .replaceAll(':', '-');
}

let resolvedRunDir: string | undefined;
let fixtureCount = 0;

/** One directory per process, created on first use so a run that persists
 * nothing leaves nothing behind.
 */
export function runDir(): string {
  if (!resolvedRunDir) {
    resolvedRunDir = path.join(runsRoot, timestamp());
    fs.mkdirSync(resolvedRunDir, { recursive: true });
  }
  return resolvedRunDir;
}

/** `fixture/` for the usual single-workspace case; `fixture-2/` and beyond
 * for a case like patch-prepare-apply that needs two projects at once.
 */
export function nextFixtureDir(): string {
  fixtureCount += 1;
  const dir = path.join(runDir(), fixtureCount === 1 ? 'fixture' : `fixture-${fixtureCount}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Where this run's results belong. Writing them is the engine's job — see
 * `engine/run-report.ts`.
 */
export function reportFile(): string {
  return path.join(runDir(), 'report.json');
}
