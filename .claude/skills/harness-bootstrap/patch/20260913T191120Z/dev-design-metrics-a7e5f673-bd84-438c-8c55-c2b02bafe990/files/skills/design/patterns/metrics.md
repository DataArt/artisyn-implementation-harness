# Design metrics

The orchestrator owns `design/stat.json`, beside `design/Report.md`. Use the Node.js
CLI at `.claude/skills/design/scripts/design-metrics.mjs` for every mutation; never
hand-edit JSON, infer completion from artifacts, estimate tokens, or sum worker time.
Node.js 22+ is required; there are no dependencies. Every command takes explicit
`--dir "$DESIGN_DIR"`, where DESIGN_DIR is the current story's **design directory**.
Dev uses a separate impl directory and recorder; the CLIs reject lifecycle mismatches.

## Initialization and recovery

Once Frame creates the design directory and Report.md:

```sh
node .claude/skills/design/scripts/design-metrics.mjs init --dir "$DESIGN_DIR" --ticket "$TICKET"
node .claude/skills/design/scripts/design-metrics.mjs stage start --dir "$DESIGN_DIR" --stage frame
```

Use a stable story identifier for free-form designs without a tracker key. For direct
stage entry or existing designs without metrics, add `--coverage partial` to init.
Never recreate an existing stat.json or invent earlier stages. Optional
`--created-at <UTC timestamp> --source <tracker field or attributed statement>` sets
known ticket creation; unavailable creation and lead time remain null. An existing
init is safe to repeat with the same ticket; it preserves the original coverage.

On session resume or after compaction, run `recover` before recording new work.
Interrupted work ends at its last checkpoint; the unobserved gap stays unclassified.
Explicit approval waits survive session gaps until resumed. A persisted running check
becomes `interrupted`; it cannot serve as passing evidence. If a stale lock remains,
verify its PID is no longer running before removing `.design-metrics.lock`. Never remove a live writer's lock.

Resume an active stage with `resume --activity <activity>`, not a retry. Use
`stage start` only for a pending stage; `stage retry` explicitly revisits prior work.
Do not start a second stage while another is active. For a requested jump, checkpoint
and record a wait while clarifying the disposition of unfinished work; never mark
unfinished work complete merely to enable a transition.

## Boundaries and commands

All arguments below follow `node .claude/skills/design/scripts/design-metrics.mjs`
and include `--dir "$DESIGN_DIR"`:

| Boundary                                     | Arguments                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| Enter a stage                                | `stage start --stage <stage>`                                               |
| Checkpoint after long work / before yielding | `checkpoint`                                                                |
| Approval or commit confirmation wait         | `wait start --reason approval --detail "Awaiting design approval"`          |
| Missing developer input                      | `wait start --reason user_input --detail "Awaiting scope answer"`           |
| External blocker                             | `wait start --reason external_dependency --detail "Awaiting source access"` |
| Environment blocker                          | `wait start --reason environment --detail "Verification unavailable"`       |
| Resume observed work                         | `resume --activity review`                                                  |
| Rework within current stage                  | `stage retry --stage <stage> --reason review_feedback`                      |
| Complete observed stage work                 | `stage complete --stage <stage>`                                            |
| Refresh generated report block               | `report`                                                                    |
| Validate records                             | `validate`                                                                  |

Stage IDs: `frame`, `research`, `evaluate`, `solution`, `review-gate`,
`address-feedback`, `publish`. Default activities are planning, investigation,
review, documentation, review, review, and documentation respectively. Other allowed
activities are implementation and verification. Retry reasons: review_feedback,
verification_failure, scope_change, reopened.

Record waits and run report **before** every hard stop, including IDE review, commit
confirmation, compaction approval, and the out-of-band MR review. On the reply,
resume work. Keep the current stage open through its boundary approval; then complete
it and start the next stage. Direct-stage completion closes that stage only, not the
whole design. Checkpoint after long delegated work, not after every tool call.
Tool and agent latency is observed wall time, never CPU time or human effort.

Design tracks stages, not implementation steps: leave `steps` empty. WBS tasks in
solution/Efforts.md are future implementation scope; do not turn them into completed
design metrics steps. During a correction that follows an earlier stage's reference,
retain the owning active stage for metrics. Record the target artifact/reference in
Report.md notes. The earlier reference's entry/exit metrics do not apply when used
only as a correction recipe. Explicitly retry the owning stage to label revision work.

## Review gate and feedback

When the MR is opened, record an approval wait and report before ending the session.
After confirmed approval or concerns, resume and record the actual outcome:

```sh
node .claude/skills/design/scripts/design-metrics.mjs check record --dir "$DESIGN_DIR" \
  --id gate-round-01 --kind acceptance --name "Design approval" \
  --result passed --source "developer confirmation" --evidence "MR URL and confirmed approval"
```

