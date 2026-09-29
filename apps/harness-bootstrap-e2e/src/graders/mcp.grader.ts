import { PROVIDERS } from '../testkit/providers.ts';
import fs from 'node:fs';
import path from 'node:path';
import type { Provider } from '../testkit/build-launch.ts';
import type { GradeResult } from './filesystem.grader.ts';

/** Confirm the selected provider has a real AWS MCP declaration, not just
 * setup prose. Credentials intentionally remain outside the fixture. */
export function gradeMcpConfigured(
  root: string,
  provider: Provider,
  serverName: string
): GradeResult {
  const configPath =
    provider === PROVIDERS.claude
      ? path.join(root, '.mcp.json')
      : path.join(root, '.codex/config.toml');
  let configured = false;
  if (fs.existsSync(configPath)) {
    const text = fs.readFileSync(configPath, 'utf8');
    if (provider === PROVIDERS.claude) {
      try {
        const server = JSON.parse(text)?.mcpServers?.[serverName];
        configured =
          server?.command === 'uvx' &&
          server.args?.includes('mcp-proxy-for-aws-cli@latest') &&
          server.args?.includes('https://aws-mcp.us-east-1.api.aws/mcp') &&
          server.args?.includes('AWS_REGION=us-east-1');
      } catch {
        configured = false;
      }
    } else {
      const section = text.split(/(?=^\[)/m).find((candidate) => {
        const header = candidate.split(/\r?\n/, 1)[0]?.replaceAll('"', '').replace(/\s/g, '');
        return header === `[mcp_servers.${serverName}]`;
      });
      configured = Boolean(
        section &&
        /^\s*"?command"?\s*=\s*"uvx"\s*$/m.test(section) &&
        section.includes('mcp-proxy-for-aws-cli@latest') &&
        section.includes('https://aws-mcp.us-east-1.api.aws/mcp') &&
        section.includes('AWS_REGION=us-east-1')
      );
    }
  }
  return {
    grader: 'mcp-configuration',
    pass: configured,
    failures: configured
      ? []
      : [`${provider} config does not declare the selected ${serverName} AWS MCP server`],
  };
}
