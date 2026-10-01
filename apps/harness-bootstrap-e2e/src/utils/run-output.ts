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

function slug(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'run';
}

interface RunDir {
  path: string;
  fixtures: number;
}

const dirs = new Map<string, RunDir>();

/** One directory per case, named `<datetime>-<case-id>` so several runs are
 * distinguishable at a glance. Created on first use, so a case that persists
 * nothing leaves nothing behind, and memoized so every workspace and the
 * report of one case land together.
 */
export function runDir(caseId: string): string {
  let dir = dirs.get(caseId);
  if (!dir) {
    dir = { path: path.join(runsRoot, `${timestamp()}-${slug(caseId)}`), fixtures: 0 };
    dirs.set(caseId, dir);
    fs.mkdirSync(dir.path, { recursive: true });
  }
  return dir.path;
}

/** `fixture/` for the usual single-workspace case; `fixture-2/` and beyond
 * for a case like patch-prepare-apply that needs two projects at once.
 */
export function nextFixtureDir(caseId: string): string {
  const base = runDir(caseId);
  const entry = dirs.get(caseId)!;
  entry.fixtures += 1;
  const dir = path.join(base, entry.fixtures === 1 ? 'fixture' : `fixture-${entry.fixtures}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Where a case's result belongs. Writing it is the engine's job — see
 * `engine/run-report.ts`.
 */
export function reportFile(caseId: string): string {
  return path.join(runDir(caseId), 'report.json');
}
