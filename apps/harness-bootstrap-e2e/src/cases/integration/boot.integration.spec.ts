import { describe, expect, it } from 'vitest';
import { runEvalCase } from '../../testkit/eval-case.ts';
import { boot001Claude } from './boot-001-claude.case.ts';
import { boot002Codex } from './boot-002-codex.case.ts';
import { boot003Both } from './boot-003-both.case.ts';
import { boot004Idempotent } from './boot-004-idempotent.case.ts';
import { boot005PreserveExistingSettings } from './boot-005-preserve-existing-settings.case.ts';

describe('bootstrap/launch', () => {
  it('BOOT-001 Claude', async () => {
    const report = await runEvalCase(boot001Claude);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });

  it('BOOT-002 Codex', async () => {
    const report = await runEvalCase(boot002Codex);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });

  it('BOOT-003 Claude and Codex (primary CI smoke)', async () => {
    const report = await runEvalCase(boot003Both);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });

  it('BOOT-004 repeat bootstrap is idempotent', async () => {
    const report = await runEvalCase(boot004Idempotent);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });

  it('BOOT-005 existing settings/config are reconciled, not rewritten', async () => {
    const report = await runEvalCase(boot005PreserveExistingSettings);
    expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
  });
});
