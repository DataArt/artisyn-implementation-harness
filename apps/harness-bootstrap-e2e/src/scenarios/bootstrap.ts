import { requireProvider, when } from '../graders/grading.ts';
import { PROVIDERS, PROVIDER_DETAILS } from '../utils/providers.ts';
import { fixtures } from '../../fixtures/_registry.ts';
import { AGENT_RUN_TIMEOUT_MS, SKILL_FILE } from '../utils/constants.ts';
import type { ScenarioDefinition } from './_types.ts';
import {
  adaptationsComplete,
  agentRunSucceeded,
  appReadmesLinkToArchitecture,
  codexPlanToolConfigured,
  containerAgentsDeployed,
  docsIndexExists,
  filesystemCheck,
  hldCoversContainers,
  intentCleanup,
  launchState,
  mcpConfigured,
  noPlanModeDuringAutomatedRun,
  noUnresolvedProviderPlaceholders,
  referencesResolve,
  rootReadmeBudget,
  taskTrackingUsed,
} from '../graders/_registry.ts';
import { buildScratchLaunchPrompt } from './launch-prompt.ts';

export const bootstrapScenario: ScenarioDefinition = {
  id: 'bootstrap',

  requires: {
    fixtures: [fixtures.multiContainerProject],
    configurations: ['aws-dev'],
    hosts: [PROVIDERS.claude, PROVIDERS.codex],
    providers: [PROVIDERS.claude, PROVIDERS.codex],
  },
  workspaces: 1,
  installPackage: true,

  steps: [
    {
      id: 'launch',
      agent: {
        prompt: (c) =>
          buildScratchLaunchPrompt(requireProvider(c), c.host ?? requireProvider(c), c.fixture),
        timeoutMs: AGENT_RUN_TIMEOUT_MS,
      },
      // A host that exited non-zero leaves a workspace nothing else can be
      // judged against, so this gates the rest rather than joining them.
      graders: [agentRunSucceeded()],
    },
  ],

  graders: [
    taskTrackingUsed(),
    noPlanModeDuringAutomatedRun(),
    filesystemCheck('installed', (c) => ({
      base: c.root,
      exists: [
        `${PROVIDER_DETAILS[requireProvider(c)].skills}/dev/${SKILL_FILE}`,
        PROVIDER_DETAILS[requireProvider(c)].instructions,
      ],
    })),
    launchState({ verified: true }),
    referencesResolve(),
    intentCleanup(),
    adaptationsComplete({ trackerSelected: false }),
    rootReadmeBudget(),
    mcpConfigured('aws-mcp'),
    when((c) => c.provider === PROVIDERS.codex, codexPlanToolConfigured()),
    appReadmesLinkToArchitecture(),
    hldCoversContainers(),
    docsIndexExists(),
    containerAgentsDeployed(),
    noUnresolvedProviderPlaceholders((c) => [PROVIDER_DETAILS[requireProvider(c)].skills]),
  ],
};
