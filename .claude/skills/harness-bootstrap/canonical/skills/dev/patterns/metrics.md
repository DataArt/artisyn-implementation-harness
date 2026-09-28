# Dev metrics

The orchestrator uses the dependency-free Node.js CLI in `scripts/timing.mjs`
(relative to this dev skill). Only the orchestrator writes metrics. Never hand-edit
`stat.json`, derive durations in prose, estimate tokens, sum worker wall times, or
infer stage/step completion from file presence — record only observed transitions.
Requires Node.js 22 or newer. Every command requires `--dir` pointing to the ticket's
existing `impl` directory; there is no implicit current ticket.

If configuring automatic permission for recording commands, use subcommand-specific
rules with the subcommand immediately after the script path, for example:

- `Bash(node {{provider:skills_root}}/dev/scripts/timing.mjs checkpoint *)`
- `Bash(node {{provider:skills_root}}/dev/scripts/timing.mjs stage *)`
- `Bash(node {{provider:skills_root}}/dev/scripts/timing.mjs check record *)`

The same narrow pattern can cover `init`, `step`, `wait`, `resume`, `recover`,
`report`, `validate`, `usage`, `quality`, and `complete`. Never allowlist the entire script or
`check *`: executable checks can launch arbitrary programs. Keep `check -- ...`
subject to normal command approval. Replace any previous whole-script wildcard rule;
adding narrow rules alongside it does not remove the broad permission.

## Initialize and resume

Once Context creates the impl directory and report, run:

```sh
node {{provider:skills_root}}/dev/scripts/timing.mjs init --dir "$IMPL_DIR" --ticket "$TICKET" --author "$(git config user.name)"
```

For direct-stage entry or an existing ticket without metrics, add `--coverage partial`.
Do not backfill unseen activity. Optionally provide `--created-at <UTC timestamp>`
and `--source <tracker field or attributed user statement>` when already known.
`--author` is the same `git config user.name` value already used for `2-report.md`'s
header table — reuse it rather than asking again; omit if unavailable.
The script rejects future creation timestamps. Repeated init preserves existing data
and requires the same ticket. `templates/stat.json` illustrates the v2 shape; do not
copy its null tracking timestamp in place of running init.

At session resume, run `recover --dir "$IMPL_DIR"` **before** start, resume, or checkpoint.
It closes interrupted work at its last checkpoint, leaving the session gap unclassified.
Checks are persisted as `running` before execution. Recovery marks unfinished checks
`interrupted` at their last checkpoint; they block step completion until a fresh
passing run of the same named check is recorded. Use a new event ID for that rerun.
Other mutations reject unrecovered running checks; report and validate remain available.
It preserves an explicit wait until `resume` closes it. Inspect existing state; ordinary
resumption does not create another attempt. A stale `.dev-metrics.lock` requires checking
that its recorded PID is no longer running before removing that lock. Never remove a
live writer's lock. Unsupported schema versions fail without modifying the file; migrate
old records explicitly with preserved originals rather than recreating their history.

## Stage and step transitions

The commands below all use the same script and require `--dir "$IMPL_DIR"`:

| Boundary                                  | Command arguments                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| Stage entry                               | `stage start --stage context` (or `ceremony`, `plan`, `implement`, `test`, `document`)      |
| Add an approved plan step                 | `step add --id step-01 --title "Implement feature" --order 1 --plan-ref "1-plan.md#step-1"` |
| Optional dependencies                     | Add `--depends-on step-01,step-02`; referenced steps must already exist                     |
| Implementation step entry                 | `step start --id step-01 --activity implementation`                                         |
| After long-running work / before yielding | `checkpoint`                                                                                |
| Change activity / resume a wait           | `resume --activity verification`                                                            |
| Before asking approval                    | `wait start --reason approval --detail "Awaiting plan approval"`                            |
| Before asking for verification            | `wait start --reason user_input --detail "Awaiting step acceptance"`                        |
| External blocker                          | `wait start --reason external_dependency --detail "Awaiting API access"`                    |
| Environment blocker                       | `wait start --reason environment --detail "Build environment unavailable"`                  |
| Revise a failed step                      | `step retry --id step-01 --reason verification_failure`                                     |
| Verified step completion                  | `step complete --id step-01`                                                                |
| Stage completion                          | `stage complete --stage implement`                                                          |
| Revisit a stage                           | `stage retry --stage plan --reason scope_change`                                            |
| Refresh report metrics                    | `report`                                                                                    |
| Validate stored records                   | `validate`                                                                                  |

