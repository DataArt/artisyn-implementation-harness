---
skill: skill-lifecycle
output: .claude/skills/skill-lifecycle/SKILL.md
---

## Purpose

Rule skill that documents the skill lifecycle: reflect → triage → new/promote. Describes when to use each phase command, the folder structure (drafts vs active vs archive), and the review period before promotion.

## Substitutions

None — this is a documentation/rule skill with no project-specific placeholders.

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] All four commands are documented: `/skill-reflect`, `/skill-triage`, `/skill-new`, `/skill-promote`
- [ ] Folder structure is explicit: `.claude/reflections/`, `.claude/skills/drafts/`, `.claude/skills/`
- [ ] Review period is stated: ~1 week before promotion
- [ ] One-off path is described: some reflections go straight to archive without becoming skills
