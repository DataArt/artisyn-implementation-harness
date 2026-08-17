---
name: design-review-gate
metadata:
  version: 0.1.0
description: Review phase of the design lifecycle (/design-review-gate or /design orchestrator). Opens a draft MR, records the approval gate, and reports whether the approver signed off or raised concerns.
---

The developer wants to run the Review phase of a design session. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity** (`.claude/skills/design/pattern-session-continuity.md`): If resuming after context compaction, re-read this full SKILL.md before doing anything. When this phase is complete, re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.

Review is Phase 5. It has two entry points: **pre-gate** (Steps 1–3, open draft MR) and **post-gate** (Step 4, run after the MR is approved or commented on out-of-band). The session always ends at Step 3. Step 4 begins on the next `/design-review-gate {TICKET}` invocation.

---

## Step 1 — Verify prerequisites

Find the design folder by globbing `docs/Stories/*{TICKET}*/**`.

Verify all of the following exist:

- `design/00 Frame.md`
- `design/01 Research.md`
- `design/02 Elaborate.md`
- `solution/Architecture.md`
- `solution/Design.md`
- `solution/Stack.md`
- `solution/Efforts.md`

If any is missing, tell the developer which phase to complete first and stop.

Read `design/Report.md`. If the Gate section already has a Draft MR URL recorded, **the gate has been opened** — skip directly to Step 4.

---

## Step 2 — Suggest draft MR

Compose and display:

**Suggested MR title:**

```
Design: {TICKET} — <short title>
```

**Suggested MR body:**

```
## Design: {TICKET} — <short title>

Design artifacts for {TICKET}. See `design/` and `solution/` folders.

### Summary
- Recommended option: <option name from 02 Elaborate.md>
- Key WAF findings: <1–2 lines from Report.md WAF section>

### Approver
@<approver handle>
```

Ask:

> "Who should be the approver? (name or @handle)"

**Stop and wait for the approver name.**

Then say:

> "Open a draft MR using the title and body above and paste the resulting PR URL here."

**Stop and wait for the PR URL.**

---

## Step 3 — Record gate and end session

Update the existing `## Gate` section in `design/Report.md` (pre-created by the template — do not add a new `## Gate` heading):

```
- Approver: {name}
- Draft MR: {URL}
- Approved: pending
```

Update phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Elaborate ✅ · 📦 Solution ✅ · 🔎 Review 🔄 · 💬 Address Feedback ⏳ · 📤 Publish ⏳`

Tell the developer:

> "Design is pending approval from `{approver}`. Come back and run `/design-review-gate {TICKET}` once the MR is approved or commented on."

**Stop. Session ends here. Do not proceed to Step 4 automatically.**

---

## Step 4 — Confirm outcome

Ask:

> "Has the MR been approved? (**yes** / **concerns**)"

**Stop and wait.**

- If **yes** → update the `Approved:` field in `design/Report.md`'s `## Gate` section to today's date. Update phase tracker: `... · 🔎 Review ✅ · 💬 Address Feedback ⏭️ (skipped) · 📤 Publish ⏳`. Tell the developer: "Approved — run `/design-publish {TICKET}` to continue."
- If **concerns** → update phase tracker: `... · 🔎 Review ✅ · 💬 Address Feedback 🔄 · 📤 Publish ⏳`. Tell the developer: "Concerns raised — run `/design-address-feedback {TICKET}` to resolve them."

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.
