---
agent: onboarding
output: .claude/agents/onboarding.md
---

## Purpose

Conversational onboarding guide. Greets new developers, asks about their role, and walks them through setup step-by-step — one topic at a time. Never runs commands. Always searches `docs/` before admitting it doesn't know something.

## Substitutions

| Placeholder                    | Source                          | Notes                                                                                   |
| ------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------- |
| `{{PROJECT_NAME}}`             | Q1 — project name               | Used in agent persona and greeting                                                      |
| `{{SYSTEM_PREREQUISITES}}`     | Project setup docs              | Comma-separated list of tools the developer must have (e.g. "Node 20+, Docker Desktop") |
| `{{INSTALL_DEPENDENCIES_CMD}}` | Project setup docs              | Command to install all dependencies (e.g. `corepack enable && yarn install`)            |
| `{{DB_START_CMD}}`             | Project setup docs              | Command to start the local database (e.g. `yarn nx run db:up`)                          |
| `{{DB_MIGRATE_CMD}}`           | Project setup docs              | Command to run DB migrations (e.g. `yarn nx run db:migrate`)                            |
| `{{BFF_ENV_EXAMPLE}}`          | Project setup docs              | Path to the BFF env example file (e.g. `apps/serving/bff/.env.example`)                 |
| `{{DEV_START_CMD}}`            | Project setup docs              | Command to start the full dev stack locally                                             |
| `{{LOCAL_WEB_URL}}`            | Project setup docs              | Local URL for the web app (e.g. `http://localhost:3000`)                                |
| `{{LOCAL_API_URL}}`            | Project setup docs              | Local URL for the BFF / API Swagger (e.g. `http://localhost:3001/api`)                  |
| `{{JIRA_PAT_URL}}`             | Atlassian instance — Jira       | Full URL to the Jira personal access token creation page                                |
| `{{CONFLUENCE_PAT_URL}}`       | Atlassian instance — Confluence | Full URL to the Confluence personal access token creation page                          |
| `{{BFF_README_PATH}}`          | Project repo                    | Path to the BFF README (e.g. `apps/serving/bff/README.md`)                              |

## Conditionals

- If the project does not use Confluence: remove the Confluence PAT step
- If the project does not use Jira: remove the Jira PAT step and root `.env` block
- If no local database: remove the DB start/migrate steps
- If no MCP server: remove the Claude Code + MCP step

## Verify checklist

- [ ] `{{PROJECT_NAME}}` matches what developers call the platform internally
- [ ] `{{SYSTEM_PREREQUISITES}}` matches `docs/Engineering Guide/01 Onboarding.md` prerequisites list
- [ ] `{{INSTALL_DEPENDENCIES_CMD}}` is the actual command from `docs/Engineering Guide/02 Quick Start.md`
- [ ] `{{JIRA_PAT_URL}}` and `{{CONFLUENCE_PAT_URL}}` are valid deep-link URLs to the token creation pages
- [ ] `{{LOCAL_WEB_URL}}` and `{{LOCAL_API_URL}}` match the actual ports in the dev stack
- [ ] `{{BFF_README_PATH}}` exists in the repo
- [ ] Ground rules block ("Talk first, never run commands") is present verbatim
