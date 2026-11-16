import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { it } from 'vitest';
import type { CaseDefinition } from './_types.ts';
import { devOnlyScenario } from '../scenarios/_registry.ts';

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
