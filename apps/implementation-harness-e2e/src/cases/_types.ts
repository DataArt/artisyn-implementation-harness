import type { Provider } from '../utils/providers.ts';
import type { FixtureDefinition } from '../../fixtures/_registry.ts';
import type { ScenarioDefinition } from '../scenarios/_types.ts';

/** `blocked` is distinct from `failed`: the work never ran, so the run proved
 * nothing either way.
 */
export type Outcome = 'passed' | 'failed' | 'blocked';

/** A case binds a scenario to the fixture, provider and host it runs against.
 * `host` is the CLI that executes; `provider` is whose outputs are generated,
 * and the two need not match.
 */
export interface CaseDefinition {
  id: string;
  name: string;
  scenario: ScenarioDefinition;
  fixture: FixtureDefinition;
  configuration: string;
  host?: Provider;
  provider?: Provider;
  feature?: string;
}

export interface StepReport {
  step: string;
  status: Outcome;
  graders: Record<string, 'pass' | 'fail'>;
  failures: string[];
  durationMs: number;
}

export interface CaseReport {
  case: string;
  passed: boolean;
  requiredGradersPassed: boolean;
  graders: Record<string, 'pass' | 'fail'>;
  failures: string[];
  durationMs: number;
  provider?: Provider;
  host?: Provider;
  scenario: string;
  fixture: string;
  configuration: string;
  feature?: string;
  status: Outcome;
  steps: StepReport[];
}

/** A row of `cases/registry.ts` — the id and spec path only, so importing the
 * registry never registers a test.
 */
export interface CaseEntry {
  id: string;
  path: string;
}
