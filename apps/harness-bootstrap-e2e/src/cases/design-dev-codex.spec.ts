import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import { it } from 'vitest';
import { type CaseDefinition } from '../testkit/scenario.ts';
import { designDevScenario } from '../scenarios/feature-flows.ts';

export const designDevCodex: CaseDefinition = {
  id: 'design-dev-codex',
  name: `${PROVIDER_DETAILS[PROVIDERS.codex].name} design-dev (stub)`,
  scenario: designDevScenario,
  fixture: fixtures.installedHarness,
  configuration: 'design-dev',
  host: PROVIDERS.codex,
  provider: PROVIDERS.codex,
  feature: 'health-check-endpoint',
};

it.todo(`${designDevCodex.id} ${designDevCodex.name}`);
