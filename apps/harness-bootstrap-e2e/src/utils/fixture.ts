import { PROVIDERS, PROVIDER_DETAILS } from './providers.ts';
import type { Provider } from './providers.ts';
import type { FixtureDefinition } from '../../fixtures/_registry.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fixturesRoot, skillPackageRoot } from './paths.ts';
import { nextFixtureDir, persistRuns } from './run-output.ts';
import { CLEANUP_WORKSPACES } from './constants.ts';

/** Default location; installSkillPackage resets this to the chosen host discovery root. */
const PACKAGE_RELATIVE_PATH = `${PROVIDER_DETAILS[PROVIDERS.claude].skills}/harness-bootstrap`;

export interface Workspace {
  fixture: FixtureDefinition;
  /** Scratch project root — a fresh copy per test, never the source fixture. */
  root: string;
  /** Where the harness-bootstrap package copy lives inside this workspace,
   * once `installSkillPackage()` has been called.
   */
  packageRoot: string;
  cleanup(): Promise<void>;
}

const live = new Set<string>();
let cleanupHookRegistered = false;

/** Best-effort backstop: if a test forgets to call `cleanup()` (e.g. it threw
 * before reaching it), still remove the scratch dir on process exit rather
 * than leaking tmpdirs across the machine.
 */
function registerCleanupHook() {
  if (cleanupHookRegistered) return;
  cleanupHookRegistered = true;
  process.on('exit', () => {
    for (const dir of live) fs.rmSync(dir, { recursive: true, force: true });
  });
}

/** Copies fixtures/<name> into a fresh scratch workspace. Every test gets its
 * own isolated filesystem state; nothing is ever run against the fixture
 * source directory itself. Persisted runs land under `runs/<datetime>-<caseId>/`;
 * everything else gets an OS tmpdir, removed afterwards only when
 * `CLEANUP_WORKSPACES` is on.
 */
export async function createFixture(
  fixture: FixtureDefinition,
  caseId = 'run'
): Promise<Workspace> {
  if (!fixture.populated) throw new Error(`Fixture ${fixture.id} is not populated`);
  const source = path.join(fixturesRoot, fixture.path);
  if (!fs.existsSync(source)) throw new Error(`Unknown fixture: ${fixture.id}`);
  const root = persistRuns
    ? nextFixtureDir(caseId)
    : fs.mkdtempSync(path.join(os.tmpdir(), `hb-e2e-${fixture.id}-`));
  fs.cpSync(source, root, { recursive: true });
  const packageRoot = path.join(root, PACKAGE_RELATIVE_PATH);
  // A retained run keeps its project by definition; CLEANUP_WORKSPACES keeps
  // the throwaway ones too. Either way the exit-hook backstop is skipped, or
  // it would delete on the way out what the caller asked to keep.
  if (persistRuns || !CLEANUP_WORKSPACES) {
    console.log(`[hb-e2e] workspace kept: ${root}`);
    return { fixture, root, packageRoot, async cleanup() {} };
  }
  live.add(root);
  registerCleanupHook();
  return {
    fixture,
    root,
    packageRoot,
    async cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
      live.delete(root);
    },
  };
}

export async function destroyFixture(workspace: Workspace): Promise<void> {
  await workspace.cleanup();
}

/** Copies the authoring package contents into the selected host skill directory for a
 * local fixture. Consumer installation remains a separate release-ZIP workflow.
 * Package state is not copied into a fresh test project.
 */
export function installSkillPackage(workspace: Workspace, host: Provider = PROVIDERS.claude): void {
  const hostRoot = PROVIDER_DETAILS[host].skills;
  workspace.packageRoot = path.join(workspace.root, hostRoot, 'harness-bootstrap');
  fs.mkdirSync(workspace.packageRoot, { recursive: true });

  for (const entry of fs.readdirSync(skillPackageRoot)) {
    if (entry === 'state') continue;
    fs.cpSync(path.join(skillPackageRoot, entry), path.join(workspace.packageRoot, entry), {
      recursive: true,
    });
  }
}
