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
  const servers = codexMcp(mcp.mcpServers);
  if (provider === 'codex') return toml({ ...settings.codex, mcp_servers: servers });
  if (kind === 'settings') return JSON.stringify(settings.claude, null, 2) + '\n';
  return JSON.stringify(claudeMcp(mcp), null, 2) + '\n';
}
