---
skill: agents/layer
output: .claude/agents/{{LAYER_NAME}}.md
---

## Purpose

Generic specialist agent for any bounded application layer (web, auth, bff, data, worker, etc.). Enforces TypeScript discipline, NX conventions, satellite review for non-trivial steps, and layer-specific rules. Instantiate once per layer during bootstrap.

## Substitutions

| Placeholder                      | Source                                | Notes                                                                                        |
| -------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `{{LAYER_NAME}}`                 | Bootstrap Q — layer name              | e.g. `web`, `auth`, `bff`, `data`. Used as agent filename and in NX commands + commit scopes |
| `{{LAYER_PATH}}`                 | Bootstrap Q — layer path              | e.g. `apps/web/`, `apps/lambda-auth/`                                                        |
| `{{LAYER_DESCRIPTION}}`          | Bootstrap Q — one-line role label     | e.g. "VitePress frontend specialist", "Lambda@Edge auth handler"                             |
| `{{LAYER_ROLE}}`                 | Bootstrap Q — full role paragraph     | What this layer owns; what architectural role it plays                                       |
| `{{LAYER_EXCLUDED_CONCERNS}}`    | Bootstrap Q — explicit non-scope      | What this agent must not touch (e.g. "CDK infrastructure, VitePress config, docs content")   |
| `{{NX_APP_NAME}}`                | Bootstrap Q — NX project name         | e.g. `site`, `lambda-auth`, `bff`. Used in `yarn nx run {{NX_APP_NAME}}:build`               |
| `{{LAYER_KEY_RULES}}`            | Bootstrap Q — 2–4 enforcement rules   | Layer-specific invariants (timing-safe compares, accessibility, p95 targets, etc.)           |
| `{{LAYER_REVIEW_TRIGGERS}}`      | Bootstrap Q — non-trivial examples    | e.g. "new auth flow, header handling change, credential validation logic"                    |
| `{{LAYER_REVIEW_SKIP_EXAMPLES}}` | Bootstrap Q — mechanical examples     | e.g. "config value, log format, minor refactor with no auth logic impact"                    |
| `{{GUARDED_COMMANDS}}`           | Q7 — guarded commands                 | Commands to present as instructions, never run directly                                      |
| `{{LAYER_NEVER_DO}}`             | Bootstrap Q — additional prohibitions | Layer-specific hard rules (e.g. "Never use === for credential comparison")                   |

## Conditionals

- If the layer has no NX project (e.g. pure infra or scripts): remove NX run syntax rule and adapt commit scope to the layer name directly
- If the layer has no TypeScript: remove strict mode rule or replace with the language's equivalent
- If there are no additional `{{LAYER_NEVER_DO}}` rules: leave the placeholder empty or remove the trailing block

## Bootstrap pattern

Instantiate one agent file per layer. For a project with web + auth + infra layers, run this template three times:

```
.claude/agents/web.md    — {{LAYER_NAME}} = web,  {{NX_APP_NAME}} = site
.claude/agents/auth.md   — {{LAYER_NAME}} = auth, {{NX_APP_NAME}} = lambda-auth
```

Infra agents typically use the shared `infra` agent template rather than this generic layer template, because infra is not TypeScript-first and has distinct enforcement rules.

## Verify checklist

- [ ] Five sections present: Role, Layer scope, What to enforce, Satellite review, What never to do
- [ ] `{{LAYER_NAME}}` resolved — no literal placeholder remaining in agent name, NX commands, or commit scopes
- [ ] `{{LAYER_PATH}}` resolved — no literal placeholder remaining in path references
- [ ] `{{NX_APP_NAME}}` resolved — NX run command uses the correct project name
- [ ] Satellite review section references `.claude/skills/dev/pattern-satellite-review.md`
- [ ] `{{LAYER_KEY_RULES}}` expanded — at least one layer-specific enforcement rule present
- [ ] `{{GUARDED_COMMANDS}}` resolved — matches Q7 guarded command list
