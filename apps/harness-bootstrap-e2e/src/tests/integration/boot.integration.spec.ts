import { describe, expect, it } from 'vitest';
import { runEvalCase } from '../../testkit/eval-case.ts';
import { boot001Claude } from './boot-001-claude.test.ts';
import { boot002Codex } from './boot-002-codex.test.ts';
import { boot003Both } from './boot-003-both.test.ts';
import { boot004Idempotent } from './boot-004-idempotent.test.ts';
import { boot005PreserveExistingSettings } from './boot-005-preserve-existing-settings.test.ts';

describe('bootstrap/launch', () => {
  for (const test of [
    boot001Claude,
    boot002Codex,
    boot003Both,
    boot004Idempotent,
    boot005PreserveExistingSettings,
  ]) {
    it(`${test.id} ${test.name}`, async () => {
      const report = await runEvalCase(test);
      expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
    });
  }
});
