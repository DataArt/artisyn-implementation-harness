import { when } from '../../graders/grading.ts';
import type { GradeContext } from '../../graders/_types.ts';
import { PROVIDERS, PROVIDER_DETAILS } from '../../utils/providers.ts';
import { fixtures } from '../../../fixtures/_registry.ts';
import type { EvalCase } from './eval-case.ts';
import { CANONICAL_AGENTS, CANONICAL_MANIFEST, CANONICAL_SKILLS } from '../../utils/constants.ts';
import { createFixture, type Workspace } from '../../utils/fixture.ts';
import {
  runStubbedLaunch,
  finalizeStubbedLaunch,
  type Provider,
} from '../../utils/build-launch.ts';
import {
  agentProjectionConsistency,
  codexPlanToolConfigured,
  filesystemCheck,
  intentCleanup,
  launchState,
  referencesResolve,
  skillProjectionConsistency,
} from '../../graders/_registry.ts';

const WORKSPACE = 'workspace';
export const LAUNCH_SKILLS = 'launchSkills';

export function workspaceOf(context: GradeContext): Workspace {
  return context.artifacts.get(WORKSPACE) as Workspace;
}

export async function stubbedLaunchContext(
  id: string,
  providers: Provider[]
): Promise<GradeContext> {
  const workspace = await createFixture(fixtures.nxMonorepo, id);
  const artifacts = new Map<string, unknown>();
  artifacts.set(WORKSPACE, workspace);
  const launch = await runStubbedLaunch(workspace, providers, id.toLowerCase());
  finalizeStubbedLaunch(launch);
  artifacts.set(LAUNCH_SKILLS, launch.skills);
  return {
    workspaces: [workspace],
    root: workspace.root,
    packageRoot: workspace.packageRoot,
    fixture: workspace.fixture,
    containers: workspace.fixture.containers.map((container) => container.name),
    providers,
    provider: providers.length === 1 ? providers[0] : undefined,
    runId: launch.runId,
    artifacts,
  };
}

/** Shared implementation for BOOT-001/002/003: bootstrap a fresh Nx-shaped
 * fixture for the given provider selection, then grade the result. BOOT-003
 * (both) is the only one that also exercises cross-provider consistency,
 * since a single-provider run has nothing to compare against.
 */
export function bootCase(id: string, name: string, providers: Provider[]): EvalCase {
  return {
    id,
    name,
    layer: 'integration',
    provider: providers.join('+'),
    setup: () => stubbedLaunchContext(id, providers),
    graders: [
      filesystemCheck('canonical', (c) => ({
        base: c.packageRoot,
        exists: [CANONICAL_MANIFEST, CANONICAL_SKILLS, CANONICAL_AGENTS],
      })),
      filesystemCheck('provider-skills', (c) => ({
        base: c.root,
        exists: c.providers.map((p) => PROVIDER_DETAILS[p].skills),
      })),
      launchState({ verified: true }),
      when((c) => c.providers.includes(PROVIDERS.codex), codexPlanToolConfigured()),
      referencesResolve(),
      intentCleanup(),
      when((c) => c.providers.length > 1, skillProjectionConsistency(LAUNCH_SKILLS)),
      when((c) => c.providers.length > 1, agentProjectionConsistency(LAUNCH_SKILLS)),
    ],
    cleanup: (context) => workspaceOf(context).cleanup(),
  };
}
