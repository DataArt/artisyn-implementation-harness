import { describe, expect, it } from 'vitest';
import { runEvalCase } from '../../testkit/eval-case.ts';
import { patch001PrepareApply } from './patch-001-prepare-apply.case.ts';

/** Real `claude` CLI calls happen here — expensive, non-deterministic,
 * intentionally excluded from the default `integration` run. Invoke with
 * `nx run harness-bootstrap-e2e:agent-e2e`, locally, on request.
 */
describe('patch prepare -> apply (agent-e2e)', () => {
  it('PATCH-001 prepares a bundle in project A and applies it in project B', async () => {
    const report = await runEvalCase(patch001PrepareApply);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });
});
