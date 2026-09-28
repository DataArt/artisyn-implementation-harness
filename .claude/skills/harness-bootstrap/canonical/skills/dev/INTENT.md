---
skill: dev
output: {{provider:skills_root}}/dev/SKILL.md
companion_templates:
  - scripts/constants.mjs
  - scripts/utils.mjs
  - scripts/quality.mjs
  - scripts/quality.test.mjs
  - patterns/approval-sign-off.md
  - patterns/approval-intelligent.md
  - scripts/timing.mjs
  - scripts/timing.test.mjs
  - templates/stat.schema.json
  - templates/stat.json
  - patterns/metrics.md
  - templates/intent.md
  - templates/plan.md
  - templates/report.md
  - patterns/review-gate.md
  - patterns/session-continuity.md
  - patterns/write-confirm.md
  - patterns/announce-progress.md
  - patterns/do-report-commit.md
  - patterns/satellite-review.md
  - patterns/task-tracking.md
  - references/00-router.md
  - references/01-context-gathering.md
  - references/02-ceremony.md
  - references/03-plan.md
  - references/04-implement.md
  - references/05-test.md
  - references/06-document.md
---

## Purpose

The full dev lifecycle in one skill: Context Gathering → Ceremony → Plan →
Implement → Test → Document. Routes to each stage reference in order (or directly
to one stage, on request), continuing routine authorized work and pausing only for material decisions or
required human actions under patterns/approval-sign-off.md. Replaces the former separate `dev-plan`, `dev-implement`, `dev-test`,
`dev-document` skills — those stages now live under this one skill's `references/`.
Context Gathering and Ceremony are new: Context Gathering captures the ticket's
intent once (from the tracker, any approved design, and the developer's own words)
as `0-intent.md`, before any tracker/branch ceremony or plan-writing begins.

## Substitutions

| Placeholder                  | Source                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`            | Q5 — ticket prefix                | e.g. `AIFD`. Replaces every occurrence of `ND` used as a tracker project key                                                                                                                                                                                                                                                                                                                             |
| `{{BUILD_UNIT_LABEL}}`       | Q2/Q3 — detected monorepo tool    | The generic noun this project's tooling uses for one buildable/testable unit, e.g. `NX project` for an NX monorepo, `package` for a Turborepo/pnpm/Lerna workspace, `module` (or just the app's name) for a single non-monorepo app. Used in `references/03-plan.md` and `references/04-implement.md` wherever the plan/commit-scope guidance refers to one discrete unit — not just in command strings. |
| `{{NX_BUILD_CMD}}`           | Test stage — detected NX projects | Full `yarn nx run-many -t build -p {projects}` command. Detect project names from `project.json` files under `apps/`. Example: `yarn nx run-many -t build -p bff web`                                                                                                                                                                                                                                    |
| `{{NX_DB_MIGRATE_CMD}}`      | Test stage — detected DB project  | Full `yarn nx run {db-project}:migrate` command. Detect DB project name from `apps/` structure. Example: `yarn nx run db:migrate`                                                                                                                                                                                                                                                                        |
| `{{INFRA_SYNTH_CMD}}`        | Q — infra tooling                 | Command to synthesize/validate infra. Terraform: `terraform validate`. CDK: `yarn nx run infra:synth`. Pulumi: `pulumi preview`.                                                                                                                                                                                                                                                                         |
| `{{INFRA_DIFF_CMD}}`         | Q — infra tooling                 | Command to diff/plan infra changes. Terraform: `terraform plan`. CDK: `yarn nx run infra:diff`. Pulumi: `pulumi preview --diff`.                                                                                                                                                                                                                                                                         |
| `{{DOC_PRINCIPLES_ARTICLE}}` | Q — Doc Principles article path   | e.g. `docs/Engineering Guide/Documentation/01 Principles.md` — used by Document stage Step 0                                                                                                                                                                                                                                                                                                             |
| `{{DOC_STRUCTURE_ARTICLE}}`  | Q — Doc Structure article path    | e.g. `docs/Engineering Guide/Documentation/02 Structure.md` — used by Document stage Step 0                                                                                                                                                                                                                                                                                                              |

Transition IDs are never substituted here — dev only asks `@scrum-master` to
transition a ticket by state name ("In Progress", "Done", …); the tracker agent
resolves the ID from its own definition. Keeping that mapping in one place
(`@scrum-master`) avoids the two skills drifting out of sync.

## Conditionals

- If Q5 is "none" (no issue tracker): remove every tracker reference across `TEMPLATE.md` and all six `references/*.md` files — Context Gathering Step 2 (fetch tracker context) and Ceremony Step 1 (tracker setup), Document Step 5 (tech-debt tasks), and the Completion — tracker sync section
- If no specialist agents are defined for a layer: replace `references/04-implement.md` and `references/05-test.md`'s delegation logic with "implement/review inline" for that layer
- If no DB layer exists in the project: remove `references/05-test.md` Step 4 (DB migration check)
- If not an NX monorepo (Q3/Q2 detection): replace the NX commands in `references/05-test.md` with the project's actual build/test commands, and resolve `{{BUILD_UNIT_LABEL}}` to the detected tool's own term (or the single app's name if there is no monorepo tool at all) rather than leaving "NX project" as the default wording

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)
- [ ] Route section covers all seven entry forms: `context`, `ceremony`, `plan`, `implement`, `test`, `document`, and bare-ticket full chain, plus the ambiguous-stage-word ask
- [ ] Idempotency check section is present, scoped to full-chain entry only, using `{{PROJECT_KEY}}-\d+` pattern
- [ ] No literal `ND` used as ticket prefix — all replaced with `{{PROJECT_KEY}}`
- [ ] No literal "Jira" wording in `TEMPLATE.md` or any `references/*.md` — tracker activity is named generically and delegated to `@scrum-master`, never described with tracker-specific vocabulary or transition IDs
- [ ] TEMPLATE.md only delegates — no implementation logic, no step details (those live in `references/`)
- [ ] `references/01-context-gathering.md` creates the story folder, `0-intent.md`, and the `2-report.md` skeleton (empty Progress table) — no other stage creates these
- [ ] `references/04-implement.md` applies `patterns/task-tracking.md` for per-step tasks, in addition to the stage-level task the router creates
- [ ] Every Phase-row string across `TEMPLATE.md` and `references/*.md` lists all six stages in order (`🎯 Context · 🚀 Ceremony · 📋 Plan · 🔨 Implement · 🧪 Test · 📝 Document`) with consistent status icons
- [ ] Every `patterns/*.md` and `templates/*.md` reference across `TEMPLATE.md` and `references/*.md` uses the subfolder path (`patterns/X.md`, `templates/Y.md`), never the old flat `pattern-X.md` / `X-template.md` form
- [ ] Story folder globs use `*{TICKET}*` wildcard, never `[{TICKET}]*`, everywhere they appear

- [ ] Metrics CLI and schema companions are installed verbatim; run `node --test <dev-skill>/scripts/*.test.mjs` to verify them

- [ ] The dev metrics CLI and its own `scripts/constants.mjs` / `scripts/utils.mjs` work when installed alone; its standalone-install test passes

- [ ] One Review Findings ledger uses stable IDs across reviews; no separate live findings tables.
- [ ] HLD-only deviation audit routes routine LLD updates directly to Documentation.
- [ ] Approval boundaries apply throughout; no unconditional per-file/fix/phase gates
      _beyond_ the sign-off gates each stage reference names for itself (Context
      Step 4, Ceremony Step 2, Plan Steps 3/5/6, Implement Step 3) — verify each of
      those gates still exists and still stops unconditionally, and that Plan Step 4's
      rework and Ceremony Step 1's tracker transition still name themselves
      intelligent-approval checkpoints rather than unconditional sign-offs.
- [ ] Quality summary preserves unknown counts and distinguishes failed runs from cases.
- [ ] Closure requires evidence for terminal resolutions; full-flow tracker completion has one owner.

- [ ] Plan Step 3 uses the selected provider's planning procedure, preserves explicit
      proposal approval and persisted-plan sign-off, and respects host write restrictions.
      An unavailable native mode uses planning-only behavior without claiming native enforcement.
- [ ] New tests are conditional on value and project setup; choose unit/integration/load/etc. for the work, with no mandatory test-writing Step 1. When using TDD, keep red/green within a logical step.

## Component-agent routing

Derive implementation components from repository structure, build configuration,
architecture and confirmed ownership. Instantiate `agents/layer/TEMPLATE.md` with
its INTENT separately for each component that needs a specialist. Names, scope,
toolchain and responsibilities come from evidence, not a fixed frontend/backend/data
list. Record `Component | Owned paths | Agent | Responsibilities` in the selected
root instruction file's Agents table; both providers share the same ownership map.
Implementation and Test resolve owners from that table and the installed role definitions.
Do not add category-specific agent placeholders to skills. No matching owner means
explicit inline handling; ambiguous ownership must be resolved before delegation.

- [ ] All referenced component specialists exist and their scopes match the root Agents table.
- [ ] No fixed component categories or guessed specialist names drive implementation/review routing.
