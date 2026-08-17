---
skill: design
output: .claude/skills/design/SKILL.md
companion_templates:
  - frame-template.md
  - research-template.md
  - elaborate-template.md
  - report-template.md
  - solution-architecture-template.md
  - solution-design-template.md
  - solution-efforts-template.md
  - solution-stack-template.md
  - pattern-announce-progress.md
  - pattern-compact-between-phases.md
  - pattern-do-report-commit.md
  - pattern-write-confirm.md
  - pattern-session-continuity.md
  - pattern-satellite-review.md
  - pattern-design-architect-review.md
  - pattern-design-oq-triage.md
  - pattern-multi-decision-split.md
  - pattern-context-resolution.md
---

## Purpose

Orchestrator for the full Design lifecycle: Frame → Research → Elaborate → Solution → Review → Address Feedback → Publish. Detects resume point, delegates to each phase skill in order. Review, Address Feedback, and Publish are three separate skills (`design-review-gate`, `design-address-feedback`, `design-publish`) so each stays independently invocable and resumable, matching the pattern of Frame/Research/Elaborate/Solution — Review opens the draft MR and ends the session at the out-of-band human-approval boundary; Address Feedback only runs if concerns were raised; Publish runs once the gate is approved.

## Substitutions

| Placeholder                       | Source                                                    | Notes                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`                 | Q5 — ticket prefix                                        | Replaces the Jira project key in ticket references                                                                                                                                                                                                                                                                                                                   |
| `{{DESIGN_ARCHITECT_AGENT}}`      | Q — design lifecycle scope (see `design-frame/INTENT.md`) | The read-only architecture agent Publish delegates to for doc-impact identification and review                                                                                                                                                                                                                                                                       |
| `{{DESIGN_LIFECYCLE_SCOPE_NOTE}}` | Q10b — design lifecycle scope                             | One callout line stating what `/design` targets and where output lands. Project-scoped/Product-context-scoped: e.g. `> 🗂 **{{PRODUCT_CONTEXT_DIR}} design** — this lifecycle covers {{PRODUCT_CONTEXT_DIR}} design only. Every session sources context from and lands output there.` Two-track: see the exact wording in `design-frame/INTENT.md`'s Two-track branch |

## Conditionals

See the shared design-lifecycle-scope conditional in `design-frame/INTENT.md` — it governs `{{DESIGN_ARCHITECT_AGENT}}`, `{{DESIGN_DOCS_ROOT}}`, and `{{DESIGN_LIFECYCLE_SCOPE_NOTE}}` consistently across all `/design` skills. `pattern-context-resolution.md` is only deployed for the Two-track mode — omit it entirely for Project-scoped or Product-context-scoped deployments.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Resume detection uses `*{TICKET}*/**` wildcard, never `[{TICKET}]*`
- [ ] Artifact table has entries for Frame/Research/Elaborate/Solution plus the Review gate (Draft MR set) and Address Feedback (Approved set) rows
- [ ] Phase tracker banner is 7-segment: Frame → Research → Elaborate → Solution → Review → Address Feedback → Publish
- [ ] Phases 1–4 each announce the remaining phases including Review and Publish
- [ ] Phase 5 (Review) delegates to `/design-review-gate`, ends the session at the draft-MR boundary, and branches on its Step 4 outcome (approved → skip to Phase 7; concerns → Phase 6)
- [ ] Phase 6 (Address Feedback) delegates to `/design-address-feedback` and only runs when concerns were raised
- [ ] Phase 7 (Publish) delegates to `/design-publish` and is the terminal phase
- [ ] No literal ticket prefix used outside `{{PROJECT_KEY}}`
- [ ] No standalone "Jira state transitions" table — Jira sync happens once, inside `/design-publish`'s own Jira-sync step, not at every phase start
- [ ] `pattern-multi-decision-split.md` listed in `companion_templates`
