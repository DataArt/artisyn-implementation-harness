---
name: design
metadata:
  version: 3.4.1
description: >
  Full design lifecycle (/design {ticket}): Frame → Research → Evaluate → Solution
  → Review Gate → Address Feedback → Publish, or a single stage via
  /design frame|research|evaluate|solution|review-gate|address-feedback|publish {ticket}.
  Trigger: "design {{PROJECT_KEY}}-XX", "run the design for {{PROJECT_KEY}}-XX".
---

The developer wants to run the design workflow for a ticket. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

{{DESIGN_LIFECYCLE_SCOPE_NOTE}}

## Route

See [references/00-router.md](references/00-router.md) for what each stage
reference produces. Parse `$ARGUMENTS` into an optional leading stage word and the
remaining ticket/free-form input:

- `frame {input}` → apply Stage tasks below for **Frame** only, then follow
  `references/01-frame.md` exactly
- `research {input}` → apply Stage tasks below for **Research** only, then follow
  `references/02-research.md` exactly
- `evaluate {input}` → apply Stage tasks below for **Evaluate** only, then follow
  `references/03-evaluate.md` exactly
- `solution {input}` → apply Stage tasks below for **Solution** only, then follow
  `references/04-solution.md` exactly
- `review-gate {input}` → apply Stage tasks below for **Review Gate** only, then
  follow `references/05-review-gate.md` exactly
- `address-feedback {input}` → apply Stage tasks below for **Address Feedback**
  only, then follow `references/06-address-feedback.md` exactly
- `publish {input}` → apply Stage tasks below for **Publish** only, then follow
  `references/07-publish.md` exactly
- No stage word (bare ticket or free-form input) → run the **full chain**: Resume
  Detection, then Phase 1 through Completion below
- Unrecognized stage word: ask which stage was meant, or whether the full chain was
  intended, before doing anything else

**Compatibility:** `/design-frame`, `/design-research`, `/design-evaluate`,
`/design-solution`, `/design-review-gate`, `/design-review`,
`/design-address-feedback`, `/design-publish` are retired — use
`/design frame|research|evaluate|solution|review-gate|address-feedback|publish {ticket}`
instead. `/design-review`'s WAF assessment is now `patterns/waf-review.md`, applied
directly by Solution's Step 7b — there is no longer a standalone command for it.

Ticket-tracker activity is entirely `@scrum-master`'s responsibility. Design only
ever asks it to act on a ticket by state name ("transition to In Progress",
"transition to Done") — the actual transition IDs live in `@scrum-master`'s own
definition, not here. The tracker transition and branch checkout happen inside
Frame (Step 3), once the ticket's title/slug is known — there is no separate
Ceremony stage.

---

## Resume Detection (run first, every time)

**Step 1 — Locate the design folder**

For trackerless/free-form input, first reuse an existing `DESIGN-YYYYMMDD-XXXX`
folder whose title matches the request. If none exists, generate that stable local
ID (checking for a collision) before globbing and use it for the folder and all
subsequent artifacts.

Glob for `docs/Stories/*{TICKET}*/**` using a `*{TICKET}*` wildcard (never `[{TICKET}]*` — square brackets are glob metacharacters). The `/**` suffix is required because Glob matches files, not directories.

- No files found → fresh start; resolve the local/tracker ID, then go to Phase 1.
- Files found → derive folder path from the first matched file, then continue to Step 2.

**Step 2 — Read Report.md**

If `design/Report.md` exists, read it. Its phase tracker and machine-readable state
block are the authoritative resume point. Also verify artifacts on disk. For Solution,
use `selected_artifacts` from the state block; an artifact not selected is not evidence
that the phase is incomplete.

