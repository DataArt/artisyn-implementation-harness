---
skill: dev-implement
output: .claude/skills/dev-implement/SKILL.md
---

## Purpose

Executes the approved implementation plan step by step. Delegates layer-specific work to specialist agents, enforces a HARD STOP after each step, and maintains `2-report.md` with a 4-part update per step (progress row + implementation note + efforts row + commit announcement).

## Substitutions

| Placeholder          | Source                                   | Notes                                                                                             |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`    | Q5 — ticket prefix                       | Replaces `ND` in ticket references and branch names                                               |
| `{{BACKEND_AGENT}}`  | AGENTS.md — agent for BFF/backend layer  | e.g. `@bff`. Check AGENTS.md `## Agents` table for the agent scoped to the BFF/backend container  |
| `{{FRONTEND_AGENT}}` | AGENTS.md — agent for Web/frontend layer | e.g. `@web`. Check AGENTS.md `## Agents` table for the agent scoped to the Web/frontend container |
| `{{DATA_AGENT}}`     | AGENTS.md — agent for data/DB layer      | e.g. `@data`. Check AGENTS.md `## Agents` table for the agent scoped to the DB/data layer         |

## Conditionals

- If no specialist agents defined for a layer: replace delegation logic with "implement inline"
- If Q5 is "none" (no issue tracker): remove Jira transition references from Completion

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Session continuity banner is present at top (references `pattern-session-continuity.md`)
- [ ] Step 3 layer detection has keyword triggers for `{{BACKEND_AGENT}}`, `{{FRONTEND_AGENT}}`, and data layer — not hardcoded agent names
- [ ] Scope discipline is a callout block, not a list item
- [ ] Satellite review reference is in the execution loop (references `pattern-satellite-review.md`)
- [ ] HARD STOP block is verbatim multi-line quoted format
- [ ] do-report-commit pattern is referenced before the report update block
- [ ] Report update block has items 1-4 (progress row, implementation note, efforts row, commit+announce)
- [ ] Commit rules are inside item 4, not floating after the report block
- [ ] announce-progress pattern is referenced in item 4
- [ ] "Never commit yourself" rule is present — one occurrence, not duplicated
- [ ] Steps are cleanly numbered 1-7 (no `b`/`c` suffixes)
- [ ] Step 7 (Completion) includes TD triage with /dev-plan loop-back and existing 1-plan.md append rule
- [ ] Story folder glob uses `*{TICKET}*` wildcard
