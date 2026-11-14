---
status: triaged
triaged: 2026-11-15T00:10:00Z
candidate: .harness/evolve/20261115T000600Z-jira-workflow-states-configurable/
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by consumers: the Jira agent assumes the workflow states In Progress, Testing and Done with fixed transition IDs. Their workflow uses different state names (for example a development state and a ready-for-release state). It also assumes a single Jira connection, while their organisation already had a different connection configured by another tool.

Verified here: `canonical/agents/scrum-master/TEMPLATE.md` parametrises only the IDs (`{{JIRA_TRANSITION_IN_PROGRESS}}`, `_TESTING`, `_DONE`, `_ON_HOLD`); the state names and their meaning ("Test phase complete", "story archived") are hardcoded, and the dev and design skills address the agent by those names.

## Impact

Teams with a custom Jira workflow cannot map the lifecycle's transitions without editing the agent and both skills by hand; a second MCP connection is not representable.

## Suggested direction (not committed)

Make the workflow a table captured at launch (lifecycle event → state name → transition ID), rendered into the agent, with the skills referring to lifecycle events rather than state names. Allow the MCP server name for Jira to be an answer rather than fixed.
