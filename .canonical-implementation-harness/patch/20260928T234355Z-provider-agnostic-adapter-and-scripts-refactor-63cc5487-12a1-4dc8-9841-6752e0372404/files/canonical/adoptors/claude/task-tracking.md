# Progress in Claude

Inspect exposed tools first. Use TaskCreate/TaskUpdate/TaskList when available,
reusing tasks for this run and mapping dependency IDs from the shared work units.
Otherwise use TodoWrite if exposed, or the durable report alone. Enforce dependency
order yourself when the selected tracker has no dependency support.
Keep failed units in progress with failure evidence in the report; do not invent
unsupported native statuses. Reconcile against the report after interruption.
