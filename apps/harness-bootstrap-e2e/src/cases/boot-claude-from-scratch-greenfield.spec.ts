import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import { expect, it } from 'vitest';
import { runCase, type CaseDefinition } from '../testkit/scenario.ts';
import { bootstrapScenario } from '../scenarios/bootstrap.ts';

export const bootClaudeFromScratchGreenfield: CaseDefinition = {
  id: 'boot-claude-from-scratch-greenfield',
  name: `${PROVIDER_DETAILS[PROVIDERS.claude].name} boot from scratch with predefined answers`,
  scenario: bootstrapScenario,
  fixture: fixtures.multiContainerProject,
  configuration: 'aws-dev',
  host: PROVIDERS.claude,
  provider: PROVIDERS.claude,
};

it(`${bootClaudeFromScratchGreenfield.id} ${bootClaudeFromScratchGreenfield.name}`, async () => {
  const report = await runCase(bootClaudeFromScratchGreenfield);
  expect(report.requiredGradersPassed, report.failures.join('\n')).toBe(true);
});
