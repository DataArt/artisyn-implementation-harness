import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { it } from 'vitest';
import type { CaseDefinition } from './_types.ts';
import { designDevScenario } from '../scenarios/_registry.ts';

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
