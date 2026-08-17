---
skill: skill-promote
output: .claude/skills/skill-promote/SKILL.md
---

## Purpose

Graduates a draft skill to published status: lists drafts, reads the selected draft, determines type, moves the file with `mv` (preserving git history), and registers in `AGENTS.md`.

## Substitutions

None — this is a structural skill with no project-specific placeholders.

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 4 uses `mv` not `cp` for moving files (git history preservation)
- [ ] Step 5 registers in `AGENTS.md` (not `CLAUDE.md` — the harness uses AGENTS.md as the root context file)
- [ ] Agent promotion also updates the `## Agents` table in `AGENTS.md`
- [ ] Commit suggestion is present at the end
