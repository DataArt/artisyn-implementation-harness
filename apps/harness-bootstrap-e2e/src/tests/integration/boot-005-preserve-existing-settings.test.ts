import { result } from '../../graders/grading.ts';
import type { GradeContext, GraderBinding } from '../../graders/_types.ts';
import { PROVIDERS, PROVIDER_DETAILS } from '../../utils/providers.ts';
import { fixtures } from '../../../fixtures/_registry.ts';
import fs from 'node:fs';
import path from 'node:path';
import type { EvalCase } from './eval-case.ts';
import { createFixture, type Workspace } from '../../utils/fixture.ts';
import { runStubbedLaunch } from '../../utils/build-launch.ts';

interface Plan {
  files: Array<{ target: string }>;
  derived_outputs: Array<{ target: string }>;
}

const WORKSPACE = 'workspace';
const PLAN = 'plan';

const CLAUDE_SETTINGS = PROVIDER_DETAILS[PROVIDERS.claude].settings;
const CODEX_CONFIG = PROVIDER_DETAILS[PROVIDERS.codex].settings;
const LOCAL_CLAUDE_SETTINGS = JSON.stringify({ localCustomization: 'do-not-clobber' }, null, 2);
const LOCAL_CODEX_CONFIG =
  '# hand-written local setting, predates this launch\nsandbox_mode = "read-only"\n';

const LOCAL_CONTENT: Record<string, string> = {
  [CLAUDE_SETTINGS]: LOCAL_CLAUDE_SETTINGS,
  [CODEX_CONFIG]: LOCAL_CODEX_CONFIG,
};

const settingsPreserved = (): GraderBinding => (c) => {
  const plan = c.artifacts.get(PLAN) as Plan;
  const failures: string[] = [];
  for (const [target, original] of Object.entries(LOCAL_CONTENT)) {
    if (plan.files.some((f) => f.target === target))
      failures.push(
        `${target} was planned as a direct rewrite instead of a derived reconciliation`
      );
    if (!plan.derived_outputs.some((f) => f.target === target))
      failures.push(`${target} was not scheduled as a derived output needing reconciliation`);
    if (fs.readFileSync(path.join(c.root, target), 'utf8') !== original)
      failures.push(`${target} was modified by materialize despite being a derived output`);
  }
  return result('settings-preserved', failures);
};

async function setup(): Promise<GradeContext> {
  const workspace = await createFixture(fixtures.nxMonorepo, 'BOOT-005');
  const artifacts = new Map<string, unknown>();
  artifacts.set(WORKSPACE, workspace);

  for (const [target, content] of Object.entries(LOCAL_CONTENT)) {
    const full = path.join(workspace.root, target);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  const providers = [PROVIDERS.claude, PROVIDERS.codex];
  const launch = await runStubbedLaunch(workspace, providers, 'boot-005');
  artifacts.set(PLAN, launch.plan as Plan);

  return {
    workspaces: [workspace],
    root: workspace.root,
    packageRoot: workspace.packageRoot,
    fixture: workspace.fixture,
    containers: workspace.fixture.containers.map((container) => container.name),
    providers,
    runId: launch.runId,
    artifacts,
  };
}

/** A target project that already has hand-edited settings/config before its
 * first (or a repeat) launch — the exact scenario plan-provider-launch.mjs's
 * planProviderConfig() branches on: "added as a plain plan file when the
 * target doesn't already differ from the canonical rendering, otherwise
 * reserved as a derived output the orchestrator must reconcile with the
 * existing local file by hand." materialize-launch.mjs never writes
 * derived_outputs itself (only plan `files` entries), so this is fully
 * deterministic to verify without any agent judgment: existing settings must
 * be scheduled for reconciliation, not silently planned as a direct rewrite,
 * and materialize must leave the local bytes untouched either way.
 */
export const boot005PreserveExistingSettings: EvalCase = {
  id: 'BOOT-005',
  name: 'Existing settings/config are reconciled, not rewritten',
  layer: 'integration',
  provider: 'both',
  setup,
  graders: [settingsPreserved()],
  cleanup: (context) => (context.artifacts.get(WORKSPACE) as Workspace).cleanup(),
};
