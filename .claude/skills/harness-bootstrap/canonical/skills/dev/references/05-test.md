# Test stage

Apply `{{provider:skills_root}}/dev/patterns/metrics.md`; this stage's metrics unit is
`--stage test`. Wrap authorized automated verification commands with
`check --kind <kind> --name <name> -- <command>` to capture actual exit status.

Routing and stage tracking live in `{{provider:skills_root}}/dev/SKILL.md`. This stage runs
the test suite and PR review for an implemented plan.

Apply `patterns/approval-sign-off.md`: follow dependencies, continue routine authorized work,
and pause only for a concrete unresolved decision, required human verification, or a
fixed sign-off gate (`patterns/approval-sign-off.md`).

> 🔁 **Session continuity:** apply `{{provider:skills_root}}/dev/patterns/session-continuity.md`.

## Step 1 — Find the implementation folder

The argument is a ticket number (e.g. `{{PROJECT_KEY}}-042`) or a direct folder path.

- If a ticket number: look for `docs/Stories/*{TICKET}*/impl/` (use `*{TICKET}*` wildcard — never `[{TICKET}]*`, square brackets are glob metacharacters)
- Read `1-plan.md` to understand what was built and which layers were touched
- Read `2-report.md` to understand what was already noted during implementation
- If not found: tell the developer and stop

## Step 2 — Advance phase to Test

Update the `Phase` row in `2-report.md`:

```
🎯 Context ✅ · 🚀 Ceremony ✅ · 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test 🔄 · 📝 Document ⏳
```

## Step 3 — Build check

Run whichever check(s) actually make sense for what the plan touched — same scope
rule as Step 7's verification gate; do not run one, then re-derive the other's
answer independently. Most tickets touch one side and need only that check; a
mixed-scope ticket (both infra and app code) may reasonably need both.

Inspect available project targets and run authorized checks for the changed scope:
`{{INFRA_SYNTH_CMD}}` for relevant infra, `{{NX_BUILD_CMD}}` for app code when those
commands exist in this project. Use the metrics wrapper. Never assume a test/lint
suite or pre-commit hook exists. For guarded or inaccessible checks, present the exact
command and request its result. Diagnose/fix in-scope failures before review proceeds.

## Step 4 — DB migration check _(skip if no DB changes in this plan)_

If `1-plan.md` includes any DB layer steps (new migrations, schema changes, seed changes), prompt the developer:

> "This plan includes DB changes. Do you want to run migrations against the dev environment now? (**yes** / **skip**)"

**Stop and wait for confirmation.** If confirmed, ask the developer to run:

> ```bash
> {{NX_DB_MIGRATE_CMD}}
> ```

Report the result. If it fails, treat it as a blocker — diagnose before continuing.

## Step 5 — PR Review

Run the PR review **before** the test suite so that must-fix changes are included in the validation run.

**Component delegation** — match changed paths to the Agents table in
`{{provider:instructions_file}}` and installed role scopes. Delegate each touched
component's focused convention review to its actual specialist using
runtime/delegation.md. Review unmatched scope inline; resolve ambiguous ownership
explicitly. Preserve independent architecture review where required below.

**@architect audit** — spawn `@architect` before recording PR review findings when any of the following apply:

- The plan changes infrastructure topology or boundaries (new resource type, new network path/exposure, new service, a removal-policy or IAM change) — not a routine like-for-like addition within an existing, already-reviewed pattern (e.g. one more container in an existing, already-audited Cosmos account)
- The plan introduces a new cross-layer integration (e.g. new backend endpoint consumed by frontend, new auth flow, new queue/event contract)
- The plan contains non-trivial flows that span more than one container

Prompt template:

> "Read `docs/Target Architecture (HLD)/README.md` to find the active version. Audit the following implementation against HLD container boundaries, data-flow direction, and NFRs (read `docs/Target Architecture (HLD)/README.md` to find the active version, then read `docs/Target Architecture (HLD)/{active-version}/Non-Functional Concerns/Requirements.md`). Also check layer-specific best practices (infrastructure: naming, removal policies, security rules, IAM least-privilege; backend: N+1 queries, p95 < 200ms patterns; frontend: accessibility). Files to review: `<list from plan>`. One finding per line with BUG/DESIGN/IMPROVE code." **Do not write or edit any files — return output only.**

Classify each finding using triage discipline before upserting it in Review Findings. Skip for purely mechanical or single-layer changes with no cross-cutting impact.

