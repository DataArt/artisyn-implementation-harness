---
skill: design-review
output: .claude/skills/design-review/SKILL.md
---

## Purpose

Parameterized WAF satellite — invokable at any design phase against any artifact (`frame`, `research`, `elaborate`). Supports pillar filtering via `--pillars=`. Always appends a dated block to `design/Report.md` WAF section. Does not save a standalone review file.

## Substitutions

| Placeholder                 | Source                                                      | Notes                                                                                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`           | Q5 — ticket prefix                                          | Used in examples only                                                                                                                                                                                                       |
| `{{WAF_PILLARS_TABLE}}`     | Q11 — WAF framework                                         | Replace with the correct pillar definitions table (pillar name + key questions) for the chosen framework                                                                                                                    |
| `{{WAF_PILLAR_SHORTNAMES}}` | Q11 — WAF framework                                         | Comma-separated abbreviated pillar names for `--pillars=` valid values, e.g. `reliability, security, cost, operations, performance` (Azure) or `security, reliability, cost, operations, performance, sustainability` (AWS) |
| `{{DESIGN_DOCS_ROOT}}`      | Q10 — design lifecycle scope (see `design-frame/INTENT.md`) | Step 2 reads architecture context from here — same value/resolution as every other `/design` skill                                                                                                                          |

## Conditionals

- If Q11 is "None": this entire skill is omitted
- If Q11 is AWS WAF: 6 pillars (Security, Reliability, Cost Optimisation, Operational Excellence, Performance Efficiency, Sustainability)
- If Q11 is Azure WAF: 5 pillars (Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency)
- Adjust `--pillars=` valid values comment to match the chosen framework's pillar shortnames
- Project-scoped or Two-track (Project track): Step 2's "relevant docs" always includes the active version's `Non-Functional Concerns/Requirements.md` — call this out explicitly rather than leaving it implicit in "across its subfolders"

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Story folder glob uses `*{TICKET}*/**` wildcard, never `[{TICKET}]*`
- [ ] `{{WAF_PILLARS_TABLE}}` is populated with correct pillar definitions for the framework (not left as placeholder)
- [ ] `--pillars=` valid values list matches the chosen framework
- [ ] Step 4 presents in console first — STOP before appending to Report.md
- [ ] Step 5 appends a dated block (not overwrites) the WAF Assessment section
- [ ] No standalone review file is saved (no `04 Review.md`)
- [ ] No literal `AIFD` used as project key
