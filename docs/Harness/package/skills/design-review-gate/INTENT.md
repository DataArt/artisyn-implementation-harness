---
skill: design-review-gate
output: .claude/skills/design-review-gate/SKILL.md
---

## Purpose

Phase 5 of the design lifecycle. Two-entry-point skill: pre-gate (Steps 1–3) verifies all prior-phase artifacts exist, suggests a draft MR title/body, and ends the session once the developer pastes back the PR URL. Post-gate (Step 4, on the next invocation) asks whether the MR was approved and branches the orchestrator to either Publish (no concerns) or Address Feedback (concerns raised). Named `design-review-gate` rather than `design-review` deliberately — many harness deployments already have a separate `/design-review` command for a WAF/quality assessment (see `design-review/INTENT.md`), and this skill is a different concern: the human-approval gate, not a quality check.

## Substitutions

None. This skill has no project-specific values.

## Conditionals

None.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Step 1 skips to Step 4 if Report.md Gate already has a Draft MR URL
- [ ] Step 2 has two STOPs: one for approver name, one for PR URL — no `gh pr create` command
- [ ] Step 3 ends the session explicitly — "Do not proceed to Step 4 automatically"
- [ ] Step 4 branches cleanly: approved → tells developer to run `/design-publish`; concerns → tells developer to run `/design-address-feedback`
- [ ] Phase tracker banner is the 7-segment version and Step 3/4 update only the Review/Address Feedback segments, never Publish
- [ ] Skill name is `design-review-gate`, not `design-review` (reserved for the WAF/quality command if one exists in this deployment)