Activities: `investigation`, `planning`, `implementation`, `verification`, `review`,
`documentation`. Retry reasons: `verification_failure`, `review_feedback`,
`scope_change`, `reopened`. Finish the current step before leaving Implement, and
finish the current stage before entering another. Add steps in dependency order.
Stable step IDs survive plan reordering. Conflicting repeated definitions fail;
this version does not support editing/removing approved step definitions.

Start/resume closes the previous interval automatically. Repeating a start or wait
with the same context is a checkpoint, not a new attempt. Call checkpoint before
yielding without a known wait reason and after long-running operations (delegated
worker runs, large builds) — not after every tool call. Recovery bounds observed work
at the last checkpoint, so sparse checkpoints only grow unclassified time; they never
corrupt state. Tool execution and worker latency count as observed work wall time,
not CPU time or human effort.

At a stage approval boundary, record wait **before** yielding. On the reply, resume,
complete the old stage, then start the next one. Do not prematurely complete the stage
and then try to attach a wait to its closed attempt. Run report before hard stops;
never write while waiting for the developer. Existing workflow permission gates still
apply: recording a transition does not authorize the underlying action.

## Verification evidence

Wrap an already authorized verification command without using a shell:

```sh
node {{provider:skills_root}}/dev/scripts/timing.mjs check --dir "$IMPL_DIR" \
  --id step-01-typecheck-run-01 --kind typecheck --name "Frontend typecheck" \
  -- yarn nx run frontline-report:typecheck
```

Adapt the executable to this project's actual checks. The wrapper forwards output,
returns the child exit code, checkpoints once per second, and records exit status.
After ordinary success, failure, or a spawn error, it restores the preceding work
activity (or verification if there was no work interval). Subsequent checkpoints
therefore continue recording work; no extra resume command is required. A termination
signal closes work without restarting it.
It does not store arguments or output, which may contain secrets. It holds the writer
lock while running, so concurrent mutations fail. A spawn error records `error`, a
signal records `cancelled`, and a nonzero exit records `failed`; a nonzero code alone
cannot establish whether assertions or the environment caused failure. Existing
command restrictions and tool approval requirements apply equally to wrapped commands;
never use the wrapper to bypass them. Avoid shell commands or indefinite servers.

For an actual developer confirmation or an externally executed check:

```sh
node {{provider:skills_root}}/dev/scripts/timing.mjs check record --dir "$IMPL_DIR" \
  --id step-01-acceptance-01 --kind acceptance --name "Plan acceptance" \
  --result passed --source developer --evidence "Developer confirmed the plan's checks passed"
```

**`--source developer` requires an actual developer reply to attribute.** `--source`
is free text the script does not validate — nothing technical stops writing
`developer` for a check you ran yourself. Using it that way is not a shortcut, it is
fabricating sign-off: the record then falsely tells everyone downstream (`2-report.md`,
the developer on resume, a future auditor) that a human confirmed something no human
ever saw. Only record `--source developer` when the developer's own message in this
conversation is what you are quoting or summarizing as `--evidence`; if no such reply
exists yet, the check has not happened yet — do not record it, do not mark the step
Done or complete, and do not invent evidence text to fill the gap. A check you ran
yourself (typecheck, build, browser walkthrough, anything) is recorded with a source
that says so (e.g. `--source self` or `--source orchestrator`), never `developer`,
regardless of how confident you are in the result — confidence is not attribution.
If you notice you've already recorded a fabricated `--source developer` entry,
correct it immediately with a new event under a new ID and reopen the step rather
than leaving the false record standing until asked about it.

Kinds: `build`, `test`, `lint`, `typecheck`, `acceptance`. Manual results also accept
`failed`, `error`, `cancelled`. `running` and `interrupted` are recorder-owned
results, not manual assertions. Manual timestamps record when evidence was received,
not an invented execution duration. `--id` deduplicates a replay; use a **new** ID
for each real rerun. Never reuse an event ID for different work or different commands.
Each check automatically references the current stage and optional step attempt.
Step completion requires at least one check and passing latest results for every named
check in its current attempt. After a retry, verification must be recorded again.

## Runtime usage

`usage --file <sample.json>` accepts a runtime-provided sample:

```json
{
  "sample_id": "runtime-event-123",
  "source": "runtime-provider",
  "session_id": "session-456",
  "scope": "ticket",
  "measurement": "delta",
  "input_tokens": 123,
  "output_tokens": null
}
```

