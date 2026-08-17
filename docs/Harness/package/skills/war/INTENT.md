---
skill: war
output: .claude/skills/war/SKILL.md
---

## Purpose

Orchestrator for the Architecture lifecycle WAR skills. Routes to `/war-design` or `/war-implementation` based on arguments, or presents both options if no argument given.

## Substitutions

None — this is a thin routing orchestrator.

## Conditionals

- If Q11 is "None": this entire skill is omitted (Block A.4 conditional)

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Skill is thin — only routes, no audit logic
- [ ] Both sub-commands mentioned: `/war-design` and `/war-implementation`
- [ ] `where-we-are` mentioned as the delivery gap companion
