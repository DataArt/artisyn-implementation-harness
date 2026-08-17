---
skill: war-implementation
output: .claude/skills/war-implementation/SKILL.md
companion_templates:
  - report-template.md
---

## Purpose

Audits the NX monorepo implementation against the Target Architecture. Delegates code reading to `@architect`, assesses each WAF pillar, presents findings in console, and saves a dated snapshot.

## Substitutions

| Placeholder             | Source                               | Notes                                                |
| ----------------------- | ------------------------------------ | ---------------------------------------------------- |
| `{{WAF_FRAMEWORK}}`     | Q11 — WAF framework name             | Used in overview                                     |
| `{{WAF_PILLARS_TABLE}}` | Q11 — pillar list with key questions | Full implementation-focused pillar definitions table |

## Conditionals

- If Q11 is "None": this entire skill is omitted (Block A.4 conditional)

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 reads HLD README to find active version — not hardcoded
- [ ] Step 3 `@architect` prompt is verbatim — "Return your findings as a structured list. Do not write files. Do not make changes."
- [ ] Pillar definitions table matches Q11 framework
- [ ] Step 5 "present in console first — do NOT write to file yet" is explicit
- [ ] Output path: `docs/Target Architecture (HLD)/WAR/{VERSION}/{YYYY-MM-DD}-implementation-audit.md`
- [ ] Step 6 uses `report-template.md` from same skill folder
