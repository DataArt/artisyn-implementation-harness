import type { GradeContext, GradeResult, GraderBinding } from '../graders/_types.ts';
import type { StepReport } from '../cases/_types.ts';
import type { Diagnostics, FoldedGrades } from './_types.ts';

/** One graded unit of work, reported under `id`. Both a step and a whole
 * scenario grade this way, which is what keeps their report entries keyed
 * and blocked identically.
 */
export async function gradeReport(
  id: string,
  bindings: GraderBinding[],
  context: GradeContext,
  diagnostics?: Diagnostics
): Promise<StepReport> {
  const folded = foldGrades(await applyGraders(bindings, context));
  return {
    step: id,
    status: folded.failures.length ? 'failed' : 'passed',
    graders: folded.graders,
    failures: folded.failures.length
      ? [...folded.failures, ...(diagnostics?.(context) ?? [])]
      : folded.failures,
    durationMs: 0,
  };
}

/** Evaluates each binding against the context, dropping the ones that report
 * themselves as not applicable. Bindings run in order: a grader may depend on
 * state an earlier step wrote into the context, never on another grader.
 */
export async function applyGraders(
  bindings: GraderBinding[],
  context: GradeContext
): Promise<GradeResult[]> {
  const results: GradeResult[] = [];
  for (const binding of bindings) {
    const result = await binding(context);
    if (result) results.push(result);
  }
  return results;
}

/** Collapses results into the report's grader map. IDs must be unique: the map
 * is keyed by grader name, so a repeat would overwrite an earlier entry and
 * could report a group as passing when one of its checks failed.
 */
export function foldGrades(results: GradeResult[], extraFailures: string[] = []): FoldedGrades {
  const graders: Record<string, 'pass' | 'fail'> = {};
  const failures: string[] = [];
  for (const result of results) {
    if (result.grader in graders) throw new Error(`duplicate grader id "${result.grader}"`);
    graders[result.grader] = result.pass ? 'pass' : 'fail';
    if (!result.pass) failures.push(...result.failures.map((f) => `[${result.grader}] ${f}`));
  }
  return { graders, failures: [...extraFailures, ...failures] };
}
