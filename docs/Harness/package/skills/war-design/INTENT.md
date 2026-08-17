---
skill: war-design
output: .claude/skills/war-design/SKILL.md
---

## Purpose

Audits the Target Architecture design documents for a given version against the WAF pillars. Assesses whether the architecture as designed and documented is sound — not whether the code implements it.

## Substitutions

| Placeholder             | Source                               | Notes                                                                                                 |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `{{WAF_FRAMEWORK}}`     | Q11 — WAF framework name             | e.g. "AWS Well-Architected Framework", "Azure Well-Architected Framework"                             |
| `{{WAF_PILLARS_TABLE}}` | Q11 — pillar list with key questions | Full pillar definitions table. For AWS WAF: 6 pillars (adds Sustainability). For Azure WAF: 5 pillars |

## Conditionals

- If Q11 is "None": this entire skill is omitted (Block A.4 conditional)

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 reads HLD README to find active version — not hardcoded
- [ ] Step 1 scope confirmation stop is present with exact quoted question
- [ ] Pillar definitions table uses `{{WAF_PILLARS_TABLE}}` — not hardcoded "Azure WAF"
- [ ] Step 4 "present in console first — do NOT write to file yet" is explicit
- [ ] Output path formula is correct: `docs/Target Architecture (HLD)/WAR/{VERSION}/{YYYY-MM-DD}-design-audit.md`
- [ ] Step 6 closing message lists re-run instructions
