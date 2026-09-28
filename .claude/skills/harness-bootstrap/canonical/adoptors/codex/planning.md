# Planning in Codex

Respect the active host mode. When native Plan mode is active, explore and present
the proposal using its permitted output mechanism; do not write project files if
the mode forbids it. Mode changes may be host/user-controlled: never invent
EnterPlanMode/ExitPlanMode calls or claim that updating a progress plan changes mode.

If native Plan mode is unavailable or inactive and the host does not expose an
authorized mode switch, perform planning only without implementation. Present a
reviewable proposal and obtain explicit approval through the interaction procedure.
State that this procedure does not activate native write restrictions.

Persist the identical approved content at the workflow's project plan path only
when writes are allowed. If the host still restricts writes, leave persistence
pending until the mode changes. Do not start implementation before all sign-offs.
