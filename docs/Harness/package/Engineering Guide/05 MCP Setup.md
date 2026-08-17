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

## 2. Create a root `.env` file

Create `.env` in the project root (it is gitignored — never commit it):

```bash
JIRA_PERSONAL_TOKEN=<your-jira-pat>
CONFLUENCE_PERSONAL_TOKEN=<your-confluence-pat>
```

## 3. Load env vars in your shell session

The MCP server reads these from your environment. Source the file before starting your AI assistant:

```bash
source .env
```

Or add it to your shell profile / use a tool like [direnv](https://direnv.net/) to load it automatically.

## 4. Start Claude Code

The `.mcp.json` at the project root is picked up automatically. Claude Code will prompt you to approve the MCP server on first use.

```bash
claude
```

Verify the server is connected with:

```bash
claude mcp list
```
