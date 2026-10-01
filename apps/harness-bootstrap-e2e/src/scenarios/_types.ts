import type { GradeContext, GraderBinding } from '../graders/_types.ts';
import type { CaseDefinition } from '../cases/_types.ts';
import type { FixtureDefinition } from '../../fixtures/_registry.ts';
import type { Provider } from '../utils/providers.ts';

/** What a step hands forward: a patch merged into the shared grade context
 * once the step succeeds.
 */
export type StepOutput = Partial<GradeContext> | void;

export interface StepContext {
  case: CaseDefinition;
  /** Accumulated run state — steps write to it, graders read from it. */
  grade: GradeContext;
}

/** An agent invocation declared as configuration. `StepRun` resolves the
 * host's CLI adapter, writes the transcript and records the result, so a
 * scenario only states what to ask and how long to allow.
 */
export interface AgentStep {
  prompt: (context: GradeContext) => string;
  timeoutMs?: number;
  /** Index into `context.workspaces`; defaults to the first. */
  workspace?: number;
  /** Defaults to `context.host`. */
  host?: (context: GradeContext) => Provider;
}

export interface StepDefinition {
  id: string;
  /** Runs before `run`, so `run` sees `launch` already on the context. */
  agent?: AgentStep;
  /** A step with neither `agent` nor `run` is explicitly blocked. */
  run?: (context: StepContext) => Promise<StepOutput>;
  /** Checks evaluated against the context this step leaves behind. */
  graders?: GraderBinding[];
}

/** What a scenario is allowed to run against. Checked before any workspace
 * is created, so a misconfigured case fails fast and says what mismatched.
 */
export interface ScenarioRequirements {
  fixtures?: FixtureDefinition[];
  configurations?: string[];
  hosts?: Provider[];
  providers?: Provider[];
}

/** A scenario is configuration: what it needs, the steps to run and the
 * checks to evaluate. Grading logic lives in `src/graders/`, execution in
 * `src/engine/` — neither belongs here.
 *
 * There is deliberately no `setup`/`cleanup` hook. The engine creates and
 * disposes the workspaces; anything else a scenario needs to prepare is just
 * its first step.
 */
export interface ScenarioDefinition {
  id: string;
  requires?: ScenarioRequirements;
  /** Scratch projects to create from the case's fixture. Defaults to none,
   * so a scenario that needs a real project on disk says so.
   */
  workspaces?: number;
  /** Install the harness package for the host into each workspace. */
  installPackage?: boolean;
  steps: StepDefinition[];
  /** Checks evaluated once every step has passed. */
  graders?: GraderBinding[];
}
