---
skill: dev-test
output: .claude/skills/dev-test/SKILL.md
---

## Purpose

Runs the test stage for an implemented plan: build check, DB migration check, full test suite (typecheck, tests, lint), acceptance criteria validation, collaborative test review, PR review with layer delegation, and report update.

## Substitutions

| Placeholder             | Source                          | Notes                                                                                                                                                                 |
| ----------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`       | Q5 — ticket prefix              | Replaces `ND` in ticket references                                                                                                                                    |
| `{{BACKEND_AGENT}}`     | AGENTS.md — BFF/backend agent   | e.g. `@bff`. Used for PR review delegation                                                                                                                            |
| `{{FRONTEND_AGENT}}`    | AGENTS.md — Web/frontend agent  | e.g. `@web`. Used for PR review delegation                                                                                                                            |
| `{{NX_BUILD_CMD}}`      | Stage 1b — detected NX projects | Full `yarn nx run-many -t build -p {projects}` command. Detect project names from `project.json` files under `apps/`. Example: `yarn nx run-many -t build -p bff web` |
| `{{NX_DB_MIGRATE_CMD}}` | Stage 1b — detected DB project  | Full `yarn nx run {db-project}:migrate` command. Detect DB project name from `apps/` structure. Example: `yarn nx run db:migrate`                                     |
| `{{INFRA_SYNTH_CMD}}`   | Q — infra tooling               | Command to synthesize/validate infra. Terraform: `terraform validate`. CDK: `yarn nx run infra:synth`. Pulumi: `pulumi preview`.                                      |
| `{{INFRA_DIFF_CMD}}`    | Q — infra tooling               | Command to diff/plan infra changes. Terraform: `terraform plan`. CDK: `yarn nx run infra:diff`. Pulumi: `pulumi preview --diff`.                                      |

## Conditionals

- If Q5 is "none": remove Jira references from step descriptions
- If no DB layer in project: remove Step 4 (DB migration check)
- If no NX monorepo (Q3/Q2 detection): replace NX commands with the project's actual build/test commands

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] `{{NX_BUILD_CMD}}` is a real runnable command with actual project names — not a placeholder like `{projects}`
- [ ] `{{NX_DB_MIGRATE_CMD}}` uses the actual DB project name
- [ ] Story folder glob uses `*{TICKET}*` wildcard, never `[{TICKET}]*`
- [ ] Step 5 (PR Review) runs before the test suite — not after
- [ ] Step 5 (PR review) delegates by layer to `{{BACKEND_AGENT}}` and `{{FRONTEND_AGENT}}`
- [ ] No literal `@nestjs-dev` or `@react-dev` remain
- [ ] Step 5 includes @architect audit block with trigger conditions (infra, cross-layer, non-trivial flows) and prompt template
- [ ] `@architect` prompt instructs dynamic NFR doc discovery (read HLD README → find active version → read Non-Functional Concerns/Requirements.md) — no hardcoded path
- [ ] Step 6 is an unconditional commit gate — fires whenever code was changed during PR review, not just for must-fix items
