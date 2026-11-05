/** Literal contracts shared across the provider adapter and launch CLI scripts.
 * Centralized so every script validates the same shapes the same way.
 */

// Provider names this adapter's rendering code has a branch for (agent-format.mjs's
// explicit provider dispatch, mcp-config.mjs's Codex-combines-settings-and-mcp behavior, the
// `{{provider:input}}` token). `canonical/manifest.json` is the source of truth for
// everything else about a provider — its paths, `agentFormat`, `invocationPrefix` —
// this only bounds which manifest provider entries this version can actually render.
export const PROVIDER_NAMES = ['claude', 'codex', 'copilot'];
// Agent output shapes the renderer implements (agent-format.mjs). The manifest
// declares which one each provider uses; this only rejects one the renderer doesn't.
export const SUPPORTED_AGENT_FORMATS = ['markdown', 'toml'];
// A provider's invocation prefix is free text the manifest owns (e.g. `/`, `$`);
// this only bounds it to a short, non-whitespace token suitable for `{{provider:invoke:*}}`.
export const INVOCATION_PREFIX_RE = /^\S{1,4}$/;

// manifest.json's `canonical` block: package-relative roots for deployable payload.
export const CANONICAL_PATH_KEYS = ['skills', 'agents', 'docs', 'settings', 'mcp'];
// manifest.json's per-provider block: project-relative install destinations plus format hints.
export const PROVIDER_PATH_KEYS = [
  'skills',
  'agents',
  'instructions',
  'settings',
  'mcp',
  'runtimeSource',
  'agentRuntime',
];

export const SKILL_ENTRYPOINT = { source: 'TEMPLATE.md', target: 'SKILL.md' };
export const INTENT_FILENAME = 'INTENT.md';

// Canonical agent frontmatter: unknown fields fail rather than silently losing
// provider-specific behavior when rendered into a native agent format.
export const AGENT_FRONTMATTER_FIELDS = ['name', 'description', 'tools', 'model', 'metadata'];
export const AGENT_WRITE_TOOLS = ['Write', 'Edit'];

// canonical/mcp.json server declarations: fields understood by the codex renderer.
export const MCP_SERVER_FIELDS = ['command', 'args', 'env', 'url', 'type', 'bearerTokenEnvVar'];

// A project token is a bare `{{PROJECT_KEY}}`-shaped placeholder resolved by the
// materializer against frozen `knowns`. A runtime token is the broader shape that
// also matches provider/runtime placeholders like `{{provider:invoke:dev}}`, used
// only to detect anything left unresolved in a finalized output.
export const PROJECT_TOKEN_RE = /\{\{[A-Z][A-Z0-9_]*\}\}/g;
export const PROJECT_TOKEN_EXACT_RE = /^\{\{[A-Z][A-Z0-9_]*\}\}$/;
export const RUNTIME_TOKEN_RE = /\{\{[A-Za-z_][A-Za-z0-9_:.-]*\}\}/g;

export const RUN_ID_RE = /^[a-zA-Z0-9_-]+$/;
export const SHA256_RE = /^[a-f0-9]{64}$/;
// A safe installed name: skill id, template id, or an agent's chosen instance name.
export const SAFE_NAME_RE = /^[a-z][a-z0-9-]*$/;
