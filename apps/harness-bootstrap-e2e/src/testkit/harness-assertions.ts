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

// Only {{provider:*}} leftovers are always a bug — a plain {{TOKEN}} may be
// an intentionally preserved project token (materialize-launch.mjs already
// verifies those against each plan file's own preserve_tokens list).
const UNRESOLVED_PROVIDER_TOKEN_RE = /\{\{provider:[a-z_]+(?::[a-z-]+)?\}\}/;

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
        exists: ['canonical/manifest.json', 'canonical/skills', 'canonical/agents'],
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
    const failures: string[] = [];
    const root = this.result.workspace.root;
    const packageRoot = this.result.workspace.packageRoot;
    for (const dir of ['.claude', '.agents', '.codex']) {
      const base = path.join(root, dir);
      if (!fs.existsSync(base)) continue;
      for (const file of walk(base)) {
        if (file === packageRoot || file.startsWith(packageRoot + path.sep)) continue;
        if (UNRESOLVED_PROVIDER_TOKEN_RE.test(fs.readFileSync(file, 'utf8')))
          failures.push(`unresolved {{provider:*}} placeholder in ${path.relative(root, file)}`);
      }
    }
    throwOnFailure('toHaveNoUnresolvedPlaceholders', failures);
    return this;
  }

  toHaveValidReferences(): this {
    throwOnFailure(
      'toHaveValidReferences',
      gradeReferencesResolve(
        this.result.workspace.root,
        ['.claude', '.agents', '.codex'],
        [this.result.workspace.packageRoot]
      ).failures
    );
    return this;
  }

  toHaveConsistentProjections(): this {
    const { workspace, skills, providers } = this.result;
    const manifest = JSON.parse(
      fs.readFileSync(path.join(workspace.packageRoot, 'canonical/manifest.json'), 'utf8')
    );
    const invocationPrefixes = Object.fromEntries(
      providers.map((p) => [p, manifest.providers[p].invocationPrefix])
    ) as Partial<Record<Provider, string>>;
    throwOnFailure(
      'toHaveConsistentProjections (skills)',
      gradeSkillProjectionConsistency(workspace.root, skills, providers, invocationPrefixes)
        .failures
    );
    const agents = fs
      .readdirSync(path.join(workspace.packageRoot, 'canonical/agents'))
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

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walk(full) : [full];
  });
}

export function expectHarness(result: LaunchResult): HarnessExpectation {
  return new HarnessExpectation(result);
}
