---
id: b21edcd0
purpose: How to generate and wire MCP credentials so Claude Code can reach AWS, GitHub, and Atlassian
keywords: [MCP, Claude Code, AWS credentials, GitHub token, Atlassian, settings.local.json]
---

# MCP Setup

_Connect Claude Code to AWS, GitHub, and Atlassian via Model Context Protocol._

---

## Prerequisites

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) — the AWS and Atlassian MCP servers run via `uvx`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## 1. Generate your credentials

Credentials are stored only in `.claude/settings.local.json`'s `env` block — a per-developer file, already gitignored. There is no `.env` file and nothing to `source`; do not create one.

### AWS

| Variable      | Description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| `AWS_PROFILE` | Named profile in `~/.aws/credentials` or `~/.aws/config` (SSO). Default: `unqlo-demo`. |
| `AWS_REGION`  | AWS region for MCP calls. Default: `eu-west-1`.                                        |

Verify your profile is working:

```bash
aws sts get-caller-identity --profile "$AWS_PROFILE"
```

A valid JSON response with your `Account` and `Arn` confirms the AWS MCP server will authenticate correctly.

### Atlassian (Cloud)

| Variable                   | Description                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `CONFLUENCE_URL`           | Atlassian Cloud base URL, e.g. `https://your-org.atlassian.net/wiki`                                                |
| `CONFLUENCE_USERNAME`      | Your Atlassian account email                                                                                        |
| `CONFLUENCE_API_TOKEN`     | Generate at [id.atlassian.com → Security → API tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |
| `CONFLUENCE_SPACES_FILTER` | Comma-separated space keys to expose, e.g. `TS`                                                                     |
| `JIRA_URL`                 | Atlassian Cloud base URL, e.g. `https://your-org.atlassian.net`                                                     |
| `JIRA_USERNAME`            | Your Atlassian account email                                                                                        |
| `JIRA_API_TOKEN`           | Same token as Confluence                                                                                            |
| `JIRA_PROJECTS_FILTER`     | Comma-separated project keys to expose, e.g. `SP`                                                                   |

### GitHub

| Variable                       | Description                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | Generate at [github.com/settings/tokens](https://github.com/settings/tokens) — scopes: `repo`, `read:org`, `read:user` |

---

## 2. Add your credentials to `.claude/settings.local.json`

Store MCP credentials only in this per-developer file's `env` block. Do not create an MCP `.env` file or add tokens to application `.env.<env>` files (those are a separate, unrelated build-config mechanism — see `Infrastructure/00 Configuration & Secrets.md`). Verify `.claude/settings.local.json` is gitignored. Merge the block below into your existing file; preserve any other keys already there (permissions, hooks, `enabledMcpjsonServers`).

```jsonc
{
  "env": {
    "AWS_PROFILE": "<your-profile>",
    "AWS_REGION": "<your-region>",
    "CONFLUENCE_URL": "<your-confluence-url>",
    "CONFLUENCE_USERNAME": "<your-atlassian-email>",
    "CONFLUENCE_API_TOKEN": "<your-atlassian-api-token>",
    "CONFLUENCE_SPACES_FILTER": "<your-space-keys>",
    "JIRA_URL": "<your-jira-url>",
    "JIRA_USERNAME": "<your-atlassian-email>",
    "JIRA_API_TOKEN": "<your-atlassian-api-token>",
    "JIRA_PROJECTS_FILTER": "<your-project-keys>",
    "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-github-pat>",
  },
}
```

Fill in only the services you use; an empty value for an unused service is fine — that server just won't authenticate.

---

## 3. Start or restart Claude Code

```bash
claude
```

`.claude/settings.local.json` is loaded on session start; `.mcp.json`'s `${AWS_PROFILE}`, `${CONFLUENCE_URL}`, `${GITHUB_PERSONAL_ACCESS_TOKEN}`, etc. resolve from it automatically — no separate `.env` file or shell `source` step needed. If you change a value, restart the session for it to take effect.

---

## 4. Verify connections

```bash
claude mcp list
```

All three servers should show as connected: `aws-mcp`, `atlassian`, and `github` (each only if its credentials are filled in).

---

→ See `01 Conventions.md` for commit format and branch naming.
→ See `04 AI Coding Tool Compatibility.md` for slash commands and MCP-powered agent roles.
