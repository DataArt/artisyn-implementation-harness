---
skill: agents/scrum-master
output: .claude/agents/scrum-master.md
---

## Purpose

Jira workflow agent that centralises all issue reads, transitions, assignments, and ticket creation for the dev and design lifecycles. Skills delegate all Jira operations here instead of calling MCP tools inline — keeps Jira logic in one place and makes it easy to adapt when transition IDs or project keys change.

## Substitutions

| Placeholder                            | Source                   | Notes                                                                                                                                                                                                                                           |
| -------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`                      | Q1 — Jira project key    | e.g. `SP`, `PROJ`. Used in issue keys, error messages, and operation examples                                                                                                                                                                   |
| `{{JIRA_URL}}`                         | Q8 — Jira base URL       | e.g. `https://myorg.atlassian.net`                                                                                                                                                                                                              |
| `{{CONFLUENCE_URL}}`                   | Q8 — Confluence base URL | e.g. `https://myorg.atlassian.net/wiki`                                                                                                                                                                                                         |
| `{{JIRA_TRANSITION_IN_PROGRESS}}`      | Q9 — Jira transition IDs | Numeric ID for "In Progress" / "Work is started" in the project's workflow                                                                                                                                                                      |
| `{{JIRA_TRANSITION_TESTING}}`          | Q9 — Jira transition IDs | Numeric ID for "Testing" / "In Review" — used when PR is submitted                                                                                                                                                                              |
| `{{JIRA_TRANSITION_DONE}}`             | Q9 — Jira transition IDs | Numeric ID for "Done" / "Closed"                                                                                                                                                                                                                |
| `{{JIRA_TRANSITION_ON_HOLD}}`          | Q9 — Jira transition IDs | Numeric ID for "On Hold" / "Blocked"                                                                                                                                                                                                            |
| `{{LABELS_SOURCE_OF_TRUTH_NOTE}}`      | Developer confirms       | One line pointing at the project's labels-matrix doc if one exists (e.g. a Confluence page URL), or "No shared labels matrix — apply your best judgment and confirm new labels with the team" if not                                            |
| `{{LABEL_CATEGORY_1}}` / `_1_VALUES`   | Developer confirms       | E.g. `Stream` → `FE · BE · Data · DevOps · QA`. Add more category rows as needed; drop the placeholder rows entirely if the project has no categorized taxonomy beyond the harness-standard lifecycle labels                                    |
| `{{LABEL_CATEGORY_2}}` / `_2_VALUES`   | Developer confirms       | E.g. `Version` → `V1 · V2 · MVP`                                                                                                                                                                                                                |
| `{{DESCRIPTION_TEMPLATE_SOURCE_NOTE}}` | Developer confirms       | One line pointing at the full description-template spec doc if one exists, else "Full spec: use the skeleton below directly."                                                                                                                   |
| `{{TEAM_COMPOSITION_NOTE}}`            | Developer confirms       | Either a pointer to a team-composition reference doc ("Source of truth: {{TEAM_COMPOSITION_PAGE_URL}} — consult when deciding assignment/ownership; never hardcode names here") or, if none exists, delete the whole "Team composition" section |

To find transition IDs: in Jira, open any issue in the project → Transitions API: `GET /rest/api/3/issue/{key}/transitions`.

## Conditionals

- **Jira Server / Data Center** (not Cloud): replace `accountId` assignment notes with `name`/`key` field — email-based lookup fails silently on Server.
- **No Confluence**: remove the Confluence URL line and the "return reference-doc URLs" note from the Fetch operation.
- **No labels matrix / simple taxonomy**: drop the `{{LABEL_CATEGORY_*}}` rows, keep only the harness-standard lifecycle row.
- **Different issue types**: if the project uses `Bug`, `Epic`, or custom types instead of `Task`/`Story`, update the Create operations accordingly.
- **No team-composition doc**: delete the "Team composition" section entirely.

## Verify checklist

- [ ] `{{PROJECT_KEY}}` resolved — no literal placeholder in issue key examples or error messages
- [ ] `{{JIRA_URL}}` and `{{CONFLUENCE_URL}}` resolved — valid URLs with no trailing slash
- [ ] All four transition IDs filled — verify against the project's actual Jira workflow (not assumed)
- [ ] Transition IDs table matches the project's actual workflow states
- [ ] `tools:` frontmatter includes `mcp__atlassian__*` (or the deployment's actual Jira MCP tool namespace) — `Read` alone cannot call Jira
- [ ] Link direction verification section present verbatim — this is a real MCP tool behavior bug, not project-specific content, and should ship with every deployment using this Jira MCP integration
- [ ] Story description quality section forbids process/history narrative ("split from," "originally bundled with") — WHAT/WHY only
- [ ] `dev-plan/SKILL.md` delegates Jira start/fetch to `@scrum-master` (not inline MCP calls), if `/dev` in this deployment touches Jira in Plan
- [ ] `dev/SKILL.md` Completion delegates worklog + Done transition to `@scrum-master`
- [ ] `dev-document/SKILL.md` delegates TD creation to `@scrum-master`, if applicable
- [ ] `design-publish/SKILL.md` Jira-sync step delegates worklog + Done transition to `@scrum-master`
- [ ] `design-frame/SKILL.md` does **not** assume a Jira fetch/assign step exists here — check `design-frame/INTENT.md`'s Purpose note for whether this deployment added one
