# Validation plan — Jira agent: project workflow states and MCP server configurable

Candidate: `20261115T000600Z-jira-workflow-states-configurable`. Hashes: see `Report.md`. Status: **executed 2026-11-15.** Walkthroughs are labelled as such.

## Scenario table

| #   | Category         | Input / context                                                                                                              | Expected behavior                                                   | Method                 | Actual outcome                                                                                                                                             | Evidence                | Result             |
| --- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------ |
| 1   | Positive         | Render with states `In Development` / `Code Review` / `Ready For Release` / `Blocked`, prefix `mcp__jira_org__`              | Table shows generic → project name → ID; tools line uses the prefix | Walkthrough of Block B | Table renders generic → `{{JIRA_STATE_*}}` → `{{JIRA_TRANSITION_*}}` per row; `tools:` uses `{{JIRA_MCP_TOOL_PREFIX}}*`                                    | read candidate TEMPLATE | pass (walkthrough) |
| 2   | Negative trigger | Defaults (`In Progress`… and `mcp__atlassian__`)                                                                             | Rendered agent identical in behaviour to today                      | Walkthrough            | With defaults the four generic names and `mcp__atlassian__` render; behaviour unchanged                                                                    | read                    | pass (walkthrough) |
| 3   | Regression       | Dev Ceremony asks "transition to In Progress"                                                                                | Agent maps via generic column                                       | Read template rule     | New rule: skills ask by the generic column; unknown state → ask, never guess                                                                               | read                    | pass               |
| 4   | Structural       | Placeholder names appear in INTENT and TEMPLATE consistently; this repo's installed `scrum-master.md` unaffected until apply | grep                                                                |                        | Placeholder sets in TEMPLATE and INTENT are identical (`comm` empty); new table rows have 6 fields each; installed `scrum-master.md` untouched until apply | shell                   | pass               |

## Correction after adoption

2026-11-15: the developer's `harness-bootstrap-e2e:unit` run failed on the Copilot agent renderer (placeholder in `tools:`). Fixed as described in Report.md; the unit run must be repeated.

## Tool/runtime limitations

No live Jira call.

## Verdict

**Pass.** 4 of 4 scenarios (two by walkthrough). Next action: `/evolve adopt 20261115T000600Z-jira-workflow-states-configurable` once accepted.
