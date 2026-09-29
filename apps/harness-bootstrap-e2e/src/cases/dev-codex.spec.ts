import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import { it } from 'vitest';
import { type CaseDefinition } from '../testkit/scenario.ts';
import { devOnlyScenario } from '../scenarios/feature-flows.ts';

export const devCodex: CaseDefinition = {
  id: 'dev-codex',
  name: `${PROVIDER_DETAILS[PROVIDERS.codex].name} dev (stub)`,
  scenario: devOnlyScenario,
  fixture: fixtures.installedHarness,
  configuration: 'dev-only',
  host: PROVIDERS.codex,
  provider: PROVIDERS.codex,
  feature: 'health-check-endpoint',
};

it.todo(`${devCodex.id} ${devCodex.name}`);
