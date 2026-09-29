import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import { it } from 'vitest';
import { type CaseDefinition } from '../testkit/scenario.ts';
import { devOnlyScenario } from '../scenarios/feature-flows.ts';

export const devClaude: CaseDefinition = {
  id: 'dev-claude',
  name: `${PROVIDER_DETAILS[PROVIDERS.claude].name} dev (stub)`,
  scenario: devOnlyScenario,
  fixture: fixtures.installedHarness,
  configuration: 'dev-only',
  host: PROVIDERS.claude,
  provider: PROVIDERS.claude,
  feature: 'health-check-endpoint',
};

it.todo(`${devClaude.id} ${devClaude.name}`);
