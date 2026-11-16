---
agent: architect
output: {{provider:agents_root}}/architect.{{provider:agent_extension}}
---

## Purpose

Senior architecture agent for review and authoring. Dual-mode: (1) audits existing architecture docs against code for alignment gaps, (2) writes or updates architecture documents grounded in what the code actually does. Uses extended thinking. Always cites doc and code evidence — no unsupported assertions.

## Substitutions

| Placeholder                        | Source                  | Notes                                                                                                                          |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `{{PROJECT_NAME}}`                 | Q1 — project name       | Used in agent persona line                                                                                                     |
| `{{LAYER_MAP_TABLE}}`              | Q — architecture layers | Markdown table: Layer \| Architecture doc path \| Code path(s). One row per HLD container. Doc paths use `<VERSION>` token.    |
| `{{CROSS_LAYER_INTEGRITY_CHECKS}}` | Q — layer boundaries    | Bash one-liners that grep for illegal cross-layer imports. One check per boundary direction. Include comments explaining each. |
| `{{WAF_PILLARS_TABLE}}`            | Q11 — WAF framework     | Markdown table: Pillar \| Key questions. One row per WAF pillar for the chosen framework.                                      |

## Conditionals

- If Q11 is "None": remove Step 4 (Well-Architected assessment) and the WAF section from the output report template
- If the project has no layer boundary rules: remove Step 3 (cross-layer integrity checks)

## Verify checklist

- [ ] `{{PROJECT_NAME}}` is not left as a placeholder in the deployed agent
- [ ] `{{LAYER_MAP_TABLE}}` covers all HLD containers; doc paths use `<VERSION>` token (not a hardcoded version)
- [ ] `{{CROSS_LAYER_INTEGRITY_CHECKS}}` bash block has one check per boundary direction with explanatory comment
- [ ] `{{WAF_PILLARS_TABLE}}` is populated with correct pillars for the chosen framework (not left as placeholder)
- [ ] Output report template WAF section rows match the actual pillar count from `{{WAF_PILLARS_TABLE}}`
- [ ] `architecture-docs.md` convention path is correct for the project
