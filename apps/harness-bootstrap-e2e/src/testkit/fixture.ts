import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fixturesRoot, skillPackageRoot, workspaceRoot } from './paths.ts';

/** Debug-only escape hatch: set HB_E2E_KEEP_TMP=1 to land scratch workspaces
 * under <repo>/tmp/ instead of the OS tmpdir, and skip cleanup, so a run's
 * output can be inspected afterward. Never enabled by default — every real
 * test still gets a private, auto-cleaned OS tmpdir.
 */
const KEEP_TMP = process.env.HB_E2E_KEEP_TMP === '1';

/** Default location; installSkillPackage resets this to the chosen host discovery root. */
const PACKAGE_RELATIVE_PATH = '.claude/skills/harness-bootstrap';

export interface Workspace {
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

/** Copies fixtures/<name> into a unique scratch tmpdir. Every test gets its
 * own isolated filesystem state; nothing is ever run against the fixture
 * source directory itself.
 */
export async function createFixture(name: string): Promise<Workspace> {
  const source = path.join(fixturesRoot, name);
  if (!fs.existsSync(source)) throw new Error(`Unknown fixture: ${name}`);
  const tmpBase = KEEP_TMP
    ? (fs.mkdirSync(path.join(workspaceRoot, 'tmp'), { recursive: true }),
      path.join(workspaceRoot, 'tmp'))
    : os.tmpdir();
  const root = fs.mkdtempSync(path.join(tmpBase, `hb-e2e-${name}-`));
  fs.cpSync(source, root, { recursive: true });
  const packageRoot = path.join(root, PACKAGE_RELATIVE_PATH);
  if (KEEP_TMP) {
    console.log(`[HB_E2E_KEEP_TMP] kept workspace: ${root}`);
    return { root, packageRoot, async cleanup() {} };
  }
  live.add(root);
  registerCleanupHook();
  return {
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
export function installSkillPackage(
  workspace: Workspace,
  host: 'claude' | 'codex' = 'claude'
): void {
  const hostRoot = host === 'claude' ? '.claude/skills' : '.agents/skills';
  workspace.packageRoot = path.join(workspace.root, hostRoot, 'harness-bootstrap');
  fs.mkdirSync(workspace.packageRoot, { recursive: true });

  for (const entry of fs.readdirSync(skillPackageRoot)) {
    if (entry === 'state') continue;
    fs.cpSync(path.join(skillPackageRoot, entry), path.join(workspace.packageRoot, entry), {
      recursive: true,
    });
  }
}
