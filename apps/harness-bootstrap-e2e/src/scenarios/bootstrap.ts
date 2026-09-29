import { PROVIDERS } from '../testkit/providers.ts';
import { fixtures } from '../../fixtures/registry.ts';
import { runBootstrap } from './boot-e2e.shared.ts';
import type { ScenarioDefinition } from '../testkit/scenario.ts';

export const bootstrapScenario: ScenarioDefinition = {
  id: 'bootstrap',
  steps: [
    {
      id: 'bootstrap',
      async run({ case: definition }) {
        if (
          definition.fixture !== fixtures.multiContainerProject ||
          definition.configuration !== 'aws-dev'
        )
          throw new Error('Bootstrap currently supports multi-container-project with aws-dev only');
        const { host, provider } = definition;
        if (
          (host !== PROVIDERS.claude && host !== PROVIDERS.codex) ||
          (provider !== PROVIDERS.claude && provider !== PROVIDERS.codex)
        )
          throw new Error('Bootstrap requires a Claude or Codex host and provider');
        return runBootstrap(provider, host, definition.fixture);
      },
    },
  ],
};
