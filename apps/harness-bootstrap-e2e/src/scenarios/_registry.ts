import type { ScenarioDefinition } from './_types.ts';
import { bootstrapScenario } from './bootstrap.ts';
import { patchPrepareApplyScenario } from './patch-prepare-apply.ts';
import { designDevScenario, devOnlyScenario } from './feature-flows.ts';

export { bootstrapScenario } from './bootstrap.ts';
export { patchPrepareApplyScenario } from './patch-prepare-apply.ts';
export { designDevScenario, devOnlyScenario } from './feature-flows.ts';

/** Every scenario a case can reference, keyed by its own `id`. A case picks
 * one from here rather than reaching into the module that defines it.
 */
export const scenarios = {
  [bootstrapScenario.id]: bootstrapScenario,
  [patchPrepareApplyScenario.id]: patchPrepareApplyScenario,
  [designDevScenario.id]: designDevScenario,
  [devOnlyScenario.id]: devOnlyScenario,
} satisfies Record<string, ScenarioDefinition>;
