# Implement stage

Apply `{{provider:skills_root}}/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage implement`. First action: `stage start --stage implement`.

Routing and stage tracking live in `{{provider:skills_root}}/dev/SKILL.md`. This stage
executes the approved `1-plan.md` one step at a time.

Two stops in this stage: the sign-off in Step 4 (`patterns/phase-sign-off.md`) and the
commits by block in Step 6. Report sits between them.
Each step ends with an intelligent checkpoint (Step 3), not a stop. Stop mid-phase
only when a step genuinely needs the developer: a check only they can do, a guarded
command, or a divergence from the plan.

> 🔁 **After context compaction:** re-read this file and run metrics `recover`
> before recording anything (`patterns/session-continuity.md`). Fresh vs. resume was
> already decided by the router's entry check; do not redo completed work.

## Step 1 — Read the plan

`$IMPL_DIR` comes from the router's entry check. If `1-plan.md` is not in it, Plan has
not run: say so and stop.

Read the full `1-plan.md` first. Also open `2-report.md`; all notes, tech debt and
status go there. **Never edit `1-plan.md`.**

Read open and accepted deviations in `## Review Findings`. For legacy plans, import
their exceptions once with source references and deduplicate against existing RF
rows. Do not copy a second live table into the report.

## Step 2 — Advance phase and track steps

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳ · 🏁 Completion ⏳
```

Apply `{{provider:skills_root}}/dev/patterns/task-tracking.md` with the plan's numbered
steps as the unit list: one task per step, in plan order, as children of the
stage-level Implement task the router created.

Announce the plan and step count, then start.

## Step 3 — Execute one step at a time

Before each step, match its target paths against the Agents table in
`{{provider:instructions_file}}` and the installed role definitions. Use the
specialist that owns the component; there is no fixed frontend/backend/data list.
Give it the full step from `1-plan.md` and the current `2-report.md`. Apply
runtime/delegation.md; you own verification and the report.

If no specialist owns the scope, implement inline. Resolve ambiguous ownership
before dispatch. For a cross-component step, give each owner a disjoint scope and
coordinate shared contracts yourself.

> **Scope discipline:** implement exactly what the step says. No extra features,
> refactors or improvements.

For each step:

1. **Register and start.** `step add` (stable ID, title, order, plan reference),
   then `step start --id <ID>`. Mark the step's task `in_progress`. Say which step
   you are starting and whether you delegate or implement inline.

2. **Implement (or delegate).** Workers run a satellite review after non-trivial
   steps before returning (`{{provider:skills_root}}/dev/patterns/satellite-review.md`).
   When a worker returns, check the change actually landed (`git status`,
   `git diff`); a self-report is not evidence.

3. **Verify.** Run the step's verification items from the plan yourself: the
   commands, the curl, the file you inspect. Read the real output. For a check a
   worker already ran with real captured output, use that result instead of
   re-running blindly; re-run only for a reason (the worker lacked the tool, the
   environment differs, the result looks off). Never run a guarded command; that
   item goes to the developer in the checkpoint below. For a test-first step, the
   expected result is red for the stated reason; later steps rerun the same suite
   until green.

   **Record the evidence** (`patterns/metrics.md`), separately from running it:

   - A command you run → wrap it so the real exit status is stored:
     `check --id step-NN-<kind>-run-01 --kind <build|test|lint|typecheck> --name "<what>" -- <command>`
   - A result you observed without a command, or a worker's captured run →
     `check record --source self|worker --result passed|failed --evidence "<what you saw>"`
   - Never `--source developer` for anything the developer did not actually say in
     this conversation.

4. **Step checkpoint.** Intelligent-approval checkpoint
   (`patterns/approval-intelligent.md`). Auto-approval conditions, all required:

   - Every verification item in the plan for this step was something a command or
     your own inspection could answer, and all of them passed
   - The implementation matches the plan's description of the step; any narrowing
     or growth of scope is small and already noted in the report
   - Nothing in the step is UI/UX-visible in a way the developer would want to see
     with their own eyes
   - No guarded command and no credential or access you lack is needed to verify it

   All met → `step complete --id <ID>`, then do items 5 and 6 below, say in one line
   that the step checkpoint passed and what you ran, and start the next step.

   Any condition fails or is uncertain → stop and ask the developer for exactly the
   missing piece. Report what you ran and the real result; name the divergence or
   the item that needs their eyes; give the precise action (what to open, what to
   look at, which command to run). Do not ask a general "does it look good?".
   Before stopping: update the step's Progress row and note, `report`, then
   `wait start --reason user_input --detail "Step N: <what is needed>"`.
   **Stop and wait.** On the reply, `resume --activity implementation` and record
   their answer as an acceptance check with `--source developer` and their words as
   evidence. Passed → `step complete`. Failed → `step retry --id <ID> --reason verification_failure`,
   fix, verify again, come back to this checkpoint.

5. **Report.** Follow `patterns/do-report-commit.md`: update `2-report.md` before any
   commit message, in this order:

   - Progress row → `✅ Done`, a short note in Notes (what landed, anything unusual),
     Test and Docs empty
   - `### Step N — {title}` at the **bottom** of `## Implementation Notes`. One line
     when it went as planned. A full incident record when it needed troubleshooting:
     initial error, each hypothesis ruled out, root cause, fix. "Fixed and resolved"
     is not acceptable after a troubleshooting chain. Remove the placeholder line
     before inserting `### Step 1`.
   - Keep notes in ascending step order.
   - Mark the step's task `completed`.

