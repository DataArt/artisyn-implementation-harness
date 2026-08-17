---
skill: design-elaborate
output: .claude/skills/design-elaborate/SKILL.md
---

## Purpose

Phase 3 of the design lifecycle — the judgment phase. Resolves viability OQs before scoring options, builds the Requirements × Options matrix and tradeoffs table, writes the draft to disk for IDE review before the recommendation, makes a falsifiable recommendation, resolves open questions with the developer, and runs a closing WAF assessment. Saves `design/02 Elaborate.md` and appends the WAF summary to `Report.md`.

## Substitutions

| Placeholder                   | Source                                                    | Notes                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{WAF_PILLAR_COLUMNS}}`      | Q11 — WAF framework                                       | Comma/dot-separated pillar names used as tradeoffs table column headers, e.g. `Security · Reliability · Performance · Cost · Operational Excellence` |
| `{{WAF_PILLAR_ROWS}}`         | Q11 — WAF framework                                       | Multi-line markdown table rows for the `elaborate-template.md` Tradeoffs table (one `\| Pillar \| \| \| \|` row per WAF pillar)                      |
| `{{WAF_PILLARS_TABLE}}`       | Q11 — WAF framework                                       | Markdown table of pillar names + "what to assess" descriptions used as the Step 6 assessment reference                                               |
| `{{WAF_PILLAR_SUMMARY_ROWS}}` | Q11 — WAF framework                                       | Markdown table rows for the Report.md WAF summary (pillar · rating · headline)                                                                       |
| `{{WAF_FRAMEWORK}}`           | Q11 — WAF framework                                       | Framework name used in Step 5 heading, e.g. "Azure Well-Architected Framework"                                                                       |
| `{{DESIGN_ARCHITECT_AGENT}}`  | Q — design lifecycle scope (see `design-frame/INTENT.md`) | The read-only architecture agent this phase reiterates back to when a reiterate path names Research                                                  |

## Conditionals

- If Q11 is "None": omit Step 5 (closing WAF assessment); remove WAF pillar columns from the tradeoffs table, keeping only Integration Complexity and Vendor Lock-in

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 multi-decision check present, referencing `pattern-multi-decision-split.md`
- [ ] Step 1b viability OQ check present before matrix is built (STOP if unresolved `(V)` OQs)
- [ ] Step 1b references `.claude/skills/design/pattern-design-oq-triage.md`
- [ ] Step 2 heading says "Requirements × Options matrix" (not "AC × Options matrix"), combines matrix and tradeoffs into one step
- [ ] Step 2 matrix rows described as "evaluation criteria derived from requirements and constraints in `00 Frame.md`"
- [ ] SPIKE ticket note present in Step 2 explaining meta-level requirements
- [ ] Step 2b writes draft to disk first (write-confirm pattern), then IDE review STOP — not "present in console"
- [ ] Step 4 applies write-confirm pattern for recommendation fill
- [ ] WAF assessment gate (Step 5) uses "yes / I have corrections" — not "yes to save / no to discuss" (inverted)
- [ ] Step 4b open question resolution is a single exchange (not one stop per question)
- [ ] Step 6a and 6b are both part of the same Step 6 "Save both artifacts"
- [ ] Step 7 (Do → Report → Commit) uses wait-for-confirmation pattern, phase tracker is the 7-segment banner
- [ ] Reiterate paths named with Phase N, Step M, and use `{{DESIGN_ARCHITECT_AGENT}}` where they re-delegate to Research
