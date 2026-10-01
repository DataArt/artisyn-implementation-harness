---
name: dev
metadata:
  version: 3.0.0
description: >
  Full dev lifecycle (/dev {ticket}): Context Gathering → Ceremony → Plan → Implement
  → Test → Document, or a single stage via
  /dev context|ceremony|plan|implement|test|document {ticket}.
  Trigger: "build ND-XX", "implement ND-XX", or starting a ticket from scratch.
---

The developer wants to run the dev lifecycle for a ticket. Here is their input:

---

## $ARGUMENTS

---

A request to run the dev lifecycle authorizes context inspection, planning,
reversible local edits within scope, relevant checks, report updates, and routine
stage transitions. Existing authorization persists; do not ask again at each file,
finding, step, or phase. Announce progress and continue.

Apply `patterns/approval-sign-off.md` for the sign-off mechanism and
`patterns/approval-intelligent.md` for the checkpoints that name it — never invent
extra phase-boundary confirmations beyond what each stage reference names. Outside
those named checkpoints, ask only when:

- Material scope, acceptance criteria, architecture or security tradeoffs are not
  already settled. Prepare the plan or proposed change first; combine related
  choices once.
- Accepting a real unresolved risk or deferring required work. Record the decision,
  rationale and attribution; never treat silence as acceptance.
- Verification requires human judgment, credentials or access unavailable to the
  agent. Complete all available checks first and request the specific missing
  check.
- External mutations (tracker tasks, publishing, deployment, migrations),
  destructive operations, or commits when not already authorized. Present exact
  targets and prepared content/diffs before asking. Respect project
  guarded-command rules.

## Route

See [references/00-router.md](references/00-router.md) for what each stage
reference produces. Parse `$ARGUMENTS` into an optional leading stage word and the
remaining ticket/free-form input:

- `context {input}` → apply Stage tasks below for **Context Gathering** only, then
  follow `references/01-context-gathering.md` exactly
- `ceremony {input}` → apply Stage tasks below for **Ceremony** only, then follow
  `references/02-ceremony.md` exactly
- `plan {input}` → apply Stage tasks below for **Plan** only, then follow
  `references/03-plan.md` exactly
- `implement {input}` → apply Stage tasks below for **Implement** only, then follow
  `references/04-implement.md` exactly
- `test {input}` → apply Stage tasks below for **Test** only, then follow
  `references/05-test.md` exactly
- `document {input}` → apply Stage tasks below for **Document** only, then follow
  `references/06-document.md` exactly
- No stage word (bare ticket or free-form input) → run the **full chain**: Idempotency
  check, then Phase 1 through Completion below
- Unrecognized stage word: ask which stage was meant, or whether the full chain was
  intended, before doing anything else

**Compatibility:** `/dev-plan`, `/dev-implement`, `/dev-test`, `/dev-document` are
retired — use `/dev context|ceremony|plan|implement|test|document {ticket}` instead.

