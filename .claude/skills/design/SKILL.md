---
name: design
metadata:
  version: 1.1.0
description: >
  Full design lifecycle orchestrator (/design {ticket}): Frame → Research → Elaborate → Solution → Review → Address Feedback → Publish.
  Trigger: "design ADLC-XX", "run the design for ADLC-XX".
  Do NOT invoke for a single phase — use /design-frame, /design-research, etc. directly.
---

The developer wants to run the full design workflow for a ticket. Here is their input:

---

## $ARGUMENTS

---

This command orchestrates the full design flow: **Frame → Research → Elaborate → Solution → Review → Address Feedback → Publish**.
Guide the developer through all phases in a single session, stopping at each boundary for confirmation.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

---

## Resume Detection (run first, every time)

**Step 1 — Locate the design folder**

Glob for `docs/Stories/*{TICKET}*/**` using a `*{TICKET}*` wildcard (never `[{TICKET}]*` — square brackets are glob metacharacters). The `/**` suffix is required because Glob matches files, not directories.

- No files found → fresh start; go to Phase 1.
- Files found → derive folder path from the first matched file.

**Step 2 — Read Report.md**

If `design/Report.md` exists, read it. Its phase tracker row is the authoritative resume point. Also verify artifacts on disk:

| Artifact on disk              | Phase done                                      |
| ----------------------------- | ----------------------------------------------- |
| `design/00 Frame.md`          | Frame ✅                                        |
| `design/01 Research.md`       | Research ✅                                     |
| `design/02 Elaborate.md`      | Elaborate ✅                                    |
| `solution/Efforts.md`         | Solution ✅                                     |
| Report.md Gate — Draft MR set | Review 🔄 (pending)                             |
| Report.md Gate — Approved set | Review ✅ · Address Feedback ✅ (or ⏭️ skipped) |

**Step 3 — Present status and confirm**

> "Found existing design for `{TICKET}`:
>
> `📋 Frame [status] · 🔍 Research [status] · 🏗 Elaborate [status] · 📦 Solution [status] · 🔎 Review [status] · 💬 Address Feedback [status] · 📤 Publish [status]`
>
> Resuming from **Phase N — {Name}**. Type **yes** to continue, or name a specific phase and step to jump to (e.g. 'Elaborate, Step 4')."

Wait for confirmation before proceeding. If the developer names a specific phase or phase+step, jump directly to it — do not re-run earlier steps.

---

## Phase tracker

Display this banner at every phase transition:

```
📋 Frame [status] · 🔍 Research [status] · 🏗 Elaborate [status] · 📦 Solution [status] · 🔎 Review [status] · 💬 Address Feedback [status] · 📤 Publish [status]
```

Where `[status]` is: `🔄` (active) · `✅` (done) · `⏳` (pending)

---

## Phase 1 — Frame

> Skip if Report.md phase tracker shows Frame ✅.

Follow the `/design-frame` skill exactly.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/pattern-announce-progress.md`): `"📋 Remaining: Research → Elaborate → Solution → Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/pattern-compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to move into Research? Type **yes** to continue, or **no** to stop and resume later with /design-research {TICKET}."`

---

## Phase 2 — Research

> Skip if Report.md phase tracker shows Research ✅.

Follow the `/design-research` skill exactly.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/pattern-announce-progress.md`): `"📋 Remaining: Elaborate → Solution → Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/pattern-compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to move into Elaborate? Type **yes** to continue, or **no** to stop and resume later with /design-elaborate {TICKET}."`

---

## Phase 3 — Elaborate

> Skip if Report.md phase tracker shows Elaborate ✅.

Follow the `/design-elaborate` skill exactly.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/pattern-announce-progress.md`): `"📋 Remaining: Solution → Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/pattern-compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to build the Solution? Type **yes** to continue, or **no** to stop and resume later with /design-solution {TICKET}."`

---

## Phase 4 — Solution

> Skip if Report.md phase tracker shows Solution ✅.

Follow the `/design-solution` skill exactly.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/pattern-announce-progress.md`): `"📋 Remaining: Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/pattern-compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to open the Review gate (draft MR)? Type **yes** to continue, or **no** to stop and resume later with /design-review-gate {TICKET}."`

---

## Phase 5 — Review

> Skip if Report.md phase tracker shows Review ✅ (or Publish ✅).

Follow the `/design-review-gate` skill exactly — it opens a draft MR, records the gate, and (on resume) reports whether the approver signed off or raised concerns.

Once the draft MR is open, the session ends. `/design-review-gate` resumes at its Step 4 on the next invocation, after out-of-band human approval.

On resume, Step 4 reports the outcome:

- **Approved, no concerns:**
  1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/pattern-announce-progress.md`): `"📋 Remaining: Publish"`
  2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/pattern-compact-between-phases.md`); **STOP** and wait
  3. **Resume** — `"Ready to Publish? Type **yes** to continue, or **no** to stop and resume later with /design-publish {TICKET}."`
  4. Skip Phase 6 — go directly to Phase 7.
- **Concerns raised** → proceed to Phase 6.

---

## Phase 6 — Address Feedback

> Only runs if the approver raised concerns during Review. Skip if Report.md phase tracker shows Address Feedback ✅ or ⏭️ (skipped).

Follow the `/design-address-feedback` skill exactly — it identifies which phase/step the concern traces to, suggests the named reiterate path, applies the fix in that phase, and loops until the MR is re-approved.

Once re-approved:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/pattern-announce-progress.md`): `"📋 Remaining: Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/pattern-compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to Publish? Type **yes** to continue, or **no** to stop and resume later with /design-publish {TICKET}."`

---

## Phase 7 — Publish

> Skip if Report.md phase tracker shows Publish ✅.

Follow the `/design-publish` skill exactly — doc impact identification, doc updates, `@architect` review, archive, and hand-off. This is the final phase; the design lifecycle is closed once it completes.
