# Delegation in Copilot

Installed specialists live in `.github/agents/<name>.agent.md`. Use an exposed,
authorized delegation tool (normally `task`) with the installed agent's identity
and the tool's actual schema. The host selects the session agent; mentioning a role
or writing `@name` is not proof a subagent was invoked.
Do not start a separate host process to simulate an unavailable delegation tool.

Where the host supports them, generated specialists use `include-custom-instructions: true`
so delegated work receives the repository conventions, and `strict-tools-list: true`
with an explicit tool list. Verify each key for the host. Tool availability does not
grant execution approval or filesystem scope.
Give each worker explicit inputs, disjoint output paths, scope and evidence. The
orchestrator owns shared reports and verifies returned files. Never enable fleet
mode, auto-delegation or extra permissions merely to satisfy an instruction.

For docs-writer authoring only, if delegation is unavailable or prohibited, apply
the installed role inline and record the fallback. This is not independent review.
If independent review is unavailable, report it as pending for human review or
an explicitly authorized exception at the workflow's existing gate.
