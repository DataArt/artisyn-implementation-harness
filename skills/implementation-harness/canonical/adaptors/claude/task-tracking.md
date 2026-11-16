# Progress in Claude

Inspect `TaskList` first and reuse this run's tasks when present. Otherwise use
`TaskCreate` to create one task per shared work unit, prefix each subject with the
run ID, and connect prerequisite task IDs with `addBlockedBy` when supported.
Use `TaskUpdate` to mark a task in progress before beginning and completed only
after verifying its completion evidence. Mirror each transition and evidence in
the durable launch report before starting the next unit.

If Claude Task tools are unavailable, use `TodoWrite` if exposed; otherwise use the
report as the tracker. For report-only tracking, update each row before and after
the stage and do not leave completed stages pending while doing later work. Keep
failed units in progress with failure evidence, enforce ordering if the selected
tracker has no dependency support, and reconcile against the report after interruption.
