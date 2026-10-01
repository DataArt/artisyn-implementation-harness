import { PROVIDERS } from '../../../utils/providers.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { gradeMcpConfigured } from '../../../graders/mcp.grader.ts';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function tempRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-grader-'));
  roots.push(root);
  return root;
}

it('passes only when Claude declares the selected AWS MCP server', () => {
  const root = tempRoot();
  expect(gradeMcpConfigured(root, PROVIDERS.claude, 'aws-mcp').pass).toBe(false);
  fs.writeFileSync(
    path.join(root, '.mcp.json'),
    JSON.stringify({
      mcpServers: {
        'aws-mcp': {
          command: 'uvx',
          args: [
            'mcp-proxy-for-aws-cli@latest',
            'https://aws-mcp.us-east-1.api.aws/mcp',
            '--metadata',
            'AWS_REGION=us-east-1',
          ],
        },
      },
    })
  );
  expect(gradeMcpConfigured(root, PROVIDERS.claude, 'aws-mcp').pass).toBe(true);
});

it('passes only when Codex declares the selected AWS MCP server', () => {
  const root = tempRoot();
  fs.mkdirSync(path.join(root, '.codex'));
  const config = path.join(root, '.codex/config.toml');
  expect(gradeMcpConfigured(root, PROVIDERS.codex, 'aws-mcp').pass).toBe(false);
  fs.writeFileSync(
    config,
    '[mcp_servers.aws-mcp]\ncommand = "uvx"\nargs = ["mcp-proxy-for-aws-cli@latest", "https://aws-mcp.us-east-1.api.aws/mcp", "--metadata", "AWS_REGION=us-east-1"]\n'
  );
  expect(gradeMcpConfigured(root, PROVIDERS.codex, 'aws-mcp').pass).toBe(true);
});
