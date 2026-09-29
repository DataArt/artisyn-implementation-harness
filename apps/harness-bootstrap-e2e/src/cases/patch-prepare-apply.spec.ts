import { fixtures } from '../../fixtures/registry.ts';
import { expect, it } from 'vitest';
import { runCase, type CaseDefinition } from '../testkit/scenario.ts';
import { runPatchPrepareApply } from '../scenarios/patch-prepare-apply.ts';

export const patchPrepareApply: CaseDefinition = {
  id: 'patch-prepare-apply',
  name: 'Patch prepare -> transfer -> apply across two projects',
  fixture: fixtures.nxMonorepo,
  configuration: 'stubbed-baseline',
  scenario: {
    id: 'patch-prepare-apply',
    steps: [{ id: 'patch-prepare-apply', run: runPatchPrepareApply }],
  },
};

it(`${patchPrepareApply.id} ${patchPrepareApply.name}`, async () => {
  const report = await runCase(patchPrepareApply);
  expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
});
