---
skill: design-publish
output: .claude/skills/design-publish/SKILL.md
---

## Purpose

Phase 7 of the design lifecycle — the final phase, and the only entry point among Review/Address Feedback/Publish that isn't gated on an approval outcome. Runs once `design-review-gate` (or `design-address-feedback`) has recorded an approved gate: identifies doc impact via `{{DESIGN_ARCHITECT_AGENT}}` (read-only), applies the updates via `@docs-writer`, gates on `{{DESIGN_ARCHITECT_AGENT}}` review of those changes (max 2 passes, via `pattern-satellite-review.md`), updates Report.md, archives the design folder (fixing relative links broken by the move), logs a Jira worklog and transitions the ticket to Done, then hands off to `/dev {TICKET}` only if the implementation targets this repo's own code.

## Substitutions

| Placeholder                  | Source                                                    | Notes                                                                                                                                                                                                                     |
| ---------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{DESIGN_ARCHITECT_AGENT}}` | Q — design lifecycle scope (see `design-frame/INTENT.md`) | Doc-impact identification (Step 2) and review (Step 4)                                                                                                                                                                    |
| `{{DESIGN_DOCS_ROOT}}`       | Q — design lifecycle scope                                | Same value as `design-frame/INTENT.md`                                                                                                                                                                                    |
| `{{DOC_PRINCIPLES_ARTICLE}}` | Q — Doc Principles article path                           | Passed to `@docs-writer` in Step 3; same value as `docs-writer/INTENT.md`'s substitution                                                                                                                                  |
| `{{DESIGN_HANDOFF_NOTE}}`    | Developer describes the repo topology                     | One line explaining where implementation tickets are actually built — e.g. "Most designs are implemented in the owning downstream repo, not here" for a multi-repo product, or omitted entirely for a single-repo project |
| `{{PROJECT_KEY}}`            | Q5 — ticket prefix                                        | Used in the Step 10 hand-off message                                                                                                                                                                                      |
| `{{JIRA_TRANSITION_DONE}}`   | Developer confirms from Jira                              | Same value as `dev/INTENT.md`'s substitution                                                                                                                                                                              |

## Conditionals

- If Q5 is "none" (no issue tracker): remove Step 9 (Jira sync) entirely
- If `{{DESIGN_HANDOFF_NOTE}}` doesn't apply (single-repo project): drop the parenthetical qualifier in the Step 6 option B and just say "Start /dev now"

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 checks the Gate's `Approved:` field — does not re-derive approval status itself, trusts `design-review-gate`/`design-address-feedback`
- [ ] Step 2 `{{DESIGN_ARCHITECT_AGENT}}` constraint: "Do not write or edit any files — return output only"
- [ ] Step 3 delegates writing to `@docs-writer` (not inline edits) and passes `{{DOC_PRINCIPLES_ARTICLE}}`
- [ ] Step 3 STOP after showing diff — developer confirms before architect review
- [ ] Step 4 applies `pattern-satellite-review.md` — max 2 iterations before escalating to developer
- [ ] Step 5 phase tracker is the 7-segment banner, all seven segments ✅
- [ ] Step 7 archive: `git mv` runs directly (not a user instruction), then the relative-link grep-and-fix runs before reporting complete
- [ ] Step 9 Jira sync asks for effort spent, then delegates worklog + `{{JIRA_TRANSITION_DONE}}` transition to `@scrum-master` — logged as its own step, not folded into Step 5
- [ ] Step 10 hand-off message points at `/dev {first-ticket}` only for option B, and only if the ticket's implementation genuinely targets this repo's own code
- [ ] No `{{DESIGN_ARCHITECT_AGENT}}` references left as the old bootstrap's `@architect` or "HLD impact" language — this phase always operates on `{{DESIGN_DOCS_ROOT}}`
