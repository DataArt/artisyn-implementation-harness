import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import { expect, it } from 'vitest';
import { runCase, type CaseDefinition } from '../testkit/scenario.ts';
import { bootstrapScenario } from '../scenarios/bootstrap.ts';

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
