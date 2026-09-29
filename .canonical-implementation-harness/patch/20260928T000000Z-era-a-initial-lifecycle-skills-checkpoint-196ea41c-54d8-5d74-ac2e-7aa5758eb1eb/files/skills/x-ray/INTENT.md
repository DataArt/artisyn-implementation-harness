---
skill: x-ray
output: .claude/skills/x-ray/SKILL.md
companion_templates:
  - references/claude-in-chrome-setup.md
---

## Purpose

Full-strength, project-aware code review (`/x-ray`). Runs the built-in `code-review` skill live
for correctness/cleanup/altitude findings, adds project-aware convention checks delegated to each
touched layer's own specialist, and an architecture-alignment pass via `@architect` when the diff
meets the satellite-review trigger criteria. Optionally offers to verify web-layer findings live
in a browser via Claude-in-Chrome (opt-in, declinable). Always offers — never builds without a
yes — an interactive HTML demo via `@interactive-demo`, regardless of what was found. Heavier and
slower than a plain `/code-review`; intended as the team's standard deep-review pass for whoever
is approving a merge request, not something the implementing developer needs to run themselves if
they've already been through `/dev test`'s PR Review step.

## Substitutions

| Placeholder             | Source                                                                | Notes                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{DEFAULT_BRANCH}}`    | Q3/repo detection — default branch name                               | e.g. `develop` or `main`. Used in the diff-scope fallback chain and the `/code-review` handoff command                                                           |
| `{{BFF_APP_PATH}}`      | Q3 — BFF app path (same as the generated backend profile layer agent) | e.g. `apps/bff/`. Path-prefix match for the backend layer row in Step 1's table                                                                                  |
| `{{WEB_APP_PATH}}`      | Q3 — Web app path (same as the generated web profile layer agent)     | e.g. `apps/web/`. Path-prefix match for the Web layer row; also gates whether Step 4b runs at all                                                                |
| `{{DB_APP_PATH}}`       | Q3 — DB/data layer path                                               | e.g. `libs/app-db/` for a project with a separate data library, or the same value as `{{BFF_APP_PATH}}` if data code lives inside the BFF app (see Conditionals) |
| `{{INFRA_APP_PATH}}`    | Q3 — infra container path (same as `agents/infra`)                    | e.g. `apps/infra/`, `infra/`                                                                                                                                     |
| `{{CI_CONFIG_PATTERN}}` | Repo detection — CI config file(s)                                    | e.g. `.gitlab-ci.yml` for GitLab CI, `.github/workflows/*.yml` for GitHub Actions                                                                                |
| `{{BACKEND_AGENT}}`     | AGENTS.md — BFF/backend agent (same as `dev-test`)                    | e.g. `@bff`. Delegated to for the BFF convention pass (2b) and named in Step 4's findings header                                                                 |
| `{{FRONTEND_AGENT}}`    | AGENTS.md — Web/frontend agent (same as `dev-test`)                   | e.g. `@web`. Delegated to for the Web convention pass (2b) and named in Step 4's findings header                                                                 |
| `{{DATA_AGENT}}`        | AGENTS.md — data/DB agent (same as `dev-implement`)                   | e.g. `@data`. Delegated to for the Data convention pass (2b) and named in Step 4's findings header                                                               |
| `{{LOCAL_WEB_URL}}`     | Project setup docs (same as `agents/onboarding`)                      | e.g. `http://localhost:3000`. Step 4b's hard scope restriction — the ONLY origin the browser tools may navigate to                                               |
| `{{LOCAL_API_URL}}`     | Project setup docs (same as `agents/onboarding`)                      | e.g. `http://localhost:3001/api`. Referenced only as an example of a same-page network request Step 4b may observe                                               |
| `{{NX_SERVE_WEB_CMD}}`  | Stage 1b — detected NX web project (same as `dev-test`)               | Full serve command for the web app. Example: `yarn nx serve web`                                                                                                 |
| `{{NX_SERVE_BFF_CMD}}`  | Stage 1b — detected NX BFF project (same as `dev-test`)               | Full serve command for the BFF. Example: `yarn nx serve bff`                                                                                                     |

`@architect` and `@interactive-demo` are kept verbatim (not parametrized) — same treatment as
`@architect` gets in every other skill: they are standard, tech-agnostic harness agent names, not
project-specific values. `code-review` (the built-in Skill invocation) is an Anthropic platform
skill, never parametrized.

## Conditionals

- If the project has no separate data/DB library (data-layer code lives inside the BFF app
  instead): set `{{DB_APP_PATH}}` = `{{BFF_APP_PATH}}` and drop the Data row from Step 1's table
  if `{{DATA_AGENT}}` doesn't exist as a distinct agent either — fold data-layer review into the
  BFF convention pass instead.
- If the infra stack isn't Terraform: replace `*.tf`, `*.tfvars` in Step 1's Infra row with the
  actual IaC file extension(s) (e.g. CloudFormation `*.yaml` under `{{INFRA_APP_PATH}}`).
- If CI isn't GitLab: replace `{{CI_CONFIG_PATTERN}}` with the actual CI config path (e.g.
  `.github/workflows/*.yml` for GitHub Actions, `azure-pipelines.yml` for Azure DevOps).
- If the project has no web/frontend app at all: drop the Web row from Step 1's table and remove
  Step 4b entirely (there is nothing for it to verify).
- If `@interactive-demo` hasn't been deployed as a project agent yet: this skill still references
  it verbatim in Step 5 — deploying that agent is a separate harvest/bootstrap step, not something
  this skill's own generalization should route around.

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:`
      (trigger conditions for this skill)
- [ ] Step 1's layer table has one row per real touched layer in the deployed project — no row
      left referencing a layer/path that doesn't exist there
- [ ] `{{DEFAULT_BRANCH}}` is resolved consistently everywhere it appears (diff fallback chain AND
      the `/code-review` handoff command example)
- [ ] No literal `@nestjs-dev`, `@react-dev`, or `@data` remain — only `{{BACKEND_AGENT}}` /
      `{{FRONTEND_AGENT}}` / `{{DATA_AGENT}}`
- [ ] `@architect` and `@interactive-demo` are still literal (never accidentally parametrized)
- [ ] The `code-review` Skill invocation (2a) and its 2a-fallback handoff block are unmodified —
      this pass must always run at full strength, independent of 2b/2c
- [ ] Step 2c's trigger criteria still point at `.claude/skills/dev/patterns/satellite-review.md`
      (a fixed harness companion path, not parametrized)
- [ ] `{{NX_SERVE_WEB_CMD}}`/`{{NX_SERVE_BFF_CMD}}` are real runnable commands with actual project
      names
- [ ] `{{WEB_APP_PATH}}`, `{{LOCAL_WEB_URL}}`, `{{LOCAL_API_URL}}` match the same values used
      elsewhere in the bootstrap (the generated `agents/layer` profile, `agents/onboarding`, and `dev-test`)
- [ ] Step 4b's scope restriction is preserved verbatim as written — only `{{LOCAL_WEB_URL}}`,
      never widened to any other origin
- [ ] Step 4b stays opt-in (explicit yes/no ask) — never converted to the unconditional form
      `dev-test`'s Step 8b uses; that distinction is intentional (see Step 4b's own doc)
- [ ] `.claude/skills/x-ray/references/claude-in-chrome-setup.md` exists in the deployed project (a fixed harness
      companion file, not parametrized — same treatment as `pattern-*.md` files)
- [ ] `docs/Stories/*{TICKET}*/` glob patterns are unmodified (harness-standard, never
      parametrized as part of the story lookup contract)
