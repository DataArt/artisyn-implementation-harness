---
skill: design-research
output: .claude/skills/design-research/SKILL.md
---

## Purpose

Phase 2 of the design lifecycle. Delegates to a read-only architecture agent to produce 3–5 neutral options (no recommendation), runs two-tier OQ triage, and saves `design/01 Research.md`. If Frame identified multiple independent decisions, loops once per decision.

## Substitutions

| Placeholder                  | Source                                                       | Notes                                                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{DESIGN_ARCHITECT_AGENT}}` | Q — design lifecycle scope (see design-frame's Conditionals) | The read-only architecture agent this phase delegates to — `@product-architect` in a product-context-scoped deployment, or this project's own `@architect` in a project-scoped deployment. Same value used across all `/design` skills. |
| `{{DESIGN_DOCS_ROOT}}`       | Q — design lifecycle scope                                   | Same value as `design-frame/INTENT.md`                                                                                                                                                                                                  |
| `{{DESIGN_CONTEXT_SOURCES}}` | Q — design lifecycle scope                                   | Same value as `design-frame/INTENT.md` Step 3                                                                                                                                                                                           |

## Conditionals

None beyond the shared design-lifecycle-scope conditional documented in `design-frame/INTENT.md`.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Story folder glob uses `*{TICKET}*/**` wildcard, never `[{TICKET}]*`
- [ ] Multi-decision check present at Step 1, referencing `pattern-multi-decision-split.md`
- [ ] `{{DESIGN_ARCHITECT_AGENT}}` explicitly told "no recommendation" and "at least one minimal-change option, at least one industry-standard option"
- [ ] OQ triage (Step 3b) is a separate prompt from the "options complete?" confirmation (Step 3) — never bundled
- [ ] OQ triage classifies each question as (V) Viability or (E) Elaboration-input, one at a time
- [ ] Assumptions persisted into the **existing** `## Assumptions` section of `design/Report.md` — no new `##` heading added
- [ ] Step 5 phase tracker uses the full 7-segment banner (Frame/Research/Elaborate/Solution/Review/Address Feedback/Publish)
- [ ] `{{DESIGN_ARCHITECT_AGENT}}` constraint: "Do not write or edit any files — return output only"
