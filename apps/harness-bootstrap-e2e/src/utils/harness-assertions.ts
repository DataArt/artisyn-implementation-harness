import { PROVIDERS, PROVIDER_DETAILS } from './providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import type { LaunchResult, Provider } from './build-launch.ts';
import { gradeFilesystem } from '../graders/filesystem.grader.ts';
import { gradeLaunchState } from '../graders/state.grader.ts';
import { gradeReferencesResolve } from '../graders/references.grader.ts';
import {
  gradeSkillProjectionConsistency,
  gradeAgentProjectionConsistency,
} from '../graders/projection.grader.ts';
import { gradeProviderPlaceholders } from '../graders/placeholders.grader.ts';
import { readJson } from './fs.ts';
import {
  CANONICAL_AGENTS,
  CANONICAL_MANIFEST,
  CANONICAL_SKILLS,
  PROVIDER_DIRS,
} from './constants.ts';

function throwOnFailure(label: string, failures: string[]): void {
  if (failures.length) throw new Error(`${label} failed:\n  ${failures.join('\n  ')}`);
}

/** Fluent, throwing assertions over a completed launch result — for
 * handwritten specs that want a quick readable check rather than the full
 * eval-case/grader-report machinery in eval-case.ts.
 */
export class HarnessExpectation {
  constructor(private readonly result: LaunchResult) {}

  toHaveCanonicalHarness(): this {
    throwOnFailure(
      'toHaveCanonicalHarness',
      gradeFilesystem(this.result.workspace.packageRoot, {
        exists: [CANONICAL_MANIFEST, CANONICAL_SKILLS, CANONICAL_AGENTS],
      }).failures
    );
    return this;
  }

  private toHaveProjection(provider: Provider): this {
    if (!this.result.providers.includes(provider))
      throw new Error(`toHaveProjection(${provider}): provider was not selected for this launch`);
    const root = this.result.workspace.root;
    const skillsDir = PROVIDER_DETAILS[provider].skills;
    throwOnFailure(
      `toHave${provider}Projection`,
      gradeFilesystem(root, { exists: [skillsDir] }).failures
    );
    return this;
  }

  toHaveClaudeProjection(): this {
    return this.toHaveProjection(PROVIDERS.claude);
  }

  toHaveCodexProjection(): this {
    return this.toHaveProjection(PROVIDERS.codex);
  }

  toHaveValidState(expectVerified = false): this {
    throwOnFailure(
      'toHaveValidState',
      gradeLaunchState(this.result.workspace.packageRoot, this.result.runId, expectVerified)
        .failures
    );
    return this;
  }

  toHaveNoUnresolvedPlaceholders(): this {
    throwOnFailure(
      'toHaveNoUnresolvedPlaceholders',
      gradeProviderPlaceholders(this.result.workspace.root, PROVIDER_DIRS, [
        this.result.workspace.packageRoot,
      ]).failures
    );
    return this;
  }

  toHaveValidReferences(): this {
    throwOnFailure(
      'toHaveValidReferences',
      gradeReferencesResolve(this.result.workspace.root, PROVIDER_DIRS, [
        this.result.workspace.packageRoot,
      ]).failures
    );
    return this;
  }

  toHaveConsistentProjections(): this {
    const { workspace, skills, providers } = this.result;
    const manifest = readJson<{
      providers: Record<string, { invocationPrefix: string }>;
    }>(path.join(workspace.packageRoot, CANONICAL_MANIFEST));
    const invocationPrefixes = Object.fromEntries(
      providers.map((p) => [p, manifest.providers[p].invocationPrefix])
    ) as Partial<Record<Provider, string>>;
    throwOnFailure(
      'toHaveConsistentProjections (skills)',
      gradeSkillProjectionConsistency(workspace.root, skills, providers, invocationPrefixes)
        .failures
    );
    const agents = fs
      .readdirSync(path.join(workspace.packageRoot, CANONICAL_AGENTS))
      .flatMap((template) =>
        template === 'layer'
          ? workspace.fixture.containers.map((container) => ({ name: container.name }))
          : [{ name: template }]
      );
    throwOnFailure(
      'toHaveConsistentProjections (agents)',
      gradeAgentProjectionConsistency(workspace.root, agents, providers, invocationPrefixes, skills)
        .failures
    );
    return this;
  }
}

export function expectHarness(result: LaunchResult): HarnessExpectation {
  return new HarnessExpectation(result);
}
