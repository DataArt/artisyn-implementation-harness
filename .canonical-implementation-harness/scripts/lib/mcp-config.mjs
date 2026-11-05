/** Render `canonical/settings.json` + `canonical/mcp.json` into each provider's
 * native settings/MCP configuration.
 */
import { MCP_SERVER_FIELDS } from './constants.mjs';
import { toml } from './agent-format.mjs';

function renderStdioServer(name, server) {
  const out = { command: server.command };
  if (server.args) out.args = server.args;
  const vars = [];
  for (const [key, v] of Object.entries(server.env ?? {})) {
    if (v !== '${' + key + '}')
      throw new Error(`MCP env ${name}.${key} must reference its own environment variable`);
    vars.push(key);
  }
  if (vars.length) out.env_vars = vars;
  return out;
}

function renderHttpServer(server) {
  if (server.env) throw new Error('HTTP MCP env is not supported');
  const out = { url: server.url };
  if (server.bearerTokenEnvVar) out.bearer_token_env_var = server.bearerTokenEnvVar;
  return out;
}

/** Render canonical MCP server declarations into Codex's `mcp_servers` table:
 * stdio secrets become `env_vars` names, HTTP bearer auth becomes
 * `bearer_token_env_var` — never a literal credential value either way.
 */
function codexMcp(servers) {
  const result = {};
  for (const [name, server] of Object.entries(servers)) {
    for (const key of Object.keys(server))
      if (!MCP_SERVER_FIELDS.includes(key)) throw new Error(`Unsupported MCP field ${name}.${key}`);
    if (server.type && server.type !== (server.command ? 'stdio' : 'http'))
      throw new Error(`Unsupported MCP transport: ${server.type}`);
    if (server.command && !server.url) result[name] = renderStdioServer(name, server);
    else if (server.url && !server.command) result[name] = renderHttpServer(server);
    else throw new Error(`MCP ${name} needs command or url`);
  }
  return result;
}

/** Render canonical MCP server declarations into Claude's `.mcp.json` shape:
 * a bearer-token HTTP server becomes an `Authorization: Bearer ${VAR}` header.
 */
function claudeMcp(mcp) {
  const claude = structuredClone(mcp);
  for (const server of Object.values(claude.mcpServers)) {
    if (server.bearerTokenEnvVar) {
      server.headers = { Authorization: `Bearer \${${server.bearerTokenEnvVar}}` };
      delete server.bearerTokenEnvVar;
    }
  }
  return claude;
}

/** Render one provider config file (`kind`: 'settings' or 'mcp') from the
 * canonical settings/MCP JSON. Codex always combines both into one TOML file
 * regardless of `kind`; Claude renders each `kind` to its own native file.
 * MCP declarations are validated for both providers even when only settings
 * are being rendered, so an unsupported entry never disappears silently.
 */
export function renderConfig(kind, provider, settings, mcp) {
  if (settings.schemaVersion !== 1 || !mcp.mcpServers)
    throw new Error('Invalid canonical configuration');
  if (!['claude', 'codex', 'copilot'].includes(provider))
    throw new Error(`Unknown provider: ${provider}`);
  if (!['settings', 'mcp'].includes(kind)) throw new Error(`Unknown config kind: ${kind}`);
  const servers = codexMcp(mcp.mcpServers);
  if (provider === 'copilot') return renderCopilotConfig(kind, settings, mcp);
  if (provider === 'codex') return toml({ ...settings.codex, mcp_servers: servers });
  if (kind === 'settings') return JSON.stringify(settings.claude, null, 2) + '\n';
  return JSON.stringify(claudeMcp(mcp), null, 2) + '\n';
}

const COPILOT_SETTING_TYPES = {
  companyAnnouncements: 'array',
  contextTier: 'string',
  deniedUrls: 'array',
  disableAllHooks: 'boolean',
  disabledMcpServers: 'array',
  disabledSkills: 'array',
  effortLevel: 'string',
  enabledPlugins: 'object',
  extraKnownMarketplaces: 'object',
  hooks: 'object',
  includeCoAuthoredBy: 'boolean',
  mergeStrategy: 'string',
  model: 'string',
  respectGitignore: 'boolean',
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonemptyString = (value) => typeof value === 'string' && value.trim().length > 0;

function validateCopilotMarketplaces(marketplaces) {
  for (const [name, entry] of Object.entries(marketplaces)) {
    const source = entry?.source;
    const required = { github: 'repo', git: 'url', directory: 'path' };
    if (
      !isObject(entry) ||
      !isObject(source) ||
      !Object.hasOwn(required, source.source) ||
      !nonemptyString(source[required[source.source]]) ||
      (source.source === 'github' && !/^[^/\s]+\/[^/\s]+$/.test(source.repo)) ||
      ['ref', 'path'].some((key) => Object.hasOwn(source, key) && !nonemptyString(source[key])) ||
      (Object.hasOwn(entry, 'autoUpdate') && typeof entry.autoUpdate !== 'boolean')
    )
      throw new Error(`Invalid Copilot extraKnownMarketplaces entry: ${name}`);
  }
}

function renderCopilotConfig(kind, settings, mcp) {
  const native = settings.copilot;
  if (!native || typeof native !== 'object' || Array.isArray(native))
    throw new Error('Missing native settings for copilot');
  for (const [key, value] of Object.entries(native)) {
    const type = Array.isArray(value) ? 'array' : typeof value;
    if (
      !Object.hasOwn(COPILOT_SETTING_TYPES, key) ||
      value === null ||
      COPILOT_SETTING_TYPES[key] !== type
    )
      throw new Error(`Unsupported Copilot repository setting: ${key}`);
    if (type === 'array' && value.some((v) => typeof v !== 'string'))
      throw new Error(`Copilot repository setting ${key} requires strings`);
  }
  if (
    Object.hasOwn(native, 'enabledPlugins') &&
    Object.values(native.enabledPlugins).some((value) => typeof value !== 'boolean')
  )
    throw new Error('Copilot enabledPlugins requires boolean values');
  if (Object.hasOwn(native, 'extraKnownMarketplaces'))
    validateCopilotMarketplaces(native.extraKnownMarketplaces);
  if (
    Object.hasOwn(native, 'contextTier') &&
    !['default', 'long_context'].includes(native.contextTier)
  )
    throw new Error('Unsupported Copilot contextTier');
  if (Object.hasOwn(native, 'mergeStrategy') && !['merge', 'rebase'].includes(native.mergeStrategy))
    throw new Error('Unsupported Copilot mergeStrategy');
  if (kind === 'settings') return JSON.stringify(native, null, 2) + '\n';
  const servers = {};
  for (const [name, server] of Object.entries(mcp.mcpServers)) {
    if (server.bearerTokenEnvVar && !server.url)
      throw new Error(`MCP ${name} bearer token requires HTTP transport`);
    const out = structuredClone(server);
    // Preserve environment references; never resolve credentials during rendering.
    const variable = (key) => `\${${key}}`;
    if (out.env)
      out.env = Object.fromEntries(Object.keys(out.env).map((key) => [key, variable(key)]));
    if (out.bearerTokenEnvVar) {
      out.headers = { Authorization: `Bearer ${variable(out.bearerTokenEnvVar)}` };
      delete out.bearerTokenEnvVar;
    }
    out.type = server.command ? 'stdio' : 'http';
    out.tools = ['*'];
    servers[name] = out;
  }
  return JSON.stringify({ mcpServers: servers }, null, 2) + '\n';
}
