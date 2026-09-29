import { describe, expect, it } from 'vitest';
import { runEvalCase } from '../../testkit/eval-case.ts';
import { boot006ClaudeScratch } from './boot-006-claude-scratch.case.ts';
import { boot007CodexScratch } from './boot-007-codex-scratch.case.ts';

/** Real `claude` CLI calls — expensive, non-deterministic, intentionally
 * excluded from the default `integration` run. Invoke with
 * `nx run harness-bootstrap-e2e:agent-e2e`, locally, on request.
 */
describe('bootstrap from scratch (agent-e2e)', () => {
  it('BOOT-006 Claude boots from scratch with predefined answers', async () => {
    const report = await runEvalCase(boot006ClaudeScratch);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });

  it('BOOT-007 Codex boots from scratch with predefined answers', async () => {
    const report = await runEvalCase(boot007CodexScratch);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });
});