Use `failed` when concerns were raised. Evidence must be observed and attributed;
never infer approval from file presence or lack of comments. Use a new event ID per
actual review round; replaying the same ID deduplicates the record.

If approved without concerns, while Review Gate remains active:

```sh
node .claude/skills/design/scripts/design-metrics.mjs stage skip --dir "$DESIGN_DIR" \
  --stage address-feedback --reason no_concerns --evidence "Confirmed MR approval"
```

Only an unstarted Address Feedback stage may be skipped and only after recorded
approval. A skip has no fabricated attempt or work duration. After the boundary wait
is resolved, complete Review Gate and enter Publish.

If concerns were raised, complete Review Gate once its outcome and transition are
confirmed, then start Address Feedback. Its first attempt is automatically rework.
Execute the agreed earlier-stage correction recipe within this metrics stage. Record
an approval wait before asking for re-approval. On another concern, record a failed
Design approval check, then `stage retry --stage address-feedback --reason review_feedback`.
On approval, record a passed Design approval check before completing the stage.

Every explicit design retry invalidates prior approval. Revisions after publication
return Publish to pending while preserving its earlier attempts. Publish completion
requires approval for the current revision and passing latest results for all named
checks recorded in that revision, including on direct-stage entry. A direct
Publish entry may record already-observed approval from the MR/Report with attribution;
do not invent earlier stage execution. If a previously skipped feedback stage becomes
necessary, retry Review Gate first: it restores Feedback to pending and retains skip
history. Reopening work also clears design completion.

## Automated and other review checks

Wrap only already-authorized finite verification commands:

```sh
node .claude/skills/design/scripts/design-metrics.mjs check --dir "$DESIGN_DIR" \
  --id docs-check-01 --kind test --name "Documentation checks" -- <executable> <arguments>
```

Kinds: build, test, lint, typecheck, acceptance. Use `check record` for actual architect,
WAF, quality-gate, or developer reviews, with a stable name and evidence reference.
Results are passed, failed, error, cancelled; running/interrupted are recorder-owned.
Checks are persisted before execution and checkpointed once per second. Exit codes
are forwarded; normal exits restore the previous work activity. Signals close work.
Arguments and output are not stored. After interruption, recover and rerun with a new
ID; an old passing check does not resolve the interrupted run. Use the same check name.

Existing workflow permission gates still apply. Do not allowlist the whole recorder
or `check *`, because it can execute arbitrary programs. Narrow recording rules can
cover individual subcommands, such as `Bash(node .claude/skills/design/scripts/design-metrics.mjs checkpoint *)`
and `Bash(node .claude/skills/design/scripts/design-metrics.mjs check record *)`.
Keep executable checks subject to normal command approval.

## Usage and reporting

`usage --file <sample.json>` accepts only actual runtime-provided, non-overlapping,
ticket-scoped deltas: sample_id, source, session_id, scope (`ticket`), measurement
(`delta`), input_tokens, output_tokens. Unknown counters are null. Identity deduplicates
replays; cumulative/session totals, estimates, and double-counted worker usage are not
supported. Design and dev samples must be disjoint. Coverage remains partial whenever
samples are imported; per-stage tokens stay unavailable rather than allocating totals.

`report` updates only its marker block in Report.md, preserving context, State, Gate,
WAF findings, and human notes. It lists all seven stages, statuses, timing, attempts,
and failed checks. Totals include observed work/wait, open intervals, unclassified
time, rework, blockers, approval waits, and token subtotals in stat.json. First-pass
verification rate uses stages with pass/fail evidence: each named check's first run
must have passed. This is provisional until reviews are finished. Human effort is
not inferred. `templates/stat.schema.json` defines the design profile of v2.

## Publish and completion

Keep Publish active through permanent-doc updates, archive, commit confirmation,
and required tracker sync. When archiving, move stat.json with the design directory
and update DESIGN_DIR before further commands. Do not merge its metrics into impl.
After all required design work succeeds, run `stage complete --stage publish`, then
`complete`, then `report`. Full-flow completion requires all seven stages completed
or the authorized Feedback skip; partial runs leave unseen stages pending. A direct
non-Publish invocation never finalizes design completion. Finalize before invoking
`/dev` so implementation time is not charged to design.

The CLI is self-contained within this flow. `scripts/constants.mjs` owns lifecycle
IDs, filenames, report markers, and activity/reason values. `scripts/utils.mjs` owns validation primitives, timestamp/duration helpers, atomic
writes, and Markdown cell escaping. Bootstrap installs this flow's CLI, constants,
and utils together; no other flow or shared recorder is required.
Run this flow's regression suite after changes:

```sh
node --test .claude/skills/design/scripts/design-metrics.test.mjs
```
