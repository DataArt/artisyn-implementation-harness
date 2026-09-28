---
agent: onboarding
output: {{provider:agents_root}}/onboarding.{{provider:agent_extension}}
---

## Purpose

Conversational onboarding guide. Greets new developers, asks about their role, and walks them through setup step-by-step — one topic at a time. Never runs commands. Always searches `docs/` before admitting it doesn't know something.

## Substitutions

| Placeholder                    | Source                           | Notes                                                                                                                                                 |
| ------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_NAME}}`             | Q1 — project name                | Used in agent persona and greeting                                                                                                                    |
| `{{COMPONENT_ROLE_OPTIONS}}`   | Q3 — CONTAINER_LIST              | Comma-separated actual component/container names (e.g. "web, BFF, data pipeline") — never a fixed frontend/backend/data split                         |
| `{{SYSTEM_PREREQUISITES}}`     | Project setup docs               | Comma-separated list of tools the developer must have (e.g. "Node 20+, Docker Desktop")                                                               |
| `{{INSTALL_DEPENDENCIES_CMD}}` | Project setup docs               | Command to install all dependencies (e.g. `corepack enable && yarn install`)                                                                          |
| `{{DB_START_CMD}}`             | Project setup docs               | Command to start the local database, only if one exists (e.g. `yarn nx run db:up`)                                                                    |
| `{{DB_MIGRATE_CMD}}`           | Project setup docs               | Command to run DB migrations, only if a database exists (e.g. `yarn nx run db:migrate`)                                                               |
| `{{DEV_START_CMD}}`            | Project setup docs               | Command to start the full dev stack locally                                                                                                           |
| `{{COMPONENT_SETUP_TABLE}}`    | Q3 — CONTAINER_LIST + setup docs | Markdown table: Component \| Env file example \| Local URL. One row per actual component that has a local env file or dev URL — never assumes web/BFF |
| `{{TRACKER_NAME}}`             | Q5 — selected tracker            | e.g. "Jira", "Linear", "GitHub Issues" — omit the tracker step entirely if Q5 selected none                                                           |
| `{{TRACKER_PAT_URL}}`          | Q5 — tracker instance            | Full URL to the tracker's personal access/API token creation page                                                                                     |
| `{{WIKI_NAME}}`                | Q5 — optional wiki/board detail  | e.g. "Confluence" — omit the wiki step if Q5 recorded no wiki                                                                                         |
| `{{WIKI_PAT_URL}}`             | Q5 — optional wiki/board detail  | Full URL to the wiki's personal access token creation page                                                                                            |
| `{{PROJECT_SETUP_DOCS}}`       | Project repo                     | Markdown list of this project's own prerequisites/quick-start docs, if any exist outside the Engineering Guide — omit the bullet if none exist        |

## Conditionals

- If the project uses no tracker (Q5 = none): remove the "Tracker credentials" step and its `{{TRACKER_NAME}}`/`{{TRACKER_PAT_URL}}` substitutions
- If the project uses no wiki/board (Q5 has no Confluence/wiki detail): remove the "Wiki credentials" step and its `{{WIKI_NAME}}`/`{{WIKI_PAT_URL}}` substitutions
- If no MCP server is selected: remove the "Integration credentials and availability" step
- If no local database: remove the "Local database" step and its DB placeholders
- If the project has no separate local prerequisites/quick-start docs: remove the `{{PROJECT_SETUP_DOCS}}` bullet
- `{{COMPONENT_SETUP_TABLE}}` always has at least one row; a single-component project gets a one-row table, not a removed section

## Verify checklist

- [ ] `{{PROJECT_NAME}}` matches what developers call the platform internally
- [ ] `{{COMPONENT_ROLE_OPTIONS}}` lists the project's actual components from Q3 — never a fixed frontend/backend/data split
- [ ] `{{SYSTEM_PREREQUISITES}}` matches the project's own setup docs' prerequisites list
- [ ] `{{INSTALL_DEPENDENCIES_CMD}}` is the actual command from the project's own setup docs
- [ ] `{{COMPONENT_SETUP_TABLE}}` covers every component with a local env file or dev URL, with real paths and ports — no placeholder rows left unresolved
- [ ] `{{TRACKER_NAME}}`/`{{TRACKER_PAT_URL}}` (if present) match Q5's selected tracker, not a hardcoded Jira assumption
- [ ] `{{WIKI_NAME}}`/`{{WIKI_PAT_URL}}` (if present) match Q5's recorded wiki, or the step is removed
- [ ] Every "Key docs" reference resolves to a document that actually exists in this installation
- [ ] Ground rules block ("Talk first, never run commands") is present verbatim
