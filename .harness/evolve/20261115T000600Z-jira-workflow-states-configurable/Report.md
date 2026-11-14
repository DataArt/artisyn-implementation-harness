# Evolve candidate — Jira agent: project workflow states and MCP server configurable

## Identity

- Candidate: `20261115T000600Z-jira-workflow-states-configurable`
- Requested outcome: a project whose Jira workflow uses other state names (or another MCP connection name) maps the lifecycle's generic states to its own without editing the agent by hand.
- Scope: `canonical/agents/scrum-master/TEMPLATE.md` and `INTENT.md`.
- Non-goals: dev and design skills keep asking by the generic state names (In Progress, Testing, Done, On Hold); the agent owns the mapping. No launch-question text change (Q5 already covers tracker details; INTENT names the source).
- Source reflections:
  - `.harness/reflections/triaged/20261114T232723Z-jira-agent-fixed-workflow-states.md`
- Evidence: The template parametrises only transition IDs; state names and `tools: Read, mcp__atlassian__*` are literal. The skills name the generic states 14 times across dev and design. Consumers with a custom workflow and an existing organisation Jira connection had to hand-edit.

## Action

**Update** the template: the transition table gains a "Project state name" column with `{{JIRA_STATE_*}}` placeholders next to the generic names; a rule to ask when a requested state has no row; `tools:` uses `{{JIRA_MCP_TOOL_PREFIX}}`. **Update** INTENT: five substitution rows and two verify items. Callers: launch Block B agent rendering; dev/design unchanged.

Canonical files touched here are edited in place; they must travel to consumers through `/harness-bootstrap patch prepare` (direct canonical edits) after adoption. Adoption order within this run: image filenames → entrypoint guards → og-ignore → plan amend → commit/branch format → Jira states; the two CLI candidates share `cli.mjs` and were verified to compose in that order (`candidate.patch` each).

## Acceptance criteria

1. Rendered agent lists, per generic state, the project's real state name and transition ID.
2. `tools:` names the project's Jira MCP prefix; default renders `mcp__atlassian__*`.
3. Dev/design requests by generic name still resolve through the table.
4. INTENT verify items require real names from the transitions API.

## Proposed file mapping

| Source (candidate)                                                                      | Destination                                                                   | Baseline hash                                                      | Candidate hash                                                     | Operation |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.canonical-implementation-harness/canonical/agents/scrum-master/INTENT.md`   | `.canonical-implementation-harness/canonical/agents/scrum-master/INTENT.md`   | `d639c4075e820212854e4f5c1b058d96281fd2da2a6ec2472c333793f88f8589` | `8e6053b3501d7428973762193a3e50e88fe1ad76f59e0a6df2c6aeeff3d9917a` | update    |
| `candidate/.canonical-implementation-harness/canonical/agents/scrum-master/TEMPLATE.md` | `.canonical-implementation-harness/canonical/agents/scrum-master/TEMPLATE.md` | `3b534c7bc2d89d2520ec2bde03d9ef2be26ffc1f8f0b76dbe7f5e9344b475749` | `5fe8ae6f1751a9aec90a19e9172c397864dc9caa013e4441ecc542a9c92594a8` | update    |

`candidate.patch` is the authoritative diff. Rollback: `git checkout --` each destination.

## Change summary

- TEMPLATE: table replaced (4 rows, new column), tools line.
- INTENT: rows for `{{JIRA_MCP_TOOL_PREFIX}}`, `{{JIRA_STATE_IN_PROGRESS|TESTING|DONE|ON_HOLD}}`; two checklist items.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                          |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above (external consumer feedback, relayed 2026-11-15)                                                                                                                                                                                                                                                  |
| Triage   | completed | This report; Triage · 2026-11-15 · tracker: Claude native tasks, run ID `EVOLVE-20261115`                                                                                                                                                                                                                                  |
| Validate | completed | `Validation.md`, 2026-11-15: **Pass                                                                                                                                                                                                                                                                                        |
| Adopt    | completed | 2026-11-15: Patch applied; TEMPLATE and INTENT placeholder sets agree. This repo's installed `scrum-master.md` is unchanged until `patch apply` renders it with defaults. Installed hashes: `INTENT.md` `25b3b599241a2dd9`, `TEMPLATE.md` `b222433feb57fb75`. Uncommitted; canonical files need `patch prepare` to travel. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch prepare` for the canonical files.

## Post-adoption correction (2026-11-15)

The developer's unit run failed `provider-launch.spec.ts`: `Unsupported Copilot agent tool: {{JIRA_MCP_TOOL_PREFIX}}*`. The Copilot renderer parses each `tools:` entry as `mcp__<server>__<tool|*>` before any substitution, so a placeholder there can never render. Corrected live and in the candidate: `tools:` is back to the literal `mcp__atlassian__*`, and the MCP server name is an INTENT rendering rule (rewrite `atlassian` to the project's server, keep the shape), like the Q7 format rules. State-name placeholders are unaffected (table body, substituted like any other token). Validate scenario 4 only compared placeholder sets; it did not exercise the renderer, which the unit suite does.

## Unresolved decisions

1. Whether a fifth, project-specific state (e.g. a release state between Testing and Done) should be representable. Draft keeps four generic states; a consumer needing more is a new reflection.
2. The default value for `{{JIRA_MCP_TOOL_PREFIX}}` must be set to `mcp__atlassian__` in the launch rendering so existing projects render identically; record in Block B when adopting.

## Candidate acceptance record

Accepted by the developer on 2026-11-15, their words: "adopt all six".
