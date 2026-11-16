import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { it } from 'vitest';
import type { CaseDefinition } from './_types.ts';
import { designDevScenario } from '../scenarios/_registry.ts';

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
