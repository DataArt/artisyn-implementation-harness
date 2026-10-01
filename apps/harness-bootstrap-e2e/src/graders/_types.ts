import type { FixtureDefinition } from '../../fixtures/_registry.ts';
import type { Provider } from '../utils/providers.ts';
import type { SkillRunResult } from '../agent-runners/_types.ts';
import type { Workspace } from '../utils/fixture.ts';

/** Every type the grading layer owns: the contract the runners and scenarios
 * code against, plus the shapes the graders read off disk and out of a
 * transcript. The helpers that build these values live in `grading.ts`.
 */

export interface GradeResult {
  grader: string;
  pass: boolean;
  failures: string[];
}

/** Everything a grader may read about a run. Steps populate the optional
 * fields as they execute, so a grader attached to a later step sees more than
 * one attached to an earlier one.
 */
export interface GradeContext {
  /** Every scratch project the engine created for this run. Most scenarios
   * use one; the patch flow needs a sending and a receiving project.
   */
  workspaces: Workspace[];
  /** Shorthand for `workspaces[0]` — the project under test. */
  root: string;
  packageRoot: string;
  fixture: FixtureDefinition;
  containers: string[];
  /** The provider whose outputs were generated. */
  provider?: Provider;
  /** The CLI that executed the run, which need not be `provider`. */
  host?: Provider;
  /** Integration bootstraps several providers in one workspace. */
  providers: Provider[];
  runId?: string;
  launch?: SkillRunResult;
  transcriptPath?: string;
  /** Step outputs that don't warrant a named field. */
  artifacts: Map<string, unknown>;
}

/** Returning null means "not applicable here" — the runner skips it rather
 * than counting it as a pass or a failure.
 */
export type GraderBinding = (
  context: GradeContext
) => GradeResult | null | Promise<GradeResult | null>;

/** Schema version 2 patch bundle manifest, per
 * .canonical-implementation-harness/references/patch/06-patch-state.md.
 * Only the fields patch.grader inspects are typed here.
 */
export interface PatchChange {
  operation: 'add' | 'update' | 'rename' | 'copy' | 'delete';
  path: string;
  old_path: string | null;
  before_sha256: string | null;
  after_sha256: string | null;
  payload?: string;
  payload_sha256?: string;
}

export interface PatchManifest {
  schema_version: number;
  id: string;
  operation: 'harvest' | 'prepare' | 'apply' | 'launch';
  changes: PatchChange[];
}

/** One row of a host's native progress tracker, normalized across the
 * differing shapes Claude and Codex emit.
 */
export interface ProgressItem {
  text: string;
  completed: boolean;
  status?: string;
}

/** Launch receipt and operation JSON. Validated by the runtime checks in
 * `state.grader.ts` rather than by the type system — the same untyped shape
 * `JSON.parse` yields, named so the call sites read clearly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Receipt = Record<string, any>;
