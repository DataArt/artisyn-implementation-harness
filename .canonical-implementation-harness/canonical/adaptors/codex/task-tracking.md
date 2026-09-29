# Progress in Codex

Use Codex's native `update_plan` TODO tool when it is exposed and permitted. Create
one plan item per shared work unit, then update it to `in_progress` before starting
the unit and `completed` only after verifying its completion evidence. Update the
plan after each transition; the tool supports `pending`, `in_progress`, and
`completed`, but has no dependency graph, so enforce stage order yourself. Mirror
every transition and its evidence in the durable launch report.

If `update_plan` is not exposed, use the report as the tracker. Before beginning a
stage, change its row to `In progress`; after verifying its outputs, mark it
`Complete` and record concrete evidence before starting the next stage. Update the
report after each stage boundary and immediately after recording a blocker. Do not
leave several finished stages marked pending while doing later-stage work.

Do not substitute `/plan` mode or a persistent Goal for the stage tracker. Record
failures and blocked dependencies in the report. Updating progress does not approve
work or change the plan's authorization boundaries.
