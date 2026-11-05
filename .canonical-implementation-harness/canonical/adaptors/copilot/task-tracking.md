# Progress in Copilot

Use the durable workflow report as the authoritative stage tracker. Create one row
per shared work unit, enforce dependency order, mark the first pending row In
progress before starting it, and mark Complete only after verifying its evidence.
Update the report at every stage boundary and immediately after a concrete blocker.

If this session exposes a permitted native TODO tracker, mirror the same stages
and evidence there. Inspect the available tool schema before assuming a native
task tracker exists. Record the selected mechanism
once; report/checklist tracking is sufficient when no native tracker is available.
Do not use plan mode, autopilot, or a Goal as a substitute for stage tracking.
