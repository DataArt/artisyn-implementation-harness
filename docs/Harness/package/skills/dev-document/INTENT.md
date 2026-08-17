---
skill: dev-document
output: .claude/skills/dev-document/SKILL.md
---

## Purpose

Runs the documentation stage: classifies what needs documenting (app README, LLD, Engineering Guide), updates docs one at a time with developer confirmation, creates Jira tasks for tech debt, handles architecture impact from design, resolves architecture deviations, and archives the story.

## Substitutions

| Placeholder       | Source             | Notes                                    |
| ----------------- | ------------------ | ---------------------------------------- |
| `{{PROJECT_KEY}}` | Q5 — ticket prefix | Replaces `ND` in Jira project references |

## Conditionals

- If Q5 is "none" (no issue tracker): remove Step 5 (create Jira tasks from tech debt)
- If Q5 is not Jira: adjust Step 5 to use the project's issue tracker

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 0 reads documentation principles from `docs/Engineering Guide/` — specifically the Doc Structure article (do NOT reference `docs/README.md` as the source of documentation principles; use `docs/Engineering Guide/02 Doc Structure.md` or glob by name)
- [ ] Step 1 classification has four distinct cases with clear destinations: app README, LLD, Engineering Guide, and the DRY rule
- [ ] Step 1b glob uses `*{TICKET}*` wildcard, never `[{TICKET}]*`
- [ ] Step 5b glob uses `*{TICKET}*` wildcard, never `[{TICKET}]*`
- [ ] Step 5b also checks the archive path (`docs/Stories/archive/*{TICKET}*/`)
- [ ] Step 5c (architecture deviations) has one-at-a-time resolution flow
- [ ] Step 5d satellite review is present between Step 5c and Step 6 — `@architect` cross-checks all modified docs for internal contradictions and stale references before archiving
- [ ] Step 6 archive runs `git mv` directly via Bash tool (skill owns the archive action — do not present as user instruction)
- [ ] Step 6 includes a commit prompt after archiving, before Step 7
- [ ] No literal `ND` used as project key
- [ ] Step 1 starts with deviation audit block (read both files → merge → feed @architect) before doc classification
- [ ] Deviation audit @architect prompt targets `docs/Target Architecture (HLD)/` and `docs/System Architecture (LLD)/` — not literal project-specific paths