| Artifact on disk              | Phase done                                      |
| ----------------------------- | ----------------------------------------------- |
| `design/00 Frame.md`          | Frame ✅                                        |
| `design/01 Research*.md`      | Research ✅                                     |
| `design/02 Evaluate*.md`      | Evaluate ✅                                     |
| Selected solution artifacts   | Solution ✅                                     |
| Report.md Gate — Draft MR set | Review 🔄 (pending)                             |
| Report.md Gate — Approved set | Review ✅ · Address Feedback ✅ (or ⏭️ skipped) |

**Step 3 — Present status and confirm**

> "Found existing design for `{TICKET}`:
>
> `📋 Frame [status] · 🔍 Research [status] · 🏗 Evaluate [status] · 📦 Solution [status] · 🔎 Review [status] · 💬 Address Feedback [status] · 📤 Publish [status]`
>
> Resuming from **Phase N — {Name}**. Type **yes** to continue, or name a specific phase and step to jump to (e.g. 'Evaluate, Step 4')."

Wait for confirmation before proceeding. If the developer names a specific phase or phase+step, jump directly to it — do not re-run earlier steps.

Either way — fresh start or resume — apply **Stage tasks** below once the local/tracker
ID is resolved, before the target phase's own work starts. The pattern it delegates to
determines create-vs-reuse itself; this router never branches on that.

---

## Stage tasks — apply once, every entry (mandatory)

This step is not optional background information — it is a required action, on every
full-chain and every direct single-stage entry alike, resumed or fresh. Do not treat
repeated system reminders about `TaskCreate`/`TaskUpdate`/`TaskList` availability as
informational only; they are the trigger to act on this step now, not later.

Apply `.claude/skills/design/patterns/task-tracking.md` — it inspects existing state
itself (`TaskList` or `design/Report.md`) and decides create vs. reuse; this router
never re-derives that logic per branch. For the full chain, the unit list is the
seven stages (Frame, Research, Evaluate, Solution, Review Gate, Address Feedback,
Publish), chained in that order. For a direct single-stage invocation, the unit list
is just that one stage. Mark a stage `in_progress` on entry and `completed` only once
its phase-tracker banner (below) shows it done — design has no per-step child units
to track underneath a stage the way `dev`'s Implement stage does.

---

## Approval boundaries

A request to run the design lifecycle authorizes context inspection, drafting,
delegating to `{resolved architect agent}`/`@docs-writer`, reversible local writes
within scope, relevant checks, report updates, and routine stage transitions.
Existing authorization persists; do not ask again at each file, finding, step, or
phase. Announce progress and continue.

Apply `patterns/approval-sign-off.md` for the sign-off mechanism and
`patterns/approval-intelligent.md` for the specific steps that name themselves as
using it instead. Outside those named checkpoints, ask only when:

- Material scope, requirement, or tradeoff decisions are not already settled.
  Prepare the draft or proposed content first; combine related choices once.
- Accepting a real unresolved risk (an unresolved OQ marked conditional, a WAF P1
  gap accepted rather than fixed) or deferring required work. Record the decision,
  rationale, and attribution; never treat silence as acceptance.
- Verification requires human judgment or access unavailable to the agent (the
  actual MR approval state).
- External mutations (tracker tasks, publishing, branch checkout, commits) or
  destructive operations, when not already authorized. Present exact targets and
  prepared content/diffs before asking. Respect project guarded-command rules.

## Metrics

Apply `patterns/metrics.md` throughout the lifecycle, including direct-stage entry.
Use `scripts/design-metrics.mjs` with explicit `--dir` pointing to the story's `design/`
directory. Frame initializes `design/stat.json` beside `design/Report.md`; interrupted sessions
run `recover` before new work. Record waits and refresh the report before each hard
stop. Stages own timing; WBS implementation tasks are not design steps. Review Gate
records actual approval evidence, Address Feedback records rework or an approved skip,
and Publish finalizes metrics only after required completion work succeeds.

---

## Phase tracker

Display this banner at every phase transition:

