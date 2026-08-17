---
name: design-address-feedback
metadata:
  version: 0.1.0
description: Address Feedback phase of the design lifecycle (/design-address-feedback or /design orchestrator). Only runs if the approver raised concerns during Review — reiterates into the traced-to phase, then waits for re-approval.
---

The developer wants to resolve reviewer concerns for a design session. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity** (`.claude/skills/design/pattern-session-continuity.md`): If resuming after context compaction, re-read this full SKILL.md before doing anything. When this phase is complete, re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.

Address Feedback is Phase 6. It only runs when `/design-review-gate` reported concerns. It loops until the MR is re-approved.

---

## Step 1 — Find the design folder and read the gate

Glob for `docs/Stories/*{TICKET}*/**`. Read `design/Report.md` — confirm the Gate section shows `Approved: pending` and the phase tracker shows `💬 Address Feedback 🔄`. If Address Feedback is not the active phase, tell the developer and stop.

---

## Step 2 — Identify the concern and suggest a reiterate path

Ask the developer to describe the concern. Identify which phase/step it traces to and suggest a named reiterate path:

| Concern type                 | Reiterate suggestion                                          |
| ---------------------------- | ------------------------------------------------------------- |
| Architectural approach wrong | Reiterate from Solution, Step 2 — rewrite Architecture        |
| Recommendation wrong         | Reiterate from Elaborate, Step 4 — revisit recommendation     |
| Missing option               | Reiterate from Research, Step 3 — re-delegate to `@architect` |
| Scope wrong                  | Reiterate from Frame, Step 4 — re-draft Boundaries            |

Confirm the reiterate path with the developer, then follow it — apply the fix in the traced-to phase's skill.

---

## Step 3 — Confirm re-approval

Once the reiteration is applied and committed, ask:

> "Has this been re-approved on the MR now? (**yes** / **still concerns**)"

**Stop and wait.**

- If **still concerns** → return to Step 2 for the new or ongoing concern. Loop until resolved.
- If **yes** → update the `Approved:` field in `design/Report.md`'s `## Gate` section to today's date. Update phase tracker: `... · 💬 Address Feedback ✅ · 📤 Publish ⏳`. Tell the developer: "Re-approved — run `/design-publish {TICKET}` to continue."

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.
