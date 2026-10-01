import { result } from '../graders/grading.ts';
import type { GradeContext, GraderBinding, PatchManifest } from '../graders/_types.ts';
import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { hashFile, readJson } from '../utils/fs.ts';
import { CANONICAL_SKILLS } from '../utils/constants.ts';
import { runStubbedLaunch } from '../utils/build-launch.ts';
import type { ScenarioDefinition, StepContext } from './_types.ts';
import {
  agentRunSucceeded,
  patchManifestSchema,
  patchBundleHashes,
  patchApplyReconstruction,
  patchProviderScope,
} from '../graders/_registry.ts';

const CANONICAL_EDIT_TARGET = `${CANONICAL_SKILLS}/where-we-are/TEMPLATE.md`;
const CANONICAL_EDIT_MARKER =
  '\n<!-- patch-prepare-apply fixture edit: deterministic canonical change -->\n';
const PATCH_DIR = 'patch';

/** Named artifact keys, so the steps and their graders agree on what's shared. */
const BUNDLE_DIR = 'bundleDir';
const MANIFEST = 'manifest';
const ORIGINAL_CANONICAL = 'originalCanonical';
const PROJECTION_BEFORE = 'projectionBefore';
const BUNDLES_BEFORE = 'bundlesBefore';

/** Project A prepares the bundle; project B receives it. */
const sender = (c: GradeContext) => c.workspaces[0];
const receiver = (c: GradeContext) => c.workspaces[1];

function bundleFolders(packageRoot: string): Set<string> {
  const patchDir = path.join(packageRoot, PATCH_DIR);
  return new Set(fs.existsSync(patchDir) ? fs.readdirSync(patchDir) : []);
}

/** patch prepare's real (agent-driven) change detection naturally reaches for
 * `git status`/`git diff` when no stored baseline hash exists yet — a fixture
 * that isn't a git repo makes every direct canonical edit invisible to it,
 * not because the harness is wrong but because our test setup wasn't
 * realistic. Commit the post-bootstrap state as the baseline so the
 * deterministic edit made afterward shows up as real, uncommitted drift.
 */
function initGitBaseline(root: string): void {
  const git = (args: string[]) => {
    const outcome = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    if (outcome.status !== 0)
      throw new Error(`git ${args.join(' ')} failed in ${root}:\n${outcome.stderr}`);
  };
  git(['init', '--quiet']);
  git(['add', '-A']);
  git([
    '-c',
    'user.email=e2e@example.test',
    '-c',
    'user.name=e2e',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '--quiet',
    '-m',
    'baseline: post-bootstrap fixture state',
  ]);
}

function projectionSnapshot(root: string): Map<string, string> {
  const snapshot = new Map<string, string>();
  const base = path.join(root, PROVIDER_DETAILS[PROVIDERS.claude].skills, 'where-we-are');
  if (!fs.existsSync(base)) return snapshot;
  for (const file of fs.readdirSync(base, { recursive: true } as never) as unknown as string[]) {
    const full = path.join(base, String(file));
    if (fs.existsSync(full) && fs.statSync(full).isFile()) snapshot.set(full, hashFile(full));
  }
  return snapshot;
}

/** prepare packages a canonical change; deploying it to the provider
 * projections is `apply`'s job, in the receiving project.
 */
const prepareDoesNotDeploy = (): GraderBinding => (c) => {
  const before = c.artifacts.get(PROJECTION_BEFORE) as Map<string, string>;
  const after = projectionSnapshot(sender(c).root);
  const deployed = [...before.entries()].some(([file, hash]) => after.get(file) !== hash);
  return result(
    'prepare-does-not-deploy',
    deployed
      ? ['patch prepare modified a provider projection — it must only package the canonical change']
      : []
  );
};

const applyUpdatesCanonical = (): GraderBinding => (c) => {
  const applied = fs.readFileSync(
    path.join(receiver(c).packageRoot, CANONICAL_EDIT_TARGET),
    'utf8'
  );
  return result(
    'apply-updates-canonical',
    applied.includes(CANONICAL_EDIT_MARKER.trim())
      ? []
      : [`${CANONICAL_EDIT_TARGET} in project B does not contain the prepared change`]
  );
};

/** Brings both projects to a realistic pre-patch state: a stubbed launch in
 * each, a git baseline so uncommitted drift is visible, and one deterministic
 * canonical edit in the sender for prepare to find. Also records the
 * before-state the prepare graders compare against.
 */