**Architecture note** — if anything structural changed (new module, new layer pattern, new cross-layer interaction), create `{story-folder}/impl/architecture-notes.md` with a brief description and a Mermaid diagram. Skip this file if nothing structural changed.

Apply `patterns/review-gate.md`: upsert findings in `## Review Findings` with origin
`pr-review` and stage `test` for first discoveries. Use impact severity independently
of classification and required action. Reuse prior RF IDs for repeat findings; record
PR coverage and verdict in prose even when no issues were found. Normal pending LLD
updates belong in Documentation. Never add a separate PR Review findings table.

After updating the findings, check the findings for patterns worth encoding as skills:

- If there are any `bug`, `security`, `design` or `deviation` findings that represent a **repeatable mistake** (not a one-off typo) — something that a skill or rule could prevent in future — say:

  > "This review found `{X}` pattern findings that look like a repeatable convention gap. Consider running `{{provider:invoke:evolve}} reflect` with a short description so it can be encoded as a skill."

  Name the specific patterns briefly. Do not prompt this if all findings are `improve`-only or `No findings`.

## Step 6 — Resolve PR review findings

Apply `patterns/review-gate.md` and `patterns/do-report-commit.md`. Fix and verify
in-scope regressions without per-fix approvals. Batch only the unresolved human
decisions, and preserve actual resolution/verification evidence in the ledger.

## Step 7 — Run checks matching the change

Run existing checks for affected projects and dependents where relevant. Infra-only
changes use `{{INFRA_SYNTH_CMD}}` and `{{INFRA_DIFF_CMD}}` where applicable; app changes
use their actual build/typecheck/test/lint targets. Reuse successful checks on unchanged
inputs; rerun affected checks after fixes. Do not invent missing targets or imply a
skipped suite passed. Follow project guarded-command rules for live actions.

Capture actual outcomes with the metrics wrapper, and preserve runner output as test
case count evidence. A failed command is one failed run, not one failing test case.

## Step 8 — Failure triage

For any project that fails, do not just record `❌` — diagnose:

- **Type error** — identify the file and line; suggest the fix or flag as a blocker
- **Failing assertion** — identify the test and what changed; determine if it's a stale test or a real regression
- **Lint error** — identify the rule and file; most are auto-fixable with `yarn nx run {project}:lint --fix`
- **Missing env / config** — identify the missing variable or misconfiguration

Record the diagnosis and fix in-scope failures. Ask only when the fix requires a new scope/risk decision or inaccessible verification.

## Step 9 — Acceptance criteria validation

Read the `## Acceptance Criteria` checklist from `1-plan.md`. For each item, determine whether it passed or failed based on:

- The test/build output from Step 7
- Any explicit verification instructions in the plan steps
- Ask the developer to perform any manual checks that cannot be inferred from output alone

Record each AC result and its evidence. Ask for specific required manual checks
that cannot be performed with available access; do not ask a general "anything else?"
question. Unresolved or failing required ACs block completion. Record optional test
suggestions without turning them into a new approval gate.

## Step 9b — Test evidence and coverage

Update the existing Test Results table to the latest run for each non-overlapping
project/suite scope. Record Written (new test cases from the diff), Passed, Failed,
Skipped (latest runner counts), and Evidence. Unknown counts are `unavailable`, not
zero. Modified tests are not newly written cases. Retain historic failures in metrics
checks; do not sum suite reruns as additional cases. Note absent suites and skipped
checks explicitly. No suite means no measured case count, unless zero new cases is
independently verified from the diff.

## Step 10 — Update `2-report.md`

For each step row in the `## Progress` table, fill in the **Test** column:

- `✅` — all applicable required checks passed for the changed scope
- `❌` — one or more checks failed (add a brief note in the Notes column)
- `—` — not applicable (e.g. infra-only step with no runnable tests)

Update (do not append another copy of) `## Test Results` using
`templates/report.md`. Check that numeric counts have evidence. Refresh metrics with
`report`; its quality block counts findings, debt and cases without replacing timing.

## Step 11 — Report back

Tell the developer:

- Overall pass/fail summary
- Any failures diagnosed and their suggested resolution
- Whether migration was run and what the outcome was
- PR review verdict and any must-fix items

🔁 Re-read `{{provider:skills_root}}/dev/SKILL.md` and resume the router from the next stage (Document).
