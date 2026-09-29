# Implement stage

Apply `{{provider:skills_root}}/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage implement`.

Routing and stage tracking live in `{{provider:skills_root}}/dev/SKILL.md`. This stage executes
the approved `1-plan.md` one step at a time.

Apply `patterns/approval-sign-off.md`: follow dependencies, continue routine authorized work,
and pause only for a concrete unresolved decision, required human verification, or a
fixed sign-off gate (`patterns/approval-sign-off.md`).

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/dev/patterns/session-continuity.md`.

## Step 1 — Find the plan

The argument is either a ticket number (e.g. `{{PROJECT_KEY}}-042`) or a direct path to a plan folder.

- If a ticket number: look for `docs/Stories/*{TICKET}*/impl/1-plan.md` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`, square brackets are glob metacharacters)
- If a path: read `1-plan.md` inside that folder
- If not found: tell the developer and stop

Read the full `1-plan.md` before doing anything. Also open `2-report.md` — this is where all notes, tech debt, and status will be written. **Never edit `1-plan.md`.**

Read open and accepted deviations in `## Review Findings`. For legacy plans,
import their exceptions once with source references; deduplicate against existing RF
rows. Do not change the immutable plan or copy a second live table into the report.

## Step 2 — Advance phase and track steps

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement 🔄 · 🧪 Test ⏳ · 📝 Document ⏳
```

Apply `{{provider:skills_root}}/dev/patterns/task-tracking.md` with the plan's numbered steps
as the unit list: one task per step, chained in plan order. This is in addition to
the stage-level Implement task the router already created — these are the child
units within it.

Announce the plan and step count, then start within existing authorization.

## Step 3 — Execute one step at a time

Before each step, match its actual target paths and responsibilities against the
Agents table in `{{provider:instructions_file}}` and the installed role definitions.
Use the specialist instantiated from the canonical `layer` template for the owning
component; there is no fixed frontend/backend/data routing list. Give it the full
step from `1-plan.md` and current `2-report.md`. Apply runtime/delegation.md; the
orchestrator owns verification and report updates.

If no specialist owns this scope, implement inline within authorization. Resolve
overlapping/ambiguous ownership before dispatch. For a cross-component step, assign
disjoint scopes to the relevant owners and coordinate shared contracts centrally.

> **Scope discipline:** implement exactly what the step describes — no more, no less. Do not add features, refactors, or improvements beyond what the step specifies.

For each step:

1. Register the approved step with `step add` (stable ID, title, order, plan reference), then `step start --id <ID>` and `report` per `patterns/metrics.md`. Mark the step's task `in_progress` (per `patterns/task-tracking.md`). Announce which step you are starting (e.g. "Starting Step 2 — <component>: <work unit>") and whether you are delegating or implementing inline
2. Implement (or delegate). Worker agents run a satellite review after non-trivial steps before returning (see `{{provider:skills_root}}/dev/patterns/satellite-review.md`). If a delegated worker already ran a check with real captured output as part of that review, treat it as existing evidence — do not blindly re-run the identical check yourself with no new information to gain. Re-run it yourself only for a concrete reason (the worker lacked the tool, the surface differs from the worker's sandbox, or the result looks suspect) — never as a reflexive duplicate of work already done and reported.
3. When the step is done — including any satellite review — you may run a
   non-guarded check yourself (build, typecheck, curl, `terraform validate`, etc.)
   as a debugging aid to catch obvious breakage before presenting, subject to the
   no-reflexive-duplicate rule above. This never substitutes for the verification
   gate itself: verification is a **developer confirmation gate**, not something
   self-certified because a command exited 0 in your sandbox. Your sandbox is not
   the developer's machine — tool availability, versions, and network behavior can
   differ, and a check that passed for you (or a worker) can still fail for them.
   Report back the actual validation performed — the exact commands run (yours or a
   worker's) and their real output/result, not a restated copy of the plan's
   instructions.

   Then compose the sign-off ask from what this step actually became, not a
   mechanical restatement of the plan's original verification text: drop an item the
   plan listed but that no longer applies (scope narrowed in a reasonable,
   already-noted way), add one the plan didn't anticipate (scope legitimately grew
   within the step), and explicitly name any point where the implementation diverged
   from the plan's description — never silently reconcile a real divergence by
   presenting it as if it matched. This changes _what's worth asking_, not _how much_:
   the ask must still let the developer meaningfully confirm everything this step
   actually did, and dropping an item still requires it to be genuinely inapplicable,
   not merely already run once by you or a worker — self-run evidence answers "did it
   pass in a sandbox," never "should the developer still confirm it" (see the HARD
   STOP below and `patterns/approval-sign-off.md`'s sign-off-gate completeness rule).

4. Close the work interval, record the verification wait and update the step metrics in
   `2-report.md` before yielding. **Stop and wait for the developer to confirm the step
   passes before continuing** — this stop happens regardless of how many checks you
   already ran yourself. Self-running available checks answers whether they passed in
   your sandbox; it never answers whether the developer signs off to proceed. A
   delegated worker lacking a tool (e.g. no Bash access) is never a reason for you to
   take the gate over yourself — hand back to the developer instead.

> ⛔ **HARD STOP — do not edit any file, do not update `2-report.md`, do not start the next step until the developer explicitly confirms verification passed.** This applies even when every available check was already run and passed in your own sandbox — self-run checks are reported, not silently treated as the developer's sign-off. This is doubly true for a UI/UX-visible change: a developer who says they want to look at it themselves (locally, in a browser) cannot be signed off on their behalf by your own automated pass, however thorough — that pass is evidence to report, not a substitute for their eyes.
>
> **Never record `check record --source developer` for a check you ran yourself, and never mark a step's Progress row ✅ Done or run `step complete` before the developer's actual reply exists in this conversation.** Fabricating that attribution — even with true-sounding evidence text — puts a false sign-off in the permanent record. If you catch yourself having already done this, correct it immediately (new event, new ID, re-source it honestly, reopen the step) rather than leaving it standing. See `patterns/metrics.md`'s `--source developer` rule for the full detail.

On reply, use `resume`, record the actual verification outcome with `check record` and
attributed evidence quoting or summarizing what the developer actually said — never
invented text. If it failed, use `step retry --id <ID> --reason verification_failure`
before revising; otherwise use `step complete --id <ID>` only after all current checks
pass. For TDD, record the initial failing run truthfully, then implement and rerun the
same named check within the step until green. Once verification passes, follow the
do → report → commit pattern (`patterns/do-report-commit.md`) — **update `2-report.md`
first, then present the commit message. In order:**

1. Update the step's row in the `## Progress` table of `2-report.md`:

   - Set Status to `✅ Done`
   - Add a short note in Notes (helps restore context if the session is interrupted)
   - Leave Test and Docs columns empty — filled by later phases

