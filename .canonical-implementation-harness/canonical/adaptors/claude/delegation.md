# Delegation

Use the session's exposed delegation mechanism with the installed role definition.
A role name in prose is not a tool call. Respect host authorization and concurrency
limits. Give each worker explicit inputs, output paths, scope and evidence requirements.
The orchestrator owns shared reports and validates returned outputs.

If a worker cannot spawn a reviewer, return to the orchestrator, which dispatches
the independent reviewer. Do not replace independent review with an unlabelled
self-review. If independent review is unavailable, record it as incomplete and obtain
an explicit human review or exception at the existing review gate.

For docs-writer authoring only, when delegation is unavailable or prohibited, the
orchestrator may apply the installed docs-writer role inline, record this fallback,
and verify the written artifact against its conventions. This is not independent review.
