import type { GradeResult } from '../graders/filesystem.grader.ts';

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

/** Eval Case = fixture + input + runner + expected behaviour + graders,
 * kept as data rather than folded into a test body — `run()` performs the
 * fixture/task/grade sequence and returns each grader's individual result,
 * so a case can be executed and reported on outside of any one test framework.
 */
export interface EvalCase {
  id: string;
  name: string;
  layer: 'integration' | 'agent-e2e';
  provider?: string;
  host?: string;
  run(): Promise<GradeResult[]>;
}

export async function runEvalCase(evalCase: EvalCase): Promise<EvalReport> {
  const start = performance.now();
  let results: GradeResult[];
  let crashed: string | undefined;
  try {
    results = await evalCase.run();
  } catch (error) {
    results = [];
    crashed = error instanceof Error ? (error.stack ?? error.message) : String(error);
  }
  const graders: Record<string, 'pass' | 'fail'> = {};
  const failures: string[] = crashed ? [crashed] : [];
  for (const result of results) {
    graders[result.grader] = result.pass ? 'pass' : 'fail';
    if (!result.pass) failures.push(...result.failures.map((f) => `[${result.grader}] ${f}`));
  }
  const requiredGradersPassed = !crashed && results.length > 0 && results.every((r) => r.pass);
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
