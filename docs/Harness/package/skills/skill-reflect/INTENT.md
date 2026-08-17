---
skill: skill-reflect
output: .claude/skills/skill-reflect/SKILL.md
companion_templates:
  - reflection.template.md
---

## Purpose

Captures a free-form brain-dump about a completed ticket and writes it as a structured reflection file. Extracts 8 fields, omits `skill_hint` if no skill candidate is identified, and saves to `.claude/reflections/`.

## Substitutions

| Placeholder       | Source             | Notes                                                   |
| ----------------- | ------------------ | ------------------------------------------------------- |
| `{{PROJECT_KEY}}` | Q5 — ticket prefix | Replaces `ND` in default ticket placeholder in template |

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Skill extracts exactly 8 fields (date, author, ticket, task, status, skill_candidate, skill_hint, content sections)
- [ ] `skill_hint` is omitted from the file if no skill candidate is identified — not left blank
- [ ] Template reference is `reflection.template.md` in same folder
- [ ] Output path is `.claude/reflections/` (not `skills/drafts/` — that's for triage output)
