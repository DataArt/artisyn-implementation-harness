# Context and recovery

Persist the current phase, verified outputs, pending decisions and next action in
the workflow report before a handoff. On resume, read the report and verify its
artifacts; do not rely on a compaction summary containing a particular instruction.
Use host-supported context management when useful. If manual compaction is needed,
explain the supported host action; never pretend to execute a user slash command.
Compaction is optional and is not an approval or a phase-completion prerequisite.
