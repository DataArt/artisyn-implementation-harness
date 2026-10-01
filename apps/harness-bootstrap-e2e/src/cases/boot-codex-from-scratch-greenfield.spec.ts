import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { expect, it } from 'vitest';
import { runCase } from '../engine/case-run.ts';
import type { CaseDefinition } from './_types.ts';
import { bootstrapScenario } from '../scenarios/_registry.ts';

export const bootCodexFromScratchGreenfield: CaseDefinition = {
  id: 'boot-codex-from-scratch-greenfield',
  name: `${PROVIDER_DETAILS[PROVIDERS.codex].name} boot from scratch with predefined answers`,
  scenario: bootstrapScenario,
  fixture: fixtures.multiContainerProject,
  configuration: 'aws-dev',
  host: PROVIDERS.codex,
  provider: PROVIDERS.codex,
};

it(`${bootCodexFromScratchGreenfield.id} ${bootCodexFromScratchGreenfield.name}`, async () => {
  const report = await runCase(bootCodexFromScratchGreenfield);
  expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
});
