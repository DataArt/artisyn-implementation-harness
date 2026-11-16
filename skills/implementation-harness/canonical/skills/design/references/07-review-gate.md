# Review Gate stage

Apply `{{provider:skills_root}}/design/patterns/metrics.md`; this stage's metrics unit is
`--stage review-gate`. First action, at Step 1: `stage start --stage review-gate`.
Follow the pattern's wait, check, and exit commands for everything after. When
this reference is used only as a correction recipe within another active
stage, retain that stage's metrics ownership.

Resume detection and stage tracking live in `{{provider:skills_root}}/design/SKILL.md`. This
stage's only concern is getting the design into review: verify the artifacts are
ready, suggest the draft MR, record it, and park. Confirming the outcome — has it
been approved, are there concerns, was it declined — is Address Feedback's opening
concern, not this stage's; the session always ends at Step 3, and the developer's
next invocation is `{{provider:invoke:design}} address-feedback {TICKET}`.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/design/patterns/session-continuity.md`.

This is the human-approval gate — a different concern from the WAF quality checks
in `patterns/waf-review.md`.

## Step 1 — Verify prerequisites

`$DESIGN_DIR` comes from the router's Resume Detection.

Verify all of the following exist:

- `design/00 Frame.md`
- `design/01 Research*.md`
- `design/02 Evaluate*.md`
- `solution/Architecture.md`
- `solution/Design*.md`
- `solution/Stack.md`
- `solution/Efforts.md`

If any is missing, tell the developer which phase to complete first and stop.

Read `design/Report.md`. If the Gate section already has a Draft MR URL recorded, **the gate has already been opened** — tell the developer to run `{{provider:invoke:design}} address-feedback {TICKET}` to confirm the outcome, and stop. Do not re-suggest or re-record the MR.

Review `solution/Architecture.md` as the canonical E2E solution. Confirm that every settled
decision and review correction in the report is represented there with its affected
flow, consequence and verification obligation, and that the supporting solution
files do not conflict with it.

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
- Recommended option: <option name from 02 Evaluate.md>
- Key WAF findings: <1–2 lines from Report.md WAF section>

### Approver
@<approver handle>
```

Ask:

> "Who should be the approver? (name or @handle)"

This is a sign-off gate (`patterns/approval-sign-off.md`). **Stop and wait for the approver name.**

Then say:

> "Open a draft MR using the title and body above and paste the resulting PR URL here."

This is a manual operation (`patterns/approval-sign-off.md`) — never open the MR yourself. **Stop and wait for the PR URL.**

---

## Step 3 — Record gate and end session

Update the existing `## Gate` section in `design/Report.md` (pre-created by the template — do not add a new `## Gate` heading):

```
- Approver: {name}
- Draft MR: {URL}
- Approved: pending
```

Update phase tracker: `🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review 🔄 · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳`

Tell the developer:

> "Design is pending approval from `{approver}`. Come back and run `{{provider:invoke:design}} address-feedback {TICKET}` once the MR is approved or commented on — that confirms the outcome and continues from there."

Before yielding, run `wait start --reason approval` with the approver/MR context, then `report`. `stage complete --stage review-gate` is not called yet — that happens once Address Feedback's Step 1 reads the confirmed outcome, since Review Gate's own completion status depends on a fact only that step learns.

**Stop. Session ends here.**

🔁 Re-read `{{provider:skills_root}}/design/SKILL.md` and resume the router from the next stage (Address Feedback).
