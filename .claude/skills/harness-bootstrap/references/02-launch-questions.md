# Launch questions

This is the authoritative editable checklist for launch task 3, **Knowns and plan**.
The [launch guide](01-launch.md#2-resolve-knowns-and-write-the-plan) owns execution,
answer persistence, and plan validation. Keep question keys stable because reports
and `answers.json` use them; add new keys instead of renumbering existing ones.

Resolve each applicable question from project evidence and saved answers first; ask
the user only for missing decisions or conflicting information. Record why a
conditional question is inapplicable. Copy the exact checklist wording into each
answer's `question` field and the report's Question column when resolving it. Keep
project answers out of this canonical file.

| Key  | Required knowns and selection rules                                                                                                                                                                                                                                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q1   | Project purpose and why it exists                                                                                                                                                                                                                                                                                                                            |
| Q2   | Languages, frameworks, runtime, datastore, cloud; propose from config                                                                                                                                                                                                                                                                                        |
| Q3   | Named containers/layers; drives `CONTAINER_LIST` and specialist scope                                                                                                                                                                                                                                                                                        |
| Q4   | Primary data flow and integrations                                                                                                                                                                                                                                                                                                                           |
| Q5   | Tracker (Jira/Linear/GitHub Issues/none); ticket prefix, tracker URL, optional Confluence/board details. Resolve actual ticket prefix separately from board URL parameters; never guess IDs                                                                                                                                                                  |
| Q6   | Claude Code/Codex CLI/Cursor/Kiro/Windsurf/multiple; select installation paths and exactly one project instruction destination (Claude Code: CLAUDE.md; Codex: AGENTS.md). For multiple providers, confirm one primary provider and record secondary-provider discovery limitations; do not generate both root files                                         |
| Q7   | Commit format, branch naming, build/check commands, guarded commands                                                                                                                                                                                                                                                                                         |
| Q8   | Confirmed NFR targets: availability, latency, residency, accessibility, cost, etc.; research applicable benchmarks and propose missing targets with sources and measurement conditions; confirm the target set before publishing NFRs. Record sizing workload/scenario assumptions here as well; unresolved proposals stay in the external run/design record |
| Q9   | Team, pace, risks, other constraints                                                                                                                                                                                                                                                                                                                         |
| Q10  | Enabled Dev/Design/Skill/Architecture lifecycles; default all, Dev required                                                                                                                                                                                                                                                                                  |
| Q10b | If Design: Project-scoped (default), Product-context-scoped, or Two-track; propose from detected shared docs                                                                                                                                                                                                                                                 |
| Q10c | If Product-context or Two-track: shared folder under `project:docs/`; propose detected name or `Product Context`                                                                                                                                                                                                                                             |
| Q11  | Azure/AWS/GCP/custom WAF with explicit pillars, or None; governs assessments and NFR output                                                                                                                                                                                                                                                                  |

Resolve Q10b/c consistently through `package:canonical/skills/design/INTENT.md` and each
selected skill's INTENT. Two-track preserves its declared runtime destination/agent
tokens and installs `design/pattern-context-resolution.md`; single-track omits it.
