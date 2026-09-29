---
skill: agents/layer
output: .claude/agents/{{LAYER_NAME}}.md
---

## Purpose

Generic specialist agent for any bounded implementation layer (web, API/BFF, data, worker, library, CLI, or infrastructure). Instantiate once per detected layer. The generated filename follows the actual layer name; the canonical source is always this profile-driven template.

## Substitutions

| Placeholder                      | Source                                   | Notes                                                                                                                          |
| -------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `{{LAYER_NAME}}`                 | Bootstrap Q — layer name                 | e.g. `web`, `auth`, `bff`, `data`. Used as agent filename and in NX commands + commit scopes                                   |
| `{{LAYER_PATH}}`                 | Bootstrap Q — layer path                 | e.g. `apps/web/`, `apps/lambda-auth/`                                                                                          |
| `{{LAYER_DESCRIPTION}}`          | Bootstrap Q — one-line role label        | e.g. "VitePress frontend specialist", "Lambda@Edge auth handler"                                                               |
| `{{LAYER_ROLE}}`                 | Bootstrap Q — full role paragraph        | What this layer owns; what architectural role it plays                                                                         |
| `{{LAYER_EXCLUDED_CONCERNS}}`    | Bootstrap Q — explicit non-scope         | What this agent must not touch (e.g. "CDK infrastructure, VitePress config, docs content")                                     |
| `{{NX_APP_NAME}}`                | Bootstrap Q — NX project name            | e.g. `site`, `lambda-auth`, `bff`. Used in `yarn nx run {{NX_APP_NAME}}:build`                                                 |
| `{{LAYER_KEY_RULES}}`            | Bootstrap Q — 2–4 enforcement rules      | Layer-specific invariants (timing-safe compares, accessibility, p95 targets, etc.)                                             |
| `{{LAYER_REVIEW_TRIGGERS}}`      | Bootstrap Q — non-trivial examples       | e.g. "new auth flow, header handling change, credential validation logic"                                                      |
| `{{LAYER_REVIEW_SKIP_EXAMPLES}}` | Bootstrap Q — mechanical examples        | e.g. "config value, log format, minor refactor with no auth logic impact"                                                      |
| `{{GUARDED_COMMANDS}}`           | Q7 — guarded commands                    | Commands to present as instructions, never run directly                                                                        |
| `{{LAYER_NEVER_DO}}`             | Bootstrap Q — additional prohibitions    | Layer-specific hard rules (e.g. "Never use === for credential comparison")                                                     |
| `{{LAYER_PROFILE}}`              | Derived from Q2/Q3 and source inspection | `web`, `backend`, `data`, `worker`, `library`, `cli`, `infrastructure`, or another confirmed profile                           |
| `{{LAYER_TOOLCHAIN}}`            | Repository build/config evidence         | Actual language, framework, package/build tool, compiler and check commands; never assume TypeScript, Nx, Yarn or package.json |
| `{{LAYER_PATTERNS}}`             | Source/config evidence and decisions     | Profile-specific rules for contracts, state/data, configuration, operations and diagnostics                                    |

## Conditionals

- If the layer has no Nx project, TypeScript or package.json: remove those rules and use the detected toolchain and exact configured commands
- If a profile has no applicable concern (for example no persistence for a worker), omit it and record non-applicability in the launch record
- If there are no additional `{{LAYER_NEVER_DO}}` rules: leave the placeholder empty or remove the trailing block

## Bootstrap pattern

Instantiate one agent file per detected layer. Profiles supply conditional rules; they are not separate canonical templates:

```
.claude/agents/web.md    — profile web
.claude/agents/api.md    — profile backend
.claude/agents/data.md   — profile data
```

Infrastructure uses the same template with profile `infrastructure`; it receives deployment safety rules from detected command/config evidence.

## Verify checklist

- [ ] Five sections present: Role, Layer scope, What to enforce, Satellite review, What never to do
- [ ] `{{LAYER_NAME}}` resolved — no literal placeholder remaining in agent name, NX commands, or commit scopes
- [ ] `{{LAYER_PATH}}` resolved — no literal placeholder remaining in path references
- [ ] `{{NX_APP_NAME}}` resolved — NX run command uses the correct project name
- [ ] Satellite review section references `.claude/skills/dev/patterns/satellite-review.md`
- [ ] `{{LAYER_KEY_RULES}}` expanded — at least one layer-specific enforcement rule present
- [ ] `{{LAYER_PROFILE}}` resolved to a confirmed profile and its rules are applicable
- [ ] `{{LAYER_TOOLCHAIN}}` contains only detected language/build/check facts
- [ ] No assumptions about TypeScript, Nx, Yarn, package.json or `src/` remain when absent
- [ ] No overlapping layer agent owns the same path
- [ ] `{{GUARDED_COMMANDS}}` resolved — matches Q7 guarded command list
