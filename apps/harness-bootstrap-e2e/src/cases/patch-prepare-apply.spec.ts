import { fixtures } from '../../fixtures/_registry.ts';
import { expect, it } from 'vitest';
import { runCase } from '../engine/case-run.ts';
import type { CaseDefinition } from './_types.ts';
import { patchPrepareApplyScenario } from '../scenarios/_registry.ts';

export const patchPrepareApply: CaseDefinition = {
  id: 'patch-prepare-apply',
  name: 'Patch prepare -> transfer -> apply across two projects',
  fixture: fixtures.nxMonorepo,
  configuration: 'stubbed-baseline',
  scenario: patchPrepareApplyScenario,
};

it(`${patchPrepareApply.id} ${patchPrepareApply.name}`, async () => {
  const report = await runCase(patchPrepareApply);
  expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
});