async function seedProjects({ grade }: StepContext): Promise<void> {
  for (const workspace of grade.workspaces) {
    await runStubbedLaunch(workspace, [PROVIDERS.claude, PROVIDERS.codex], 'baseline');
    initGitBaseline(workspace.root);
  }
  const editTarget = path.join(sender(grade).packageRoot, CANONICAL_EDIT_TARGET);
  grade.artifacts.set(ORIGINAL_CANONICAL, fs.readFileSync(editTarget));
  fs.appendFileSync(editTarget, CANONICAL_EDIT_MARKER);

  grade.artifacts.set(PROJECTION_BEFORE, projectionSnapshot(sender(grade).root));
  grade.artifacts.set(BUNDLES_BEFORE, bundleFolders(sender(grade).packageRoot));
}

/** Runs after the prepare agent: finds the bundle it produced and records it
 * for the graders and the apply step.
 */
async function recordBundle({ grade }: StepContext): Promise<void> {
  const before = grade.artifacts.get(BUNDLES_BEFORE) as Set<string>;
  const created = [...bundleFolders(sender(grade).packageRoot)].filter(
    (entry) => !before.has(entry)
  );
  if (created.length !== 1)
    throw new Error(
      `expected exactly one new bundle folder under ${PATCH_DIR}/, found: ${JSON.stringify(created)}`
    );
  const bundleDir = path.join(sender(grade).packageRoot, PATCH_DIR, created[0]);
  grade.artifacts.set(BUNDLE_DIR, bundleDir);
  grade.artifacts.set(MANIFEST, readJson<PatchManifest>(path.join(bundleDir, 'manifest.json')));
}

/** Copies the bundle into the receiving project and returns the path to hand
 * the agent. Only the bundle crosses — that is the portability claim.
 */
function transferBundle(c: GradeContext): string {
  const bundleDirA = c.artifacts.get(BUNDLE_DIR) as string;
  const bundleDirB = path.join(receiver(c).packageRoot, PATCH_DIR, path.basename(bundleDirA));
  if (!fs.existsSync(bundleDirB)) fs.cpSync(bundleDirA, bundleDirB, { recursive: true });
  return path.relative(receiver(c).root, bundleDirB);
}

/** Real, expensive, agent-driven golden test: no script backs harvest/prepare/
 * apply (see plan notes), so this is the only way to prove actual cross-project
 * portability rather than just the bundle contract in isolation
 * (patch.grader.spec.ts covers that half deterministically).
 */
export const patchPrepareApplyScenario: ScenarioDefinition = {
  id: 'patch-prepare-apply',
  requires: { fixtures: [fixtures.nxMonorepo] },
  workspaces: 2,

  steps: [
    { id: 'seed', run: seedProjects },
    {
      id: 'prepare',
      agent: {
        host: () => PROVIDERS.claude,
        prompt: (c) =>
          `/harness-bootstrap patch prepare (package at ${path.relative(sender(c).root, sender(c).packageRoot)})`,
      },
      run: recordBundle,
      graders: [
        agentRunSucceeded(),
        patchManifestSchema(MANIFEST),
        patchBundleHashes(BUNDLE_DIR, MANIFEST),
        // Only correct while the bundle has a single `update` entry for our one
        // deterministic edit. If the agent also records a companion/INTENT
        // change alongside it, this needs a real path->base lookup instead.
        patchApplyReconstruction(BUNDLE_DIR, MANIFEST, ORIGINAL_CANONICAL),
        prepareDoesNotDeploy(),
        // prepare never leaves canonical, so its record claims no provider.
        patchProviderScope('prepare', (c) => sender(c as GradeContext).packageRoot),
      ],
    },
    {
      id: 'apply',
      agent: {
        host: () => PROVIDERS.claude,
        workspace: 1,
        prompt: (c) => `/harness-bootstrap patch apply ${transferBundle(c)}`,
      },
      graders: [
        agentRunSucceeded(),
        applyUpdatesCanonical(),
        // Both projects were launched for both providers, so an apply that
        // claims `applied` has to say it covered both.
        patchProviderScope('apply', (c) => receiver(c as GradeContext).packageRoot, [
          PROVIDERS.claude,
          PROVIDERS.codex,
        ]),
      ],
    },
  ],
};
