import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { it } from 'vitest';
import type { CaseDefinition } from './_types.ts';
import { devOnlyScenario } from '../scenarios/_registry.ts';

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
