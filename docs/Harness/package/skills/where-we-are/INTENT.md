---
skill: where-we-are
output: .claude/skills/where-we-are/SKILL.md
companion_templates:
  - report-template.md
---

## Purpose

Produces a delivery gap report: what has been designed in Target Architecture (HLD) vs documented in System Architecture (LLD) vs implemented in the codebase. Delegates code scanning to `@architect`.

## Substitutions

| Placeholder                | Source                        | Notes                                                                                                                                                                                                                                                                 |
| -------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{LLD_FOLDER_STRUCTURE}}` | Stage 1b — detected from repo | The `docs/System Architecture (LLD)/` subfolder structure. Detect from existing `docs/System Architecture (LLD)/` folder or use generic container names from Q3. Do not hardcode ncfc-specific folders (Canonical, Compute, Synthetic, Serving, Data, Infrastructure) |

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 reads HLD README to find active version — not hardcoded
- [ ] Step 3 shows the actual LLD folder structure detected from the project (not ncfc's Canonical/Compute/etc.)
- [ ] Step 4 `@architect` prompt is bounded: "Return a structured list. Do not write files. Do not make changes."
- [ ] Step 5 gap matrix rows are populated from HLD containers discovered in Step 2, not hardcoded
- [ ] Step 7 uses `report-template.md` from same skill folder
- [ ] Output path: `docs/System Architecture (LLD)/where-we-are/{YYYY-MM-DD}-gap-report.md`
