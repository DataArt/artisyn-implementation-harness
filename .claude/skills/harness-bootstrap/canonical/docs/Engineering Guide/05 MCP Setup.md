# MCP Setup for Developers

This project uses [mcp-atlassian](https://github.com/sooperset/mcp-atlassian) to give the AI assistant access to Jira and Confluence.

Server declarations are shared and tracked; credential **values** are always local to
your machine. Nothing in this guide is ever committed, pasted into a chat, or copied
into launch answers, reports or manifests. Where a step differs per AI coding tool,
both variants are given — follow the one for the tool you actually run, and see
`04 AI Coding Tool Compatibility.md` for the full file mapping.

## Prerequisites

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) — the MCP server runs via `uvx`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 1. Generate Personal Access Tokens

Generate a PAT for each service (bearer token auth, no expiry recommended for local dev):

- **Jira PAT** — `<your-jira-url>/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens`
- **Confluence PAT** — `<your-confluence-url>/plugins/personalaccesstokens/usertokens.action`

## 2. Provide the tokens locally

Include only the services this project actually selected. Bootstrap writes placeholders
and environment-variable references only; you fill the real values in your editor or
shell. Never create an MCP `.env` file or add these tokens to application `.env` files.

**Claude Code** — store the PATs in the per-developer settings file's `env` block.
Confirm that file is gitignored, and merge into what is already there: preserve existing
permissions, hooks and environment entries.

```jsonc
// .claude/settings.local.json
{
  "env": {
    "JIRA_PERSONAL_TOKEN": "<your-jira-pat>",
    "CONFLUENCE_PERSONAL_TOKEN": "<your-confluence-pat>",
  },
}
```

Claude Code loads this at session start and resolves the shared `.mcp.json`'s
`${JIRA_PERSONAL_TOKEN}` / `${CONFLUENCE_PERSONAL_TOKEN}` references from it — no
separate `.env` file or shell `source` step is needed.

**Codex** — MCP servers are declared in `.codex/config.toml`, which is tracked and must
stay free of secrets. A stdio server names the variables it needs via `env_vars`, and an
HTTP server names one via `bearer_token_env_var`; in both cases the values come from your
own process environment. Export them in your shell profile:

```bash
export JIRA_PERSONAL_TOKEN="<your-jira-pat>"
export CONFLUENCE_PERSONAL_TOKEN="<your-confluence-pat>"
```

Do not copy a Claude `settings.local.json` into Codex — the two tools read credentials
differently, and the file has no meaning there.

## 3. Start or restart your AI coding tool

Project MCP configuration is picked up at session start, so restart after editing it.
The tool prompts you to approve each server on first use; installing configuration does
not grant that approval on your behalf.

Verify the server is connected using your tool's own MCP listing — for Claude Code:

```bash
claude mcp list
```

If a server does not appear, check that the variables are set in the environment the
tool actually starts from, then restart the session.
