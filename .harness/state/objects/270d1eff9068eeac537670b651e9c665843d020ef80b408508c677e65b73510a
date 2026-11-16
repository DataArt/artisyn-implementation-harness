# Test stage

Apply `{{provider:skills_root}}/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage test`. First action: `stage start --stage test`. Wrap every command you run
with `check --kind <kind> --name <name> -- <command>`.

Routing and stage tracking live in `{{provider:skills_root}}/dev/SKILL.md`. This stage
proves the implementation: it runs, it is reviewed, the acceptance criteria hold.

Two stops in this stage: the sign-off in Step 5 (`patterns/phase-sign-off.md`) and the
commit in Step 7. Steps 2, 3 and 4 are intelligent checkpoints
(`patterns/approval-intelligent.md`): do it yourself, ask only for a guarded
command, access you lack, or something only the developer can see.

> 🔁 **After context compaction:** re-read this file and run metrics `recover`
> before recording anything (`patterns/session-continuity.md`). Fresh vs. resume was
> already decided by the router's entry check; do not redo completed work.

## Step 1 — Read

`$IMPL_DIR` comes from the router's entry check. If the `Phase` row does not show
Implement ✅, say which stage is still open and stop.

Read `1-plan.md` (what was built, which layers, the acceptance criteria) and
`2-report.md` (implementation notes, findings so far). Set the `Phase` row to
`🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test 🔄 · 📝 Document ⏳ · 🏁 Completion ⏳`.

## Step 2 — Make it run

In this order, using only targets the project actually has:

1. **Build** the changed scope: `{{INFRA_SYNTH_CMD}}` for infra, `{{NX_BUILD_CMD}}` for app code.
2. **Prerequisites** the plan introduced, so the change can be exercised: DB
   migrations or seeds (`{{NX_DB_MIGRATE_CMD}}`), queues, topics, blob containers, env
   vars, infra diff (`{{INFRA_DIFF_CMD}}`).
3. **Suites** for the affected projects and their dependents: typecheck, lint, unit,
   integration. The plan's Step 1 tests must be green now.

Intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approval
conditions, all required:

- Everything above was runnable here: not guarded, no missing access, and every
  environment action hits a local or disposable resource per the project's config,
  with nothing destructive
- All of it passed on the current worktree, with nothing unexpected in the output

All met → say in one line what ran and that it passed; continue. Otherwise:

- Failed → diagnose first (which file and line, stale test or real regression,
  which rule, which missing variable), fix in scope, rerun the same check, re-check
  the conditions.
- Guarded, shared environment, or no access → give the developer the exact command
  and its target, then `report` and a `wait start --reason user_input` naming the
  command. **Stop and wait.** Record their result with `check record` sourced
  `developer`, then re-check the conditions.

## Step 3 — Review

On a green build:

1. **Component review**: delegate each touched component to its specialist from the
   Agents table in `{{provider:instructions_file}}` (runtime/delegation.md); review
   the rest inline.
2. **Architecture audit**, only when the change moves infrastructure boundaries,
   adds a cross-layer integration, or spans more than one container: spawn
   `@architect` with the files from the plan, read-only, one finding per line against
   HLD boundaries, data flow, NFRs and layer practices.
3. **Record** every finding in `## Review Findings` (`patterns/review-gate.md`,
   origin `pr-review`, stage `test`). Coverage and verdict in prose even with none.
4. **Fix** in-scope regressions and routine convention findings, rerun the affected
   checks from Step 2, record the evidence in the RF rows.

Intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approval
conditions, all required:

- Every finding is `fixed` or ruled out with evidence; none is left `open`
- No fix changed scope, a contract, or behaviour the plan did not describe
- No `critical` or `high` finding was accepted or deferred, by anyone
- The affected checks pass again

All met → say in one line what was reviewed, how many findings, all closed; continue.
Otherwise the remaining findings need the developer now, not at the sign-off,
because the answer may change the code under test: present each open finding with
its options (fix / accept with rationale / tech-debt with owner), then `report` and a
`wait start --reason approval` naming the findings. **Stop and wait.** On the reply,
`resume --activity review`, record each decision in its RF row with attribution,
apply what was decided, rerun the affected checks, and re-check the conditions.

If something structural changed, add `impl/architecture-notes.md` with a short
description and a Mermaid diagram. If findings show a repeatable convention gap,
say so once and suggest `{{provider:invoke:evolve}} reflect <one line>`.

## Step 4 — Prove the acceptance criteria

For each AC in the plan: pass or fail, with evidence from Step 2, the plan's own
verification instructions, or your own inspection (`check record --source self`).

Intelligent-approval checkpoint (`patterns/approval-intelligent.md`). Auto-approval
conditions, all required:

- Every AC could be checked here: a command, a response, a file, a log, nothing
  that needs the developer's access, their machine, or their eyes
- Every AC passed, with its evidence recorded

All met → say in one line "N/N acceptance criteria pass" and continue. Otherwise:

- An AC failed → it is a regression or a gap. Fix in scope and rerun, or if the fix
  is out of scope, record it as `open` in Review Findings with the AC it blocks and
  ask the developer now; a failing required AC never reaches the sign-off as a surprise.
- An AC you cannot check yourself → give the developer the precise action (what to
  open, what to look for, what command), then `report` and a `wait start --reason
user_input` naming the ACs. **Stop and wait.** Record each answer with
  `check record` sourced `developer`, then re-check the conditions.

Then update `2-report.md`: the Test column per progress row (`✅` / `❌` with a note /
`—`), and the Test Results table (`templates/report.md` says how to count).

## Step 5 — Sign-off (rework if any)

Apply `patterns/phase-sign-off.md`. Present checks (what ran, result), review
(verdict, findings and how each was closed), and ACs (each with its evidence, and
who confirmed the manual ones).

> "Checks, review and acceptance criteria done. {Summary.} Good to move to Document,
> or what should change?"

`report`, then `wait start --reason approval --detail "Awaiting test sign-off"`.
**Stop and wait.** No reply, no next step. On approval, record the acceptance check
(`--name "Test sign-off"`, `--source developer`, their words as evidence); without
it `stage complete` is refused.

Rework: fix, rerun the affected checks, present again.

## Step 6 — Report

Confirm Step 4's rows are current, set the `Phase` row to
`🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document 🔄 · 🏁 Completion ⏳`,
then metrics `report`.

## Step 7 — Commit

One commit per review fix block (`fix(...)`, `test(...)`), then
`docs({ticket-lowercase}): record test results and review`.

Manual-operation sign-off (`patterns/approval-sign-off.md`): `wait start --reason
user_input --detail "Awaiting commit"`, **stop and wait**. On the reply, check
`git log`/`git status`; if something is missing, say what and wait again. Then
`stage complete --stage test`. Continue to Document.

🔁 Re-read `{{provider:skills_root}}/dev/SKILL.md` and resume the router from the next stage (Document).
