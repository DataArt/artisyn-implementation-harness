import type { GradeContext } from '../graders/_types.ts';
import type { StepReport } from '../cases/_types.ts';

/** Execution internals. The shapes an author writes live in
 * `cases/_types.ts` and `scenarios/_types.ts`; these are what the run
 * classes pass between themselves.
 */

export interface FoldedGrades {
  graders: Record<string, 'pass' | 'fail'>;
  failures: string[];
}

/** Breadcrumbs appended to a failing report — transcript paths and the like. */
export type Diagnostics = (context: GradeContext) => string[];

export interface ScenarioOutcome {
  reports: StepReport[];
  /** Failures that belong to the run rather than to any one step. */
  failures: string[];
}
