import type { GradeContext, GraderBinding } from '../../graders/_types.ts';
import { applyGraders, foldGrades } from '../../engine/grade.ts';

export interface EvalReport {
  case: string;
  passed: boolean;
  requiredGradersPassed: boolean;
  graders: Record<string, 'pass' | 'fail'>;
  failures: string[];
  durationMs: number;
  provider?: string;
  host?: string;
  layer: 'integration' | 'agent-e2e';
}

/** Eval Case = fixture + input + runner + expected behaviour + graders, kept
 * as data rather than folded into a test body. `setup()` performs the fixture
 * and task sequence and returns the context its graders read, so the case
 * declares *what* is checked while the runner decides how to report it.
 */
export interface EvalCase {
  id: string;
  name: string;
  layer: 'integration' | 'agent-e2e';
  provider?: string;
  host?: string;
  setup(): Promise<GradeContext>;
  graders: GraderBinding[];
  cleanup?(context: GradeContext): Promise<void>;
}

export async function runEvalCase(evalCase: EvalCase): Promise<EvalReport> {
  const start = performance.now();
  let graders: Record<string, 'pass' | 'fail'> = {};
  let failures: string[];
  let context: GradeContext | undefined;
  try {
    context = await evalCase.setup();
    const results = await applyGraders(evalCase.graders, context);
    if (!results.length) throw new Error('Eval case evaluated no graders');
    ({ graders, failures } = foldGrades(results));
  } catch (error) {
    failures = [error instanceof Error ? (error.stack ?? error.message) : String(error)];
  } finally {
    if (context) await evalCase.cleanup?.(context);
  }
  const requiredGradersPassed = failures.length === 0;
  return {
    case: evalCase.id,
    passed: requiredGradersPassed,
    requiredGradersPassed,
    graders,
    failures,
    durationMs: Math.round(performance.now() - start),
    provider: evalCase.provider,
    host: evalCase.host,
    layer: evalCase.layer,
  };
}