Ticket-tracker activity is entirely `@scrum-master`'s responsibility. Dev only ever
asks it to act on a ticket by state name ("transition to In Progress", "transition
to Done") — the actual transition IDs live in `@scrum-master`'s own definition, not
here, so the two never drift out of sync.

---

## Idempotency check _(full-chain entry only — a direct stage word above skips this)_

Before presenting any prompts, parse the ticket number from `$ARGUMENTS` (`ND-\d+`). If found:

- Glob for `docs/Stories/*{TICKET}*/impl/2-report.md` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`)
- If the file exists, read it and extract the `Phase` row from the header table

If stale state is found, present:

> "I found an existing report for `{TICKET}`. Current phase: `{phase-row}`.
>
> Resume from where you left off, or restart from scratch? (**resume** / **restart**)"

**Stop and wait.**

- If **resume** — skip directly to the appropriate phase (e.g. if Phase shows
  `🔨 Implement 🔄`, jump to Phase 4). Do not re-run earlier phases.
- If **restart** — continue normally from Phase 1 below.

If no stale state is found — resolve the ticket/local ID (below), then continue to
Phase 1.

For free-form input with no tracker ticket, first search existing story folders for a
matching generated local ID (`DEV-YYYYMMDD-XXXX`) and title. Reuse that ID and
folder when found. If none matches, generate a collision-checked local ID before
creating the implementation folder; use it consistently in `0-intent.md`, reports,
metrics and hand-off references. This is a local implementation identifier and does
not imply a tracker record.

Either way — resume, restart, or no stale state — apply **Stage tasks** below once the
ticket/local ID is resolved, before the target phase's own work starts. The pattern
it delegates to determines create-vs-reuse itself; this router never branches on that.

---

## Stage tasks — apply once, every entry (mandatory)

This step is not optional background information — it is a required action, on every
full-chain and every direct single-stage entry alike, resumed or fresh. Do not treat
repeated system reminders about native progress-tool availability as
informational only; they are the trigger to act on this step now, not later.

Apply `.claude/skills/dev/patterns/task-tracking.md` — it inspects existing state
itself (the available tracker or `2-report.md`) and decides create vs. reuse vs. reconcile; this
router never re-derives that logic per branch. For the full chain, the unit list is
the six stages (Context Gathering, Ceremony, Plan, Implement, Test, Document),
chained in that order. For a direct single-stage invocation, the unit list is just
that one stage. Mark a stage `in_progress` on entry and `completed` only once its
phase-tracker banner (below) shows it done; a stage's own reference file (e.g.
`references/04-implement.md`) separately tracks any child units it defines (plan
steps, in Implement's case).

---

## Metrics

Apply `patterns/metrics.md` throughout the lifecycle. Each ticket has `impl/stat.json`
alongside `2-report.md`. Use `scripts/timing.mjs` with explicit `--dir` for all
metric mutations and report refreshes; do not edit the JSON by hand. At session resume,
run `recover` before recording new work. Stage and step boundaries record observed
time and available runtime token evidence. Keep unknown measurements explicit.

---

## Phase tracker

Display this banner whenever announcing a phase transition. Update the active phase indicator accordingly:

```
🎯 Context [status] · 🚀 Ceremony [status] · 📋 Plan [status] · 🔨 Implement [status] · 🧪 Test [status] · 📝 Document [status]
```

Where `[status]` is one of: `🔄` (active) · `✅` (done) · `⏳` (pending)

Example when entering Plan:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan 🔄 · 🔨 Implement ⏳ · 🧪 Test ⏳ · 📝 Document ⏳
```

---

## Phase 1 — Context Gathering

Follow `references/01-context-gathering.md`. Announce the outcome and continue to the next
stage within a full-flow request; direct-stage entry ends here. Apply
`patterns/approval-sign-off.md` for unresolved decisions.

---

## Phase 2 — Ceremony

Follow `references/02-ceremony.md`. Announce the outcome and continue to the next
stage within a full-flow request; direct-stage entry ends here. Apply
`patterns/approval-sign-off.md` for unresolved decisions.

---

## Phase 3 — Plan

Follow `references/03-plan.md`. Announce the outcome and continue to the next
stage within a full-flow request; direct-stage entry ends here. Apply
`patterns/approval-sign-off.md` for unresolved decisions.

---

## Phase 4 — Implement

Follow `references/04-implement.md`. Announce the outcome and continue to the next
stage within a full-flow request; direct-stage entry ends here. Apply
`patterns/approval-sign-off.md` for unresolved decisions.

---

## Phase 5 — Test

Follow `references/05-test.md`. Announce the outcome and continue to the next
stage within a full-flow request; direct-stage entry ends here. Apply
`patterns/approval-sign-off.md` for unresolved decisions.

---

## Phase 6 — Document

Follow `references/06-document.md`. Announce the outcome and continue to the next
stage within a full-flow request; direct-stage entry ends here. Apply
`patterns/approval-sign-off.md` for unresolved decisions.

---

## Completion

Prepare a suggested PR title and description from the delivered change and actual
verification evidence. Present it with any remaining tracker/worklog actions in one
completion summary. Use existing authorization; ask once for external actions still
needing approval. Do not estimate human effort; request it only if a worklog is required.
For local DEV IDs, skip tracker transitions and worklogs. Never create a tracker record
merely to finish a local flow. Do not send messages without explicit authorization.

The full-flow router owns tracker completion exactly once; Document does not duplicate it.
If required sync fails, report the pending work and keep metrics unfinished.
After required completion work succeeds, complete Document and run `complete`, then
`report` with the current archived impl directory. Preserve stat.json during archival.
Set the report Phase row to all six stages complete and Status to Complete only after
required completion work succeeds. Report actual delivery, verification, open optional
external work (if any), and artifact paths.