```
📋 Frame [status] · 🔍 Research [status] · 🏗 Evaluate [status] · 📦 Solution [status] · 🔎 Review [status] · 💬 Address Feedback [status] · 📤 Publish [status]
```

Where `[status]` is: `🔄` (active) · `✅` (done) · `⏳` (pending)

---

## Phase 1 — Frame

> Skip if Report.md phase tracker shows Frame ✅.

Follow `references/01-frame.md` exactly — it also handles the ticket's tracker
transition and branch checkout, once the title/slug is known.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/patterns/announce-progress.md`): `"📋 Remaining: Research → Evaluate → Solution → Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/patterns/compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to move into Research? Type **yes** to continue, or **no** to stop and resume later with /design research {TICKET}."`

---

## Phase 2 — Research

> Skip if Report.md phase tracker shows Research ✅.

Follow `references/02-research.md` exactly.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/patterns/announce-progress.md`): `"📋 Remaining: Evaluate → Solution → Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/patterns/compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to move into Evaluate? Type **yes** to continue, or **no** to stop and resume later with /design evaluate {TICKET}."`

---

## Phase 3 — Evaluate

> Skip if Report.md phase tracker shows Evaluate ✅.

Follow `references/03-evaluate.md` exactly.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/patterns/announce-progress.md`): `"📋 Remaining: Solution → Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/patterns/compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to build the Solution? Type **yes** to continue, or **no** to stop and resume later with /design solution {TICKET}."`

---

## Phase 4 — Solution

> Skip if Report.md phase tracker shows Solution ✅.

Follow `references/04-solution.md` exactly.

Once commit is confirmed:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/patterns/announce-progress.md`): `"📋 Remaining: Review → Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/patterns/compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to open the Review gate (draft MR)? Type **yes** to continue, or **no** to stop and resume later with /design review-gate {TICKET}."`

---

## Phase 5 — Review

> Skip if Report.md phase tracker shows Review ✅ (or Publish ✅).

Follow `references/05-review-gate.md` exactly — it opens a draft MR, records the gate, and (on resume) reports whether the approver signed off or raised concerns.

Once the draft MR is open, the session ends. `references/05-review-gate.md` resumes at its Step 4 on the next invocation, after out-of-band human approval.

On resume, Step 4 reports the outcome:

- **Approved, no concerns:**
  1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/patterns/announce-progress.md`): `"📋 Remaining: Publish"`
  2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/patterns/compact-between-phases.md`); **STOP** and wait
  3. **Resume** — `"Ready to Publish? Type **yes** to continue, or **no** to stop and resume later with /design publish {TICKET}."`
  4. Skip Phase 6 — go directly to Phase 7.
- **Concerns raised** → proceed to Phase 6.

---

## Phase 6 — Address Feedback

> Only runs if the approver raised concerns during Review. Skip if Report.md phase tracker shows Address Feedback ✅ or ⏭️ (skipped).

Follow `references/06-address-feedback.md` exactly — it identifies which phase/step the concern traces to, suggests the named reiterate path, applies the fix in that phase, and loops until the MR is re-approved.

Once re-approved:

1. **Announce** — **STOP** and emit a progress announcement (`.claude/skills/design/patterns/announce-progress.md`): `"📋 Remaining: Publish"`
2. **Compact** — apply compact-between-phases pattern (`.claude/skills/design/patterns/compact-between-phases.md`); **STOP** and wait
3. **Resume** — `"Ready to Publish? Type **yes** to continue, or **no** to stop and resume later with /design publish {TICKET}."`

---

## Phase 7 — Publish

> Skip if Report.md phase tracker shows Publish ✅.

Follow `references/07-publish.md` exactly — doc impact identification, doc updates, `{{DESIGN_ARCHITECT_AGENT}}` review, then a single wrap-up stop (publish implementation tickets?), then ticket publication, archive, tracker sync, and close-out run straight through. This is the final phase; the design lifecycle is closed once it completes.
