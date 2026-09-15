# Implement stage

Routing and stage tracking live in `.claude/skills/dev/SKILL.md`. This stage executes
the approved `1-plan.md` one step at a time.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

> 🔁 **Session continuity:** apply `.claude/skills/dev/patterns/session-continuity.md`.

## Step 1 — Find the plan

The argument is either a ticket number (e.g. `{{PROJECT_KEY}}-042`) or a direct path to a plan folder.

- If a ticket number: look for `docs/Stories/*{TICKET}*/impl/1-plan.md` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`, square brackets are glob metacharacters)
- If a path: read `1-plan.md` inside that folder
- If not found: tell the developer and stop

Read the full `1-plan.md` before doing anything. Also open `2-report.md` — this is where all notes, tech debt, and status will be written. **Never edit `1-plan.md`.**

**Architecture deviation check:** if `1-plan.md` contains an `## Architecture Deviations` section with any rows, surface them to the developer before starting:

> "This plan includes the following approved architecture deviations:
>
> | #   | Deviation     | Justification     |
> | --- | ------------- | ----------------- |
> | 1   | `{deviation}` | `{justification}` |
>
> These will be highlighted in `2-report.md` and must be addressed in the Document phase (Target Architecture update or tech debt ticket). Proceeding."

Copy the deviations table into the `## Architecture Deviations` section of `2-report.md` verbatim.

## Step 2 — Advance phase and track steps

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳
```

Apply `.claude/skills/dev/patterns/task-tracking.md` with the plan's numbered steps
as the unit list: one task per step, chained in plan order. This is in addition to
the stage-level Implement task the router already created — these are the child
units within it.

Then confirm with the developer: which plan you are about to execute, how many steps it contains, and ask: "Ready to start with Step 1?"

## Step 3 — Execute one step at a time

Before starting each step, determine its layer from the step title and scope:

- **{{BACKEND_LAYER_KEYWORDS}}** → delegate to `{{BACKEND_AGENT}}`. Give it the full step description from `1-plan.md` plus the current `2-report.md` for context. `{{BACKEND_AGENT}}` handles the implementation; you coordinate verification and report updates.
- **{{FRONTEND_LAYER_KEYWORDS}}** → delegate to `{{FRONTEND_AGENT}}`. Same handoff pattern.
- **{{DATA_LAYER_KEYWORDS}}** → delegate to `{{DATA_AGENT}}`. Same handoff pattern.
- **infra / config / docs** → implement inline.

> **Scope discipline:** implement exactly what the step describes — no more, no less. Do not add features, refactors, or improvements beyond what the step specifies.

For each step:

1. Mark the step's task `in_progress` (per `patterns/task-tracking.md`). Announce which step you are starting (e.g. "Starting Step 2 — Backend: user-profile module") and whether you are delegating or implementing inline
2. Implement (or delegate). Worker agents run a satellite review after non-trivial steps before returning (see `.claude/skills/dev/patterns/satellite-review.md`)
3. When the step is done — including any satellite review — present the verification instructions from the plan exactly as written
4. **Stop and wait for the developer to confirm the step passes before continuing**

> ⛔ **HARD STOP — do not edit any file, do not update `2-report.md`, do not start the next step until the developer explicitly confirms verification passed.**

Once verification passes, follow the do → report → commit pattern (`.claude/skills/dev/patterns/do-report-commit.md`) — **update `2-report.md` first, then present the commit message. In order:**

1. Update the step's row in the `## Progress` table of `2-report.md`:

   - Set Status to `✅ Done`
   - Add a short note in Notes (helps restore context if the session is interrupted)
   - Leave Test and Docs columns empty — filled by later phases

2. Add a `### Step N — {title}` entry at the **bottom** of the `## Implementation Notes` section for **every** step:

   - First try: a one-liner is enough ("went as planned")
   - Troubleshooting required: write a full incident record — initial error, each hypothesis tested and ruled out, root cause and fix. A terse note like "fixed and resolved" is **not acceptable** when there was a troubleshooting chain
   - Always add at the bottom; notes must stay in ascending step order (1 → 2 → 3 …)
   - When writing the **first** step note, remove the placeholder line (`_Added for every step…_`) before inserting `### Step 1`

