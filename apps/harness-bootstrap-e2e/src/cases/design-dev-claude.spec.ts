import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import { it } from 'vitest';
import { type CaseDefinition } from '../testkit/scenario.ts';
import { designDevScenario } from '../scenarios/feature-flows.ts';

export const designDevClaude: CaseDefinition = {
  id: 'design-dev-claude',
  name: `${PROVIDER_DETAILS[PROVIDERS.claude].name} design-dev (stub)`,
  scenario: designDevScenario,
  fixture: fixtures.installedHarness,
  configuration: 'design-dev',
  host: PROVIDERS.claude,
  provider: PROVIDERS.claude,
  feature: 'health-check-endpoint',
};

it.todo(`${designDevClaude.id} ${designDevClaude.name}`);
