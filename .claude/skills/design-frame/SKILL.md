---
name: design-frame
metadata:
  version: 2.0.0
description: Frame phase of the design lifecycle (/design-frame or /design orchestrator). Frames the problem and boundaries, proposes ACs, produces design/00 Frame.md.
---

The developer wants to run the Frame phase of a design session. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity** (`.claude/skills/design/pattern-session-continuity.md`): If resuming after context compaction, re-read this full SKILL.md before doing anything. When this phase is complete, re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.

Frame is Phase 1 of the design lifecycle. It frames the problem, frames the requirements (evaluation criteria for Elaborate), and frames the boundaries before any research begins. Output: `design/00 Frame.md`.

---

## Step 1 — Find or create the design folder

The argument is a ticket number (e.g. `ADLC-042`) or a direct folder path.

- If a ticket number: glob for `docs/Stories/*{TICKET}*/**` — use `*{TICKET}*` wildcard (never `[{TICKET}]*`). On a fresh start no files exist yet, so the glob will return nothing — proceed directly to creating the folder.
- If not found: ask the developer for a short title, then create the folder:

  ```
  docs/Stories/[{TICKET}] {name}/
      design/
  ```

  > "What is the short title for this design ticket? (e.g. 'Context Topology Mapping', 'Data Platform Integration Contract')"

  **Stop and wait.** Use the provided title as `{name}`.

- If `design/Report.md` exists, read it to restore session context.

---

## Step 2 — Feature branch check

Before writing any files, confirm the developer is on the correct feature branch:

> "You're currently on branch `{current-branch}`. Should I suggest a feature branch name first (e.g. `docs/{ticket-lowercase}-{slug}`)? (**yes** / **skip**)"

**Stop and wait for confirmation.** Do not write any files until the developer confirms or skips.

`git checkout -b` is a guarded command — same class as `git commit` / `git push`. Even after the developer says "yes," never run it yourself (including any prep like resolving uncommitted changes). Present the exact command as an instruction for the developer to run:

> "Run this yourself: `git checkout -b docs/{ticket-lowercase}-{slug}`"

Wait for the developer to confirm they've created the branch before proceeding.

---

## Step 3 — Resolve design context

Create `design/Report.md` now if it does not exist, using `.claude/skills/design/report-template.md`. Source and Dest docs are fixed at `docs/Target Architecture (HLD)/` and the Architect agent is fixed at `@architect` — glob recursively under `docs/Target Architecture (HLD)/` for existing subfolders, list what exists, and ask the developer which one this design belongs to (or a new name if none fit). Write the resolved Subfolder into the `## Context` section of `design/Report.md`. Context sources for Step 4 and all subsequent phases: read relevant docs under `docs/Target Architecture (HLD)/` (across its existing subfolders) for anything already established on this topic.

---

## Step 4 — Write 00 Frame.md

Using `.claude/skills/design/frame-template.md`, write `design/00 Frame.md`. Pull context from the sources identified in Step 3.

**Problem** — one paragraph from the ticket description (or `$ARGUMENTS`): what is broken or missing, and why it matters now.

**Requirements** — two sub-sections:

- _Known_ — acceptance criteria and requirements stated in the ticket (verbatim, cleaned up)
- _Proposed_ — requirements the developer didn't think of. Look for gaps: missing edge cases, non-functional requirements (performance, security, GDPR), operational concerns (observability, rollback), and future-proofing constraints implied by the architecture or engagement context. Propose 2–4 additions. Label each `[proposed]` so the developer can accept or reject.

These requirements become the evaluation criteria rows in the Requirements × Options matrix during Elaborate.

**Boundaries**

- _In scope_ — what this design covers
- _Out of scope_ — what is explicitly excluded (derive from ticket; add obvious exclusions if missing)

**Constraints** — known deadlines, linked tickets, regulatory requirements, product or architectural constraints that directly bound this decision.

**Sizing** _(optional — include only when the ticket warrants capacity planning)_

- Expected users / MAU
- Request volume
- Data volume
- Relevant NFR targets (from the resolved design context or stakeholder requirements)

**Links**

- Ticket: `ADLC-{number}` (internal — no issue tracker URL)
- Related tickets: `<any linked ADLC tickets if any>`
- Reference docs: `<any docs/Target Architecture (HLD)/ docs referenced>`

Write `design/00 Frame.md` to disk.

Apply the write-confirm pattern (`.claude/skills/design/pattern-write-confirm.md`): say "File saved at `design/00 Frame.md`. Proposed requirements are marked `[proposed]` — review in your IDE, accept/reject/edit any of them, then confirm."

**Stop and wait.** Apply any edits the developer requests and re-save. Iterate until the developer confirms.

---

## Step 5 — Reiterate paths

If the developer raises a concern:

- Source data wrong (problem description, linked docs) → "Reiterate from Step 4 — re-draft the Problem and Boundaries sections."
- Problem framing wrong → "Reiterate from Step 4 — re-draft the Problem and Boundaries sections."
- Target subfolder or design context wrong → "Reiterate from Step 3 — re-resolve context and re-prime."

`00 Frame.md` is the single source of ticket context for all subsequent phases. It is not modified again unless the developer explicitly requests a correction.

---

## Step 6 — Do → Report → Commit

Apply the do→report→commit pattern (`.claude/skills/design/pattern-do-report-commit.md`):

**Report** — update `design/Report.md`:

- Phase tracker: `📋 Frame ✅ · 🔍 Research 🔄 · 🏗 Elaborate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳`
- Append to Efforts table: `| {YYYY-MM-DD} | Frame | Context: {subfolder}; {N} known requirements, {M} proposed requirements accepted |`

**Commit** — suggest:

> `docs({TICKET}): frame — <short title>`

**Stop and wait** for the developer to confirm the commit.

🔁 Re-read `.claude/skills/design/SKILL.md` and resume the orchestrator from the next phase.
