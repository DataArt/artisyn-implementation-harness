# MCP Setup for Developers

This project gives the AI assistant access to selected external services via MCP
servers, proposed from actual project evidence at launch — see
`01b Launch install.md`'s "Evidence-based MCP server proposal" in the harness
package for the evidence-to-server mapping. **Keep only the section(s) below for
services this project actually selected; delete the rest when personalizing this
doc.**

Server declarations are shared and tracked; credential **values** are always local
to your machine. Never commit credential values, paste them into a chat, or
copy them into launch answers, reports or manifests. Where a step differs per AI
coding tool, the selected providers' routes are given — follow the one for the tool you actually
run, and see `04 AI Coding Tool Compatibility.md` for the full file mapping.

## Atlassian (Jira / Confluence)

Uses [mcp-atlassian](https://github.com/sooperset/mcp-atlassian), run via `uvx` —
install [uv](https://docs.astral.sh/uv/getting-started/installation/) first:

```bash
pipx install uv
```

Generate a PAT for each service (bearer token auth, no expiry recommended for
local dev):

- **Jira PAT** — `<your-jira-url>/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens`
- **Confluence PAT** — `<your-confluence-url>/plugins/personalaccesstokens/usertokens.action`

**Claude Code** — store the PATs in the per-developer settings file's `env` block.
Confirm that file is gitignored, and merge into what is already there: preserve
existing permissions, hooks and environment entries.

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

**Codex / Copilot** — export the same values into the environment used to launch
the assistant (see the provider credential sections below):

```bash
export JIRA_PERSONAL_TOKEN="<your-jira-pat>"
export CONFLUENCE_PERSONAL_TOKEN="<your-confluence-pat>"
```

## AWS (aws-mcp)

Uses the AWS managed MCP Server through
[`mcp-proxy-for-aws-cli`](https://github.com/aws/mcp-proxy-for-aws), run via `uvx` —
install [uv](https://docs.astral.sh/uv/getting-started/installation/) first (see
command above if not already installed). The bootstrap configures the server in the
selected provider's native MCP file; the server launches with
`uvx mcp-proxy-for-aws-cli@latest https://aws-mcp.${AWS_REGION}.api.aws/mcp --metadata AWS_REGION=${AWS_REGION}`,
where `${AWS_REGION}` is the project's confirmed AWS region — deployment
configuration, resolved per project, never hardcoded here.

No token is stored in the project config. The proxy uses the local AWS credential
chain (for example, an AWS CLI profile, SSO session, environment credentials, or an
IAM role). Configure and verify local credentials with AWS CLI before calling tools;
for an SSO profile, sign in with `aws sso login --profile <profile>` and select it in
the environment used to launch the coding assistant:

```bash
export AWS_PROFILE="<your-aws-profile>"
```

The MCP declaration's `--metadata AWS_REGION=${AWS_REGION}` sets the default region
for AWS operations, resolved to the project's confirmed region at launch. Never put
credential values — or a literal region — in MCP config, source control, launch
answers, or reports.

## GitHub (`@modelcontextprotocol/server-github`)

Run via `npx` — no separate install step beyond Node itself.

Generate a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)
scoped to this repository only (read/write on contents, issues, pull requests —
narrower if the project only needs a subset).

**Claude Code**:

```jsonc
// .claude/settings.local.json
{
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-github-pat>",
  },
}
```

**Codex / Copilot** — export the same value into the assistant's process environment:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="<your-github-pat>"
```

## Codex credentials

MCP servers are declared in `.codex/config.toml`, which is tracked and must stay
free of secrets. A stdio server names the variables it needs via `env_vars`, and
an HTTP server names one via `bearer_token_env_var`; in both cases the values
come from your own process environment — export them in your shell profile as
shown per service above. Do not copy a Claude `settings.local.json` into Codex —
the two tools read credentials differently, and the file has no meaning there.

## Copilot credentials

MCP servers are declared in the shared `.mcp.json` under `mcpServers`. A stdio
server's `env` uses references such as `"TOKEN": "${TOKEN}"`; an HTTP server's
`headers` can use `"Authorization": "Bearer ${TOKEN}"`. Supply values through the
process environment used to start Copilot. If starting from an editor, ensure that
editor inherits the variables too; exporting them in an unrelated terminal is insufficient.
Do not put tokens in `.github/copilot/settings.json` or assume Claude's local `env`
settings provide credentials to Copilot.

Claude and Copilot may read the same `.mcp.json`. Preserve existing servers and
verify both installed consumers when changing it. Keep existing editor MCP
configuration unless its migration is explicitly requested. Copilot includes a
GitHub integration: verify whether it meets the need before adding a duplicate server.
Personal overrides in `.github/copilot/settings.local.json` must be gitignored;
that file is not a credential store.

## Provide only what's selected

Include only the services this project actually selected. Bootstrap writes
placeholders and environment-variable references only; you fill the real values
in your editor or shell. Never create an MCP `.env` file or add these tokens to
application `.env` files.

## Start or restart your AI coding tool

Project MCP configuration is picked up at session start, so restart after editing
it. The tool prompts you to approve each server on first use; installing
configuration does not grant that approval on your behalf.

Inspect configured servers with the host's MCP listing — for Claude Code:

```bash
claude mcp list
```

For Copilot, use the host's MCP view or `copilot mcp list` in a terminal. A listed
configuration does not prove a connection: verify the required server tools in the
active session. Missing capabilities remain unverified.

If a server does not appear, check that the variables are set in the environment
the tool actually starts from, then restart the session.
