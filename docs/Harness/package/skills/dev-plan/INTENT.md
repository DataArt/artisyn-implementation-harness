---
skill: dev-plan
output: .claude/skills/dev-plan/SKILL.md
---

## Purpose

Creates the implementation plan (`1-plan.md`) and living report (`2-report.md`) for a ticket. Fetches Jira context, reads the codebase and architecture, proposes a step-by-step plan, audits it against the Target Architecture, and saves the plan folder.

## Substitutions

| Placeholder                          | Source                       | Notes                                                                                     |
| ------------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`                    | Q5 — ticket prefix           | Replaces `ND` everywhere — in patterns like `ND-\d+`, `ND-XX`, "project ND", branch names |
| `{{JIRA_TRANSITION_START_PROGRESS}}` | Developer confirms from Jira | Transition ID for "Start Progress"                                                        |

## Conditionals

- If Q5 is "none" (no issue tracker): remove Step 2 (Jira setup) and Step 3 (Jira context fetch) entirely; adjust step numbers accordingly
- If Q5 is not Jira: replace Step 2–3 with a free-form context gathering step

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 0 idempotency check is present before Step 1, using `{{PROJECT_KEY}}-\d+` pattern
- [ ] Ticket pattern uses `{{PROJECT_KEY}}-\d+` not `ND-\d+`
- [ ] Step 4b glob uses `*{TICKET}*` wildcard, never `[{TICKET}]*`
- [ ] Step 7b architecture audit names specific cross-checks: container boundaries, data flow direction, NFRs
- [ ] Step 8 glob for story folder uses `*{TICKET}*` wildcard, never `[{TICKET}]*`
- [ ] Templates referenced are `.claude/skills/dev/plan-template.md` and `.claude/skills/dev/report-template.md`
- [ ] Step 8 folder name is stable — no phase emoji, no git mv instruction for existing folders
- [ ] No literal `ND` used as project key
- [ ] Step 2b branch checkout block is present between Steps 2 and 3 — hard stop waits for confirmation before codebase reading begins
