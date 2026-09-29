import { PROVIDERS, PROVIDER_DETAILS } from '../../testkit/providers.ts';
import { fixtures } from '../../../fixtures/registry.ts';
import path from 'node:path';
import type { EvalCase } from '../../testkit/eval-case.ts';
import type { GradeResult } from '../../graders/filesystem.grader.ts';
import { createFixture } from '../../testkit/fixture.ts';
import {
  runStubbedLaunch,
  finalizeStubbedLaunch,
  type Provider,
} from '../../testkit/build-launch.ts';
import { gradeFilesystem } from '../../graders/filesystem.grader.ts';
import { gradeLaunchState } from '../../graders/state.grader.ts';
import { gradeReferencesResolve } from '../../graders/references.grader.ts';
import {
  gradeSkillProjectionConsistency,
  gradeAgentProjectionConsistency,
} from '../../graders/projection.grader.ts';
import { gradeIntentCleanup } from '../../graders/cleanup.grader.ts';
import { gradeCodexPlanToolConfigured } from '../../graders/config.grader.ts';
import fs from 'node:fs';

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
    async run(): Promise<GradeResult[]> {
      const workspace = await createFixture(fixtures.nxMonorepo);
      try {
        const result = await runStubbedLaunch(workspace, providers, id.toLowerCase());
        finalizeStubbedLaunch(result);

        const results: GradeResult[] = [];
        results.push(
          gradeFilesystem(workspace.packageRoot, {
            exists: ['canonical/manifest.json', 'canonical/skills', 'canonical/agents'],
          })
        );
        results.push(
          gradeFilesystem(workspace.root, {
            exists: providers.map((p) => PROVIDER_DETAILS[p].skills),
          })
        );
        results.push(gradeLaunchState(workspace.packageRoot, result.runId, true));
        if (providers.includes(PROVIDERS.codex))
          results.push(gradeCodexPlanToolConfigured(workspace.root));
        results.push(
          gradeReferencesResolve(
            workspace.root,
            ['.claude', '.agents', '.codex'],
            [workspace.packageRoot]
          )
        );
        results.push(
          gradeIntentCleanup(
            workspace.root,
            ['.claude', '.agents', '.codex'],
            [workspace.packageRoot]
          )
        );
        if (providers.length > 1) {
          const manifest = JSON.parse(
            fs.readFileSync(path.join(workspace.packageRoot, 'canonical/manifest.json'), 'utf8')
          );
          const invocationPrefixes = Object.fromEntries(
            providers.map((p) => [p, manifest.providers[p].invocationPrefix])
          ) as Partial<Record<Provider, string>>;
          results.push(
            gradeSkillProjectionConsistency(
              workspace.root,
              result.skills,
              providers,
              invocationPrefixes
            )
          );
          const agents = fs
            .readdirSync(path.join(workspace.packageRoot, 'canonical/agents'))
            .flatMap((template) =>
              template === 'layer'
                ? workspace.fixture.containers.map((container) => ({ name: container.name }))
                : [{ name: template }]
            );
          results.push(
            gradeAgentProjectionConsistency(
              workspace.root,
              agents,
              providers,
              invocationPrefixes,
              result.skills
            )
          );
        }
        return results;
      } finally {
        await workspace.cleanup();
      }
    },
  };
}
