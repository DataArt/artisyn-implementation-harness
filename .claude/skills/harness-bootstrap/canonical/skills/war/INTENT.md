---
skill: war
output: .claude/skills/war/SKILL.md
companion_templates:
  - references/01-design.md
  - references/02-implementation.md
  - patterns/scope-resolution.md
  - patterns/present-and-save.md
  - templates/design-report.md
  - templates/implementation-report.md
---

## Purpose

The full Well-Architected Review lifecycle in one skill: routes to the Design audit
(`references/01-design.md`) or Implementation audit (`references/02-implementation.md`)
based on arguments, or presents both options if no argument given. Replaces the
former separate `war-design` and `war-implementation` skills — those audits now
live under this one skill's `references/`.

## Substitutions

| Placeholder             | Source                                    | Notes                                                                                                                                                                                                                                                                                             |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{WAF_FRAMEWORK}}`     | Q11 — WAF framework name                  | e.g. "AWS Well-Architected Framework", "Azure Well-Architected Framework"                                                                                                                                                                                                                         |
| `{{WAF_PILLARS_TABLE}}` | Q11 — pillar list with key questions      | Full pillar definitions table. For AWS WAF: 6 pillars (adds Sustainability). For Azure WAF: 5 pillars. Same table used by both `references/01-design.md` and `references/02-implementation.md`                                                                                                    |
| `{{CODE_SCAN_TARGET}}`  | Q2/Q3 — detected monorepo tool and layout | A phrase describing where code lives, matched to the project's actual layout — e.g. "the NX monorepo under `apps/` and `libs/`" for an NX monorepo, "the codebase" for a single non-monorepo app. Same placeholder as `where-we-are`'s INTENT — used by `references/02-implementation.md` Step 3. |
| `{{BUILD_UNIT_LABEL}}`  | Q2/Q3 — detected monorepo tool            | Same placeholder as `dev`'s INTENT — the generic noun for one buildable unit (`NX project`, `package`, `module`, or the single app's name).                                                                                                                                                       |

## Conditionals

- If Q11 is "None": this entire skill is omitted (Block A.4 conditional)

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)
- [ ] Route section covers both entry forms (`design`, `implementation`) plus the ambiguous/no-argument ask, and both stop for confirmation before delegating
- [ ] Compatibility note states `/war-design`/`/war-implementation` are retired in favor of `/war design|implementation`
- [ ] `references/01-design.md` Step 1 and `references/02-implementation.md` Step 1 both apply `patterns/scope-resolution.md` rather than duplicating the version/pillar-parsing logic inline
- [ ] Both references apply `patterns/present-and-save.md` for their closing present-then-save mechanics rather than duplicating it inline
- [ ] `references/01-design.md` reads Target Architecture docs only — no code/`@architect` delegation
- [ ] `references/02-implementation.md` Step 3's `@architect` prompt is verbatim — "Return your findings as a structured list. Do not write files. Do not make changes."
- [ ] `{{CODE_SCAN_TARGET}}` and `{{BUILD_UNIT_LABEL}}` in `references/02-implementation.md` are resolved to the project's actual detected monorepo tool and directory layout — never left hardcoded as "NX monorepo" / "`apps/` and `libs/`" for a project that uses a different tool or layout
- [ ] Output paths: `docs/Target Architecture (HLD)/WAR/{VERSION}/{YYYY-MM-DD}-design-audit.md` and `...-implementation-audit.md` — never overwrite a previous report
- [ ] `where-we-are` mentioned as the delivery gap companion
- [ ] `TEMPLATE.md` is thin — only routes, no audit logic (that lives in `references/`)
