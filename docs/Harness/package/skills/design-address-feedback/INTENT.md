---
skill: design-address-feedback
output: .claude/skills/design-address-feedback/SKILL.md
---

## Purpose

Phase 6 of the design lifecycle. Only invoked when `design-review-gate` reports concerns. Identifies which earlier phase/step the concern traces to, suggests a named reiterate path, applies the fix by following that phase's own skill, then loops asking whether the MR has been re-approved — repeating for as many rounds of feedback as needed — until the developer confirms re-approval, at which point it hands off to `/design-publish`.

## Substitutions

| Placeholder                  | Source                                                    | Notes                                                                 |
| ---------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `{{DESIGN_ARCHITECT_AGENT}}` | Q — design lifecycle scope (see `design-frame/INTENT.md`) | Used in the "Missing option" reiterate row (re-delegates to Research) |

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 verifies Address Feedback is actually the active phase before doing anything — stops otherwise
- [ ] Step 2 reiterate table maps each concern type to a named Phase, Step
- [ ] Step 3 loop: "still concerns" returns to Step 2, not a dead end or re-ask of Step 1
- [ ] Step 3 "yes" path updates the Gate's `Approved:` field and phase tracker, then hands off to `/design-publish`
- [ ] Never decides the fix unilaterally — always confirms the reiterate path with the developer before applying it
