# MCP Setup for Developers

This project uses [mcp-atlassian](https://github.com/sooperset/mcp-atlassian) to give the AI assistant access to Jira and Confluence.

## Prerequisites

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) — the MCP server runs via `uvx`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 1. Generate Personal Access Tokens

Generate a PAT for each service (bearer token auth, no expiry recommended for local dev):

- **Jira PAT** — `<your-jira-url>/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens`
- **Confluence PAT** — `<your-confluence-url>/plugins/personalaccesstokens/usertokens.action`

## 2. Add your tokens to `.claude/settings.local.json`

For Claude Code, store MCP PATs only in this per-developer file's `env` block.
Do not create an MCP .env file or add tokens to application .env files. Verify that
.claude/settings.local.json is gitignored. Merge the entries below into existing
settings; preserve permissions, hooks and other environment entries. Include only
the selected services. The developer fills the real PAT locally in their editor;
bootstrap writes placeholders only, never asks for tokens in chat, and never copies
secret values into answers.json, reports, manifests or shared .mcp.json.

Add (or fill in) the `env` block:

```jsonc
{
  "env": {
    "JIRA_PERSONAL_TOKEN": "<your-jira-pat>",
    "CONFLUENCE_PERSONAL_TOKEN": "<your-confluence-pat>",
  },
}
```

Claude Code loads this on session start and resolves `.mcp.json`'s `${JIRA_PERSONAL_TOKEN}` /
`${CONFLUENCE_PERSONAL_TOKEN}` references from it — no separate `.env` file or shell `source` step
needed.

## 3. Start or restart Claude Code

The `.mcp.json` at the project root is picked up automatically. Claude Code will prompt you to approve the MCP server on first use.

```bash
claude
```

Verify the server is connected with:

```bash
claude mcp list
```
