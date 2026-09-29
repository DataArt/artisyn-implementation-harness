import type { ScenarioDefinition } from '../testkit/scenario.ts';

/** Stubs: no CLI calls or fake passing grades until the workflows are implemented. */
export const designDevScenario: ScenarioDefinition = {
  id: 'design-dev',
  steps: [{ id: 'design-feature' }, { id: 'develop-feature' }],
};
export const devOnlyScenario: ScenarioDefinition = {
  id: 'dev-only',
  steps: [{ id: 'develop-feature' }],
};
