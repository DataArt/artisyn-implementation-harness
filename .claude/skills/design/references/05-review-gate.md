# Review Gate stage

Apply `.claude/skills/design/patterns/metrics.md`; this stage's metrics unit is
`--stage review-gate`. Follow its initialization/recovery, entry, wait, check, and exit
commands. When this reference is used only as a correction recipe within another
active stage, retain that stage's metrics ownership.

Resume detection and stage tracking live in `.claude/skills/design/SKILL.md`. This
stage has two entry points: **pre-gate** (Steps 1–3, open draft MR) and **post-gate**
(Step 4, run after the MR is approved or commented on out-of-band). The session
always ends at Step 3. Step 4 begins on the next `/design review-gate {TICKET}`
invocation.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/design/patterns/session-continuity.md`.

This is the human-approval gate — a different concern from the WAF quality checks
in `patterns/waf-review.md`.

## Step 1 — Verify prerequisites

Find the design folder by globbing `docs/Stories/*{TICKET}*/**`.

Verify all of the following exist:

- `design/00 Frame.md`
- `design/01 Research*.md`
- `design/02 Evaluate*.md`
- `solution/Architecture.md`
- `solution/Design*.md`
- `solution/Stack.md`
- `solution/Efforts.md`

If any is missing, tell the developer which phase to complete first and stop.

Read `design/Report.md`. If the Gate section already has a Draft MR URL recorded, **the gate has been opened** — skip directly to Step 4.

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

Update phase tracker: `📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review 🔄 · 💬 Address Feedback ⏳ · 📤 Publish ⏳`

Tell the developer:

> "Design is pending approval from `{approver}`. Come back and run `/design review-gate {TICKET}` once the MR is approved or commented on."

Before yielding, run `wait start --reason approval` with the approver/MR context, then `report`.

**Stop. Session ends here. Do not proceed to Step 4 automatically.**

---

## Step 4 — Confirm outcome

Ask:

> "Has the MR been approved? (**yes** / **concerns**)"

**Stop and wait.**

- If **yes** → resume work, record a passed `Design approval` acceptance check with attributed evidence, and `stage skip --stage address-feedback --reason no_concerns --evidence <confirmation>` per the metrics pattern; then update the `Approved:` field in `design/Report.md`'s `## Gate` section to today's date. Update phase tracker: `... · 🔎 Review ✅ · 💬 Address Feedback ⏭️ (skipped) · 📤 Publish ⏳`. Tell the developer: "Approved — run `/design publish {TICKET}` to continue."
- If **concerns** → resume work and record a failed `Design approval` check before completing Review Gate and entering Address Feedback; then update phase tracker: `... · 🔎 Review ✅ · 💬 Address Feedback 🔄 · 📤 Publish ⏳`. Tell the developer: "Concerns raised — run `/design address-feedback {TICKET}` to resolve them."

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the router from the next stage.
