import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { GradeResult } from '../graders/filesystem.grader.ts';
import { createFixture, type Workspace } from '../testkit/fixture.ts';
import { runStubbedLaunch } from '../testkit/build-launch.ts';
import { runClaudeSkill } from '../agent-runners/run-claude-skill.ts';
import {
  gradePatchManifestSchema,
  gradePatchBundleHashes,
  gradePatchApplyReconstruction,
  type PatchManifest,
} from '../graders/patch.grader.ts';

const CANONICAL_EDIT_TARGET = 'canonical/skills/where-we-are/TEMPLATE.md';
const CANONICAL_EDIT_MARKER =
  '\n<!-- patch-prepare-apply fixture edit: deterministic canonical change -->\n';
const sha256 = (data: Buffer) => crypto.createHash('sha256').update(data).digest('hex');

function newestPatchBundle(packageRoot: string, before: Set<string>): string {
  const patchDir = path.join(packageRoot, 'patch');
  const after = fs.existsSync(patchDir) ? fs.readdirSync(patchDir) : [];
  const created = after.filter((entry) => !before.has(entry));
  if (created.length !== 1)
    throw new Error(
      `expected exactly one new bundle folder under patch/, found: ${JSON.stringify(created)}`
    );
  return path.join(patchDir, created[0]);
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
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    if (result.status !== 0)
      throw new Error(`git ${args.join(' ')} failed in ${root}:\n${result.stderr}`);
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
    if (fs.existsSync(full) && fs.statSync(full).isFile())
      snapshot.set(full, sha256(fs.readFileSync(full)));
  }
  return snapshot;
}

/** Real, expensive, agent-driven golden test: no script backs harvest/prepare/
 * apply (see plan notes), so this is the only way to prove actual cross-project
 * portability rather than just the bundle contract in isolation
 * (patch.grader.spec.ts covers that half deterministically).
 */
export async function runPatchPrepareApply(): Promise<GradeResult[]> {
  const results: GradeResult[] = [];
  const projectA = await createFixture(fixtures.nxMonorepo);
  const projectB = await createFixture(fixtures.nxMonorepo);
  try {
    await runStubbedLaunch(projectA, [PROVIDERS.claude, PROVIDERS.codex], 'baseline');
    await runStubbedLaunch(projectB, [PROVIDERS.claude, PROVIDERS.codex], 'baseline');
    initGitBaseline(projectA.root);
    initGitBaseline(projectB.root);

    const editTarget = path.join(projectA.packageRoot, CANONICAL_EDIT_TARGET);
    const originalCanonicalContent = fs.readFileSync(editTarget);
    fs.appendFileSync(editTarget, CANONICAL_EDIT_MARKER);

    const beforePrepare = new Set(
      fs.existsSync(path.join(projectA.packageRoot, 'patch'))
        ? fs.readdirSync(path.join(projectA.packageRoot, 'patch'))
        : []
    );
    const projectionBefore = projectionSnapshot(projectA.root);

    const prepare = await runClaudeSkill({
      cwd: projectA.root,
      prompt: `/harness-bootstrap patch prepare (package at ${path.relative(projectA.root, projectA.packageRoot)})`,
    });
    if (prepare.exitCode !== 0)
      return [
        {
          grader: 'agent-run',
          pass: false,
          failures: [`patch prepare failed:\n${prepare.stderr}`],
        },
      ];

    const bundleDirA = newestPatchBundle(projectA.packageRoot, beforePrepare);
    const manifest: PatchManifest = JSON.parse(
      fs.readFileSync(path.join(bundleDirA, 'manifest.json'), 'utf8')
    );

    results.push(gradePatchManifestSchema(manifest));
    results.push(gradePatchBundleHashes(bundleDirA, manifest));
    // Only correct while the bundle has a single `update` entry for our one
    // deterministic edit. If the agent also records a companion/INTENT
    // change alongside it, this needs a real path->base lookup instead.
    results.push(
      gradePatchApplyReconstruction(bundleDirA, manifest, () => originalCanonicalContent)
    );

    const projectionAfter = projectionSnapshot(projectA.root);
    const deployedDuringPrepare = [...projectionBefore.entries()].some(
      ([file, hash]) => projectionAfter.get(file) !== hash
    );
    results.push({
      grader: 'prepare-does-not-deploy',
      pass: !deployedDuringPrepare,
      failures: deployedDuringPrepare
        ? [
            'patch prepare modified a provider projection — it must only package the canonical change',
          ]
        : [],
    });

    const bundleDirB = path.join(projectB.packageRoot, 'patch', path.basename(bundleDirA));
    fs.cpSync(bundleDirA, bundleDirB, { recursive: true });

    const apply = await runClaudeSkill({
      cwd: projectB.root,
      prompt: `/harness-bootstrap patch apply ${path.relative(projectB.root, bundleDirB)}`,
    });
    if (apply.exitCode !== 0)
      return [
        ...results,
        { grader: 'agent-run', pass: false, failures: [`patch apply failed:\n${apply.stderr}`] },
      ];

    const appliedContent = fs.readFileSync(
      path.join(projectB.packageRoot, CANONICAL_EDIT_TARGET),
      'utf8'
    );
    const canonicalUpdated = appliedContent.includes(CANONICAL_EDIT_MARKER.trim());
    results.push({
      grader: 'apply-updates-canonical',
      pass: canonicalUpdated,
      failures: canonicalUpdated
        ? []
        : [`${CANONICAL_EDIT_TARGET} in project B does not contain the prepared change`],
    });

    return results;
  } finally {
    await projectA.cleanup();
    await projectB.cleanup();
  }
}

export type { Workspace };