Only non-overlapping ticket-scoped deltas are supported in v2. Source/session/sample
identity deduplicates replays. Do not import session totals spanning other tickets,
cumulative counters, estimates, or worker usage already included in a parent sample.
The CLI validates structure but cannot independently verify a provider's attribution.
Unknown counters stay null; imported totals remain labeled partial. Step token usage
stays unavailable because this version does not allocate ticket usage to steps.

## Data contract and derived metrics

`templates/stat.schema.json` specifies v2. Stages are the six lifecycle units; steps
are stable approved implementation units. Each owns attempts with start/end, trigger,
and outcome. Intervals reference a stage attempt and optionally a step attempt;
only one orchestrator interval can be open and no intervals may overlap. `checks`
contains actual evidence, separate from time accounting. Unknown fields are retained.

`metrics` is a recalculated summary: closed observed work/wait, separately reported
open work/wait, unclassified time, rework (work on explicitly revised attempts),
blocked time, approval wait, failed check runs, first-pass verification rate, and
runtime token subtotals. First-pass rate considers steps with pass/fail evidence;
a step qualifies when the first recorded run of each named check passed. It is
provisional until verification is finished. Retries preserve the original evidence.

Lead time requires known ticket creation and completion; cycle time requires observed
start and completion. These stay null until their endpoints exist. Human effort is
never inferred. Completion requires Document finished and no active or pending steps;
full coverage also requires all six stages completed. Only run `complete` after all
required ticket completion work (including tracker sync when applicable) is actually
done, never merely because a direct stage ended. Reopening clears ticket completion
while preserving prior attempt history. Archive stat.json with the impl directory.

`report` updates only the generated marker block in `2-report.md`, preserving other
prose and historic rows. For an unmarked older report it appends a generated section.
Do not manually duplicate its rows or overwrite historic effort entries. Round display
values only; calculations retain seconds precision.

The CLI is self-contained within this flow. `scripts/timing.mjs` is the entrypoint —
stage/step/interval/check state, structural validation, and the generated Stage/Step
Metrics report sections. `scripts/quality.mjs` derives the report-sourced quality
inventory (Review Findings, Tech Debt, Test Results) that `timing.mjs` calls into for
`report` and `quality validate`. `scripts/constants.mjs` owns lifecycle IDs,
filenames, report markers, and activity/reason/finding values shared by both.
`scripts/utils.mjs` owns validation primitives, timestamp/duration helpers, atomic
writes, and Markdown cell escaping. Bootstrap installs all four together; no other
flow or shared recorder is required. Run this flow's regression suite after changes:

```sh
node --test {{provider:skills_root}}/dev/scripts/*.test.mjs
```

## Quality inventory

`report` parses the single Review Findings table, Tech Debt ledger and numerical
Test Results evidence into optional v2 `stat.json.quality`, then renders one summary
line beside Stage Metrics. It replaces the snapshot on every refresh; repeated report
runs never increment findings or test counts. IDs and source-table hash make the
snapshot traceable. Preserve kind, impact severity, classification, resolution,
deviation type, PR-origin subset, and linked debt as separate dimensions.

The table contract lives in `patterns/review-gate.md` and `templates/report.md`.
One underlying issue keeps one RF ID across reviews. A PR review counts unique RF
rows whose Origin includes `pr-review`, not review rounds or commits. Tech Debt counts
ledger entries and ticketed/unticketed disposition; it is not added to finding totals.
Tests Written counts new cases in the diff; Passed/Failed/Skipped are latest runner
case counts over non-overlapping scopes. Unknown source values stay null. Failed test
runs come from historical `checks` with kind `test`, independently of latest cases;
build/lint errors are not test failures. Counts are inventory, not a composite score
or a comparison between tickets with different review coverage.

Old v2 metrics without quality remain valid. Missing legacy table columns yield
unavailable evidence; do not backfill guesses or automatically rewrite historic reports.
Malformed canonical tables and duplicate IDs fail refresh rather than emit false counts.
Use `node --test {{provider:skills_root}}/dev/scripts/*.test.mjs` after recorder changes.

Before archive, run `quality validate --dir "$IMPL_DIR"` after `report`. This rejects
open findings, missing terminal evidence/TD ownership, latest failing case counts and
unresolved recorded checks. It checks structure; the orchestrator must still verify
AC coverage and the substance/authorization of each resolution. Review Findings must
exist for closure; explicitly consolidate legacy findings when resuming an old story.