3. Add a row to the `## Efforts Spent` table automatically — do not ask the developer. Use today's date, phase `Implement`, leave Human time and AI tokens blank, short note with the step number and title.

4. Mark the step's task `completed` (per `patterns/task-tracking.md`), verifying the completion evidence above rather than a worker's self-report alone. Present the commit message and progress announcement (`.claude/skills/dev/patterns/announce-progress.md`):

   > "Step N complete — `2-report.md` updated. Please commit with:
   >
   > ```
   > <suggested conventional commit message>
   > ```
   >
   > ✅ Done: <one-line summary>
   > 🔜 Next in this phase: <remaining steps, numbered>
   >
   > Once committed, let me know and I'll start Step N+1."

   **Commit message format (Conventional Commits):**

   - `{type}({scope}): {description}` — all lowercase, imperative mood, no period
   - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `build`
   - Scope: the NX project name or layer (`infra`, `auth`, `web`)
   - No body unless breaking change — then add `BREAKING CHANGE: <what and why>` as a footer
   - Examples: `feat(infra): provision managed identity and key vault` · `feat(auth): add basic auth header validation`

5. **Stop and wait for the developer to confirm the commit is done before starting the next step.**

> ⚠️ **Never commit yourself.** Do not run `git add`, `git commit`, or any git write command.

## Step 4 — Handle external blockers

If a step cannot be completed because of an external dependency (IT request, insufficient permissions, network policy, missing secret):

1. **Do not stop** — continue with steps that are independent of the blocker
2. Add a row to the `## Tech Debt` table with type `blocker`:
   - What is blocked and why
   - The exact action required (command to run, request text to send, who to contact)
   - What to do once the blocker is resolved
3. Log it in `## Implementation Notes` under the relevant step entry
4. Tell the developer: "Step N is blocked on `{reason}`. I've logged it in 2-report.md and will continue with unblocked steps."

## Step 5 — Capture tech debt during implementation

If during any step you discover something that should be done but is out of scope: do not implement it. Add a row to the `## Tech Debt` table in `2-report.md` and mention it briefly to the developer: "Added TD-N to tech debt: `{title}`".

| #    | Description                                      | Type     | Ticket |
| ---- | ------------------------------------------------ | -------- | ------ |
| TD-N | Short title — one sentence on what and why defer | `{type}` | —      |

Valid types: `blocker` · `dependency` · `cleanup` · `security` · `performance` · `ux`

## Step 6 — Handle failures

If the developer reports an error during verification:

- Diagnose the root cause before changing anything
- Fix only what is broken — do not refactor surrounding code
- Re-present the same verification instructions after the fix
- Do not move to the next step until the current one passes

## Step 7 — Completion

When all steps are verified and committed, update `2-report.md`:

1. **Phase row** — `🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ⏳ · 📝 Document ⏳`. Do not set Status to Complete — that is done at the end of the Document phase.

2. **Progress table** — all rows should already reflect their final status. Do a final pass to confirm nothing is stale.

3. **Delivery Summary** — add only if the ticket warrants a human-readable summary (significant feature, complex refactor, or something a reviewer would benefit from reading). Skip for small or mechanical changes:

   ```markdown
   ## Delivery Summary

   <One short paragraph — what was built, what it enables, what changed for the user or system.>
   ```

   Insert between the Progress table and Implementation Notes.

4. **Tech Debt** — already populated during Steps 4–5. Add any final items discovered at wrap-up.

5. **TD triage** — present each open TD item: "Implement now (this session) or track as a tracker ticket?" Flag any TD that blocks the current ticket's acceptance criteria — those need a decision before the Test phase starts.

   **If the developer chooses to implement a TD now:** invoke `/dev plan {TD description}` and tell the developer to **skip to Step 2** (plan content rules) — bypass Step 0–1. The context is already established. Append new TD steps to the **existing `1-plan.md`** and add corresponding rows to the `## Progress` table so total delivery status stays visible in one place.

6. **Efforts Spent** — per-step rows were already added during implementation. Add one final summary row if useful (total session note, unexpected complexity).

Then tell the developer: "All steps complete. `2-report.md` updated."

🔁 Re-read `.claude/skills/dev/SKILL.md` and resume the router from the next stage (Test).