6. **Announce** (`patterns/announce-progress.md`): what landed, what verified it,
   what is next. Commits are proposed once, by block, at the end of the phase
   (Step 6); do not stop for one here.

> ⚠️ **Never commit yourself.** Do not run `git add` or `git commit`. Other local,
> reversible git operations (`git mv` in Completion)
> are fine. Follow the project's guarded-command rules for everything else.

### While working on a step: external blockers

If a step cannot finish because of an external dependency (IT request, missing
permission, network policy, missing secret):

1. **Do not stop.** Continue with steps that do not depend on it
2. Add a `## Tech Debt` row with type `blocker`: what is blocked and why, the exact
   action required (command, request text, who to contact), what to do once resolved
3. Note it under the step in `## Implementation Notes`
4. Tell the developer: "Step N is blocked on `{reason}`. Logged in 2-report.md, continuing with unblocked steps."

### While working on a step: tech debt

If you find something that should be done but is out of scope, do not do it. Add a
`## Tech Debt` row and mention it in one line: "Added TD-N to tech debt: `{title}`".

| #    | Description           | Type     | Tracker | Finding    | Owner             | Next action        |
| ---- | --------------------- | -------- | ------- | ---------- | ----------------- | ------------------ |
| TD-N | What and why deferred | `{type}` | —       | RF-ID or — | Responsible owner | Concrete next step |

Valid types: `blocker` · `dependency` · `cleanup` · `security` · `performance` · `ux`

### While working on a step: failures

When a check fails or the developer reports an error:

- Diagnose the root cause before changing anything
- Fix only what is broken; do not refactor around it
- Re-run the same named check
- Do not move to the next step until this one passes

## Step 4 — Sign-off (rework if any)

When every step is complete, apply `patterns/phase-sign-off.md`. Present:

- Each step in one line: what landed, what verified it (self / worker / developer),
  the result
- Steps that were auto-approved, and the one-line reason each
- Any divergence from the plan, named explicitly
- Anything the developer should look at themselves before Test (UI, a flow on
  their machine) that did not already stop the phase, as a precise action

> "All {N} steps implemented. {Summary above.} Good to move to Test?"

`report`, then `wait start --reason approval --detail "Awaiting implement sign-off"`.
**Stop and wait.** No reply, no next step. On approval, record the acceptance check
(`--name "Implement sign-off"`, `--source developer`, their words as evidence); without
it `stage complete` is refused.

Rework: `step retry --id <ID> --reason review_feedback` for the affected step, fix,
re-verify through Step 3, present again.

## Step 5 — Report

Update `2-report.md`:

1. **Progress table** — final pass, nothing stale
2. **Delivery Summary** — only if the ticket deserves a human-readable summary
   (significant feature, complex refactor, something a reviewer benefits from).
   One short paragraph between the Progress table and Implementation Notes.
3. **Tech Debt** — anything found at wrap-up. Flag debt that blocks acceptance
   criteria; it cannot be silently deferred. Any authorised scope addition needs a
   plan addendum and new progress rows; the original plan stays as is.
4. **Efforts Spent** — one summary row if useful
5. `Phase` row → `🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test 🔄 · 📝 Document ⏳ · 🏁 Completion ⏳`

Then metrics `report`.

## Step 6 — Commit, by block

One commit per step, or per logical block when several small steps belong together,
in plan order, each with its files:

> "Commits, in order:
>
> 1. `feat(infra): provision managed identity and key vault` — `apps/infra/...`
> 2. `feat(auth): add basic auth header validation` — `apps/lambda-auth/...`
> 3. `docs({ticket-lowercase}): update implementation report` — `impl/2-report.md`, `impl/stat.json`
>
> Let me know when they're in."

Conventional Commits: `{type}({scope}): {description}`, lowercase, imperative, no
period. Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `build`.
Scope: the {{BUILD_UNIT_LABEL}} name or layer. No body unless breaking. A commit
that would need two types to be honest means the block is too broad; split it.

This is a manual-operation sign-off (`patterns/approval-sign-off.md`): the developer
runs the commit, you wait. `wait start --reason user_input --detail "Awaiting commit"`.
**Stop and wait.** On the reply, check `git log`/`git status`: the commit exists and the
worktree holds nothing from this phase. If not, say what is missing and wait again.
Then `stage complete --stage implement`.

🔁 Re-read `{{provider:skills_root}}/dev/SKILL.md` and resume the router from the next stage (Test).
