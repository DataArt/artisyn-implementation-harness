/** Workspace-relative path segments and well-known filenames shared across
 * graders, scenarios and testkit. Absolute, repo-anchored paths live in
 * `utils/paths.ts` instead.
 */

/** Every directory a provider may materialize into, for whole-tree scans. */
export const PROVIDER_DIRS = ['.claude', '.agents', '.codex'];

export const LAUNCH_DIR = 'state/launch';
export const LAUNCH_RUNS_DIR = 'state/launch/runs';
export const LAUNCH_REPORTS_DIR = 'state/launch/reports';
export const LAUNCH_OPERATION_FILE = 'state/launch/operation.json';
export const OPERATIONS_DIR = 'state/operations';
export const LAUNCH_REPORT_SUFFIX = '-launch.md';

export const MATERIALIZATION_FILE = 'materialization.json';
export const VERIFICATION_FILE = 'verification.json';

export const CANONICAL_MANIFEST = 'canonical/manifest.json';
export const CANONICAL_SKILLS = 'canonical/skills';
export const CANONICAL_AGENTS = 'canonical/agents';

export const SKILL_FILE = 'SKILL.md';
export const INTENT_FILE = 'INTENT.md';

/** The launch report's fixed stage table length. */
export const LAUNCH_STAGE_COUNT = 15;

/** Whether a scratch workspace is deleted once its run finishes.
 *
 * Currently **off** while the engine rewrite settles, so every run leaves its
 * project on disk to inspect. The cost is that unit and integration runs —
 * which create a fixture per case — accumulate directories under the OS
 * tmpdir until they are cleared by hand. Flip this back to `true` once
 * inspecting every run stops being useful.
 */
export const CLEANUP_WORKSPACES = false;

const MINUTE_MS = 60_000;

/** A full launch — Q&A through verification — is a long single turn. */
export const AGENT_RUN_TIMEOUT_MS = 60 * MINUTE_MS;

/** Fallback for a runner invoked without an explicit budget, such as a patch
 * prepare/apply turn, which is far shorter than a launch.
 */
export const DEFAULT_RUNNER_TIMEOUT_MS = 5 * MINUTE_MS;

/** Vitest must outlast the run it supervises, or it kills the CLI first and
 * the failure looks like a harness bug rather than a timeout.
 */
export const AGENT_E2E_TEST_TIMEOUT_MS = AGENT_RUN_TIMEOUT_MS + 5 * MINUTE_MS;

export const PROVIDER_PLACEHOLDER_RE = /\{\{provider:[a-z_]+(?::[a-z-]+)?\}\}/;

/** A fresh regex per call: a shared `/g` literal carries `lastIndex` between
 * callers, so successive scans would silently start mid-string.
 */
export const projectPlaceholderPattern = () => /\{\{[A-Z][A-Z0-9_]*\}\}/g;
