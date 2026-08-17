---
skill: skill-triage
output: .claude/skills/skill-triage/SKILL.md
companion_templates:
  - triage-summary.template.md
---

## Purpose

Analyzes pending reflections, clusters them by theme, scopes each cluster (agent-specific/cross-cutting/dev-flow), presents action options with recommendation, writes draft skills after confirmation, marks reflections as triaged, and saves a triage report.

## Substitutions

| Placeholder       | Source             | Notes                                 |
| ----------------- | ------------------ | ------------------------------------- |
| `{{PROJECT_KEY}}` | Q5 — ticket prefix | Replaces `ND` in ticket glob patterns |

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 story folder glob uses `*{TICKET}*` wildcard, never `[{TICKET}]*`
- [ ] Step 4 has explicit STOP before writing drafts — "present options to the developer and wait for confirmation"
- [ ] Step 5 has explicit STOP before marking reflections as triaged
- [ ] Step 6 uses `git mv` for moving reflections — not Write + delete
- [ ] Skill audit (Step 4) reads ALL existing skills and agents before deciding, even if no reflections mentioned them
- [ ] Three scope types are defined: agent-specific, cross-cutting, dev-flow