2. Add a `### Step N — {title}` entry at the **bottom** of the `## Implementation Notes` section for **every** step:

   - First try: a one-liner is enough ("went as planned")
   - Troubleshooting required: write a full incident record — initial error, each hypothesis tested and ruled out, root cause and fix. A terse note like "fixed and resolved" is **not acceptable** when there was a troubleshooting chain
   - Always add at the bottom; notes must stay in ascending step order (1 → 2 → 3 …)
   - When writing the **first** step note, remove the placeholder line (`_Added for every step…_`) before inserting `### Step 1`

3. Upsert the step's `## Step Metrics` row from `stat.json`, including observed time and available token evidence. Add the phase effort row with a link to that step; human time remains unreported unless supplied, and missing AI token usage is marked unavailable. Do not sum duplicate phase and step usage rows.

4. Mark the step's task `completed` (per `patterns/task-tracking.md`), verifying the completion evidence above rather than a worker's self-report alone. Present the commit message and progress announcement (`{{provider:skills_root}}/dev/patterns/announce-progress.md`):

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
   - Scope: the {{BUILD_UNIT_LABEL}} name or layer (`infra`, `auth`, `web`)
   - No body unless breaking change — then add `BREAKING CHANGE: <what and why>` as a footer
   - Examples: `feat(infra): provision managed identity and key vault` · `feat(auth): add basic auth header validation`

5. **Stop and wait for the developer to confirm the commit is done before starting the next step.**

> ⚠️ **Never commit yourself.** Do not run `git add` or `git commit`. This is
> specifically about staging and committing — it does not forbid other local, reversible
> git operations this stage or others already do directly (e.g. Document's `git mv`
> for local archival). Follow the project's guarded-command rules for anything else.

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

| #    | Description           | Type     | Tracker | Finding    | Owner             | Next action        |
| ---- | --------------------- | -------- | ------- | ---------- | ----------------- | ------------------ |
| TD-N | What and why deferred | `{type}` | —       | RF-ID or — | Responsible owner | Concrete next step |

Valid types: `blocker` · `dependency` · `cleanup` · `security` · `performance` · `ux`

## Step 6 — Handle failures

If the developer reports an error during verification:

- Diagnose the root cause before changing anything
- Fix only what is broken — do not refactor surrounding code
- Re-present the same verification instructions after the fix
- Do not move to the next step until the current one passes

## Step 7 — Completion

When all steps are verified, update `2-report.md`:

1. **Phase row** — `🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ⏳ · 📝 Document ⏳`. Do not set Status to Complete — that is done at the end of the Document phase.

2. **Progress table** — all rows should already reflect their final status. Do a final pass to confirm nothing is stale.

3. **Delivery Summary** — add only if the ticket warrants a human-readable summary (significant feature, complex refactor, or something a reviewer would benefit from reading). Skip for small or mechanical changes:

   ```markdown
   ## Delivery Summary

   <One short paragraph — what was built, what it enables, what changed for the user or system.>
   ```

   Insert between the Progress table and Implementation Notes.

4. **Tech Debt** — already populated during Steps 4–5. Add any final items discovered at wrap-up.

5. **TD triage** — flag debt that blocks acceptance criteria; it cannot be silently
   deferred. Keep unrelated debt in the ledger for Document's combined decision review.
   Any authorized scope addition needs an explicit plan addendum and new progress rows;
   preserve the original approved plan.

6. **Efforts Spent** — per-step rows were already added during implementation. Add one final summary row if useful (total session note, unexpected complexity).

Then tell the developer: "All steps complete. `2-report.md` updated."

🔁 Re-read `{{provider:skills_root}}/dev/SKILL.md` and resume the router from the next stage (Test).
