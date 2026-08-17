---
name: dev
metadata:
  version: 0.4.0
description: >
  Full dev lifecycle orchestrator (/dev {ticket}): Plan → Implement → Test → Document.
  Trigger: "build ADLC-XX", "implement ADLC-XX", or starting a ticket from scratch.
  Do NOT invoke for a single phase — use /dev-plan, /dev-implement, /dev-test, /dev-document directly.
---

The developer wants to run the full development workflow for a ticket. Here is their input:

---

## $ARGUMENTS

---

This command orchestrates the full flow: **Plan → Implement → Test → Document**.
You guide the developer through all four phases in a single session without them needing to type separate commands.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

---

## Idempotency check

Before presenting any prompts, parse the ticket number from `$ARGUMENTS` (`ADLC-\d+`). If found:

- Glob for `docs/Stories/*{TICKET}*/impl/2-report.md` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`)
- If the file exists, read it and extract the `Phase` row from the header table

If stale state is found, present:

> "I found an existing report for `{TICKET}`. Current phase: `{phase-row}`.
>
> Resume from where you left off, or restart from scratch? (**resume** / **restart**)"

**Stop and wait.**

- If **resume** — skip directly to the appropriate phase (e.g. if Phase shows `🔨 Implement 🔄`, jump to Phase 2). Do not re-run earlier phases.
- If **restart** — continue normally from Phase 1 below.

If no stale state is found — continue normally from Phase 1.

---

## Phase tracker

Display this banner whenever announcing a phase transition. Update the active phase indicator accordingly:

```
📋 Plan [status] · 🔨 Implement [status] · 🧪 Test [status] · 📝 Document [status]
```

Where `[status]` is one of: `🔄` (active) · `✅` (done) · `⏳` (pending)

Example when entering Implement:

```
📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳
```

---

## Phase 1 — Plan

**STOP.** Present to the developer:

> "Ready to plan?
>
> Type **yes** to begin, or **no** to stop here."

**DO NOT call any tools, read any files, or begin planning until the developer replies with "yes". Output the question above and wait.**

**Only if the developer confirms with "yes":** follow the `/dev-plan` skill exactly.

Once `1-plan.md` is saved, **STOP** and emit a progress announcement (`.claude/skills/dev/pattern-announce-progress.md`), then ask:

> "✅ Done: plan saved to `1-plan.md`
> 📋 After this phase: Implement → Test → Document
>
> Ready to move into implementation? Type **yes** to start Step 1, or **no** to stop here and resume later with `/dev-implement {TICKET}`."

Only proceed to Phase 2 if the developer confirms.

---

## Phase 2 — Implement

Follow the `/dev-implement` skill exactly. Once all steps are verified and `2-report.md` is updated, **STOP** and emit a progress announcement (`.claude/skills/dev/pattern-announce-progress.md`), then ask:

> "✅ Done: all implementation steps verified and committed
> 📋 After this phase: Test → Document
>
> Ready to run the test stage? Type **yes** to continue, or **no** to stop here and resume later with `/dev-test {TICKET}`."

Only proceed to Phase 3 if the developer confirms.

---

## Phase 3 — Test

Follow the `/dev-test` skill exactly. Once test results are recorded in `2-report.md`, **STOP** and emit a progress announcement (`.claude/skills/dev/pattern-announce-progress.md`), then ask:

> "✅ Done: tests complete, PR review recorded
> 📋 After this phase: Document
>
> Ready to run the documentation stage? Type **yes** to continue, or **no** to stop here and resume later with `/dev-document {TICKET}`."

Only proceed to Phase 4 if the developer confirms.

---

## Phase 4 — Document

Follow the `/dev-document` skill exactly. Once the `## Documentation` section is appended to `2-report.md`, proceed to Completion.

---

## Completion

When all four phases are done, ask about the merge request:

> "🔀 Ready to open a merge request? (**yes** / **skip**)"

**Stop and wait for confirmation.** If confirmed, present the suggested title and description separately — do not provide a `gh` command:

> **Title:**
>
> ```
> {type}({ticket-lowercase}): <one-line summary>
> ```
>
> _(pick the right type: `feat` for new capability, `fix` for a bug, `chore` for tooling/config, `docs` for documentation-only, `refactor` for code change with no behaviour change)_
>
> **Description:**
>
> ````
> ## Summary
> - <bullet points from the plan scope>
>
> ## Test plan
> - [ ] <key manual checks from the verification steps>
>
> Closes {TICKET}
> ```"
> ````

**Stop and wait.**

Then tell the developer:

> 🎉 **{TICKET} is done — great work!**
>
> 📋 Plan ✅ -> 🔨 Implement ✅ -> 🧪 Test ✅ -> 📝 Document ✅
>
> - Plan: `docs/Stories/archive/[{TICKET}] ✅ Done — {name}/impl/1-plan.md`
> - Report: `docs/Stories/archive/[{TICKET}] ✅ Done — {name}/impl/2-report.md`
>
> 💡 If anything surprised you during this ticket, capture it now:
>
> ```
> /skill-reflect <your brain-dump here>
> ```
