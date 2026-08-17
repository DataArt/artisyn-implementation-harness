---
skill: dev
output: .claude/skills/dev/SKILL.md
companion_templates:
  - plan-template.md
  - report-template.md
  - pattern-review-gate.md
  - pattern-session-continuity.md
  - pattern-write-confirm.md
  - pattern-announce-progress.md
  - pattern-do-report-commit.md
  - pattern-satellite-review.md
---

## Purpose

Orchestrator for the full Dev lifecycle: Plan → Implement → Test → Document. Delegates to each phase skill in order, stopping at every phase boundary for developer confirmation.

## Substitutions

| Placeholder                          | Source                       | Notes                                                                                  |
| ------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`                    | Q5 — ticket prefix           | e.g. `AIFD`. Replaces every occurrence of `ND` used as a Jira project key              |
| `{{JIRA_TRANSITION_START_PROGRESS}}` | Developer confirms from Jira | Transition ID for "Start Progress" — ask developer to provide from their Jira workflow |
| `{{JIRA_TRANSITION_TESTING}}`        | Developer confirms from Jira | Transition ID for moving to Testing state                                              |

> If Jira transition IDs are unknown during bootstrap, insert placeholder values and note them in AGENTS.md with a `# TODO: verify Jira transition IDs` comment. The developer must update these before using the skill.

## Conditionals

- If Q5 is "none" (no issue tracker): remove the Jira transition IDs table and the Jira transition step at Completion
- If Q5 is not Jira: remove the Jira transition IDs table entirely

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Idempotency check section is present before Phase tracker, using `{{PROJECT_KEY}}-\d+` pattern
- [ ] No literal `ND` used as ticket prefix — all replaced with `{{PROJECT_KEY}}`
- [ ] Jira transition ID table is present (or removed if no Jira)
- [ ] Each phase section has exactly one stop, with the exact quoted question format
- [ ] Orchestrator only delegates — no implementation logic, no step details
- [ ] Completion section has two stops: MR offer first, then a "Completion — Jira sync" stop asking effort spent and delegating the worklog + `{{JIRA_TRANSITION_DONE}}` transition to `@scrum-master` — PR URL update step is intentionally absent (would produce a commit after the PR is open)
