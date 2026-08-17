---
skill: skill-harvest
output: .claude/skills/skill-harvest/SKILL.md
---

## Purpose

Syncs changes from a project's `.claude/skills/{name}/SKILL.md` or `.claude/agents/{name}.md` back to the harness bootstrap templates at `docs/Harness/package/skills/{name}/TEMPLATE.md` and `INTENT.md`. Strips project-specific values and replaces them with `{{}}` placeholders, then proposes updates for developer confirmation.

Triggered by the PostToolUse hook whenever a skill or agent file is modified.

## Substitutions

None — this is a structural skill with no project-specific placeholders.

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Skill handles three cases: update existing bootstrap entry, create new bootstrap entry, signal deletion
- [ ] Step 2 reads both TEMPLATE.md and INTENT.md before proposing changes — not just one
- [ ] Step 3 generalization uses the INTENT.md substitutions table as the guide for what to parametrize
- [ ] Step 4 shows a diff (before/after) for developer confirmation — never auto-writes
- [ ] Step 5 updates INTENT.md verify checklist if new checks are implied by the change
