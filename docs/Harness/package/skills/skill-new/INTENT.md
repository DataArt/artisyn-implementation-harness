---
skill: skill-new
output: .claude/skills/skill-new/SKILL.md
companion_templates:
  - rule-skill.template.md
---

## Purpose

Creates a new draft skill directly (without going through reflect → triage). Determines type (rule vs agent), checks for duplication, reads conventions, and writes to `.claude/skills/drafts/`.

## Substitutions

None — this is a structural skill with no project-specific placeholders.

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 2 reads existing skills to check for duplication before writing
- [ ] Step 3 reads agent format from `.claude/agents/` (not a hardcoded file path)
- [ ] Template reference is `rule-skill.template.md` in same folder
- [ ] Output path is `.claude/skills/drafts/{name}.md`
