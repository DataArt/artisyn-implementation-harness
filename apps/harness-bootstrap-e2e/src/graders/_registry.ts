/** The single import surface for scenario configuration: every check a
 * scenario can list, re-exported from the concern module that owns it.
 *
 * These are `GraderBinding` factories — they resolve their arguments from the
 * run's `GradeContext`. The pure `grade*(…)` functions they wrap stay in the
 * concern modules and are imported directly by their unit specs, which test
 * behaviour rather than wiring.
 *
 * A new check belongs in the module for its concern, then here.
 */

// Files and placeholders
export { filesystemCheck } from './filesystem.grader.ts';
export { noUnresolvedProviderPlaceholders } from './placeholders.grader.ts';
export { referencesResolve } from './references.grader.ts';
export { intentCleanup } from './cleanup.grader.ts';

// Launch state and receipts
export { launchState } from './state.grader.ts';

// Provider configuration
export { mcpConfigured } from './mcp.grader.ts';
export { codexPlanToolConfigured } from './config.grader.ts';
export { adaptationsComplete } from './adaptation.grader.ts';

// How the agent worked, read from the run transcript
export {
  agentRunSucceeded,
  taskTrackingUsed,
  noPlanModeDuringAutomatedRun,
} from './agent-behavior.grader.ts';

// Documentation adoption
export {
  rootReadmeBudget,
  appReadmesLinkToArchitecture,
  hldCoversContainers,
  docsIndexExists,
  containerAgentsDeployed,
  docsGraphAdopted,
} from './docs-adoption.grader.ts';

// Cross-provider projection consistency
export { skillProjectionConsistency, agentProjectionConsistency } from './projection.grader.ts';

// Patch bundles
export {
  patchManifestSchema,
  patchBundleHashes,
  patchApplyReconstruction,
  patchProviderScope,
} from './patch.grader.ts';
