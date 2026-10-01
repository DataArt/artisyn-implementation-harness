import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { expect, it } from 'vitest';
import { runCase } from '../engine/case-run.ts';
import type { CaseDefinition } from './_types.ts';
import { bootstrapScenario } from '../scenarios/_registry.ts';

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
