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
  - patterns/phase-sign-off.md
  - scripts/timing.mjs
  - scripts/timing.test.mjs
  - templates/stat.schema.json
  - templates/stat.json
  - patterns/metrics.md
  - interfaces/intent.md
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
  - references/07-completion.md
---

## Purpose

The full dev lifecycle in one skill: Context Gathering → Ceremony → Plan →
Implement → Test → Document → Completion. Routes to each stage reference in order
(or directly to one stage, on request). One real stop per phase, at its end
(patterns/phase-sign-off.md); steps inside a phase use intelligent checkpoints.
Completion is its own stage so "done" is never ambiguous: archive, final metrics,
commit and PR text, tracker/tech-debt offers, a clear closing message. Replaces the former separate `dev-plan`, `dev-implement`, `dev-test`,
`dev-document` skills — those stages now live under this one skill's `references/`.
Context Gathering captures the ticket's intent once (from the tracker, any approved
design, and the developer's own words) as `0-intent.md`, before any branch or plan
work. Separation of concerns across the three documents: `0-intent.md` answers
what/for whom/where the edges are and follows an interface (`interfaces/intent.md`),
free in shape; `1-plan.md` answers how and follows a strict template with a
`## Solution` section (approach + target-state Mermaid diagram when wiring matters);
`2-report.md` records what happened. Nothing is repeated between them; they link.

## Substitutions

| Placeholder                  | Source                            | Notes                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`            | Q5 — ticket prefix                | e.g. `AIFD`. Replaces every occurrence of `ND` used as a tracker project key                                                                                                                                                                                                                                                                                                                             |
| `{{BUILD_UNIT_LABEL}}`       | Q2/Q3 — detected monorepo tool    | The generic noun this project's tooling uses for one buildable/testable unit, e.g. `NX project` for an NX monorepo, `package` for a Turborepo/pnpm/Lerna workspace, `module` (or just the app's name) for a single non-monorepo app. Used in `references/03-plan.md` and `references/04-implement.md` wherever the plan/commit-scope guidance refers to one discrete unit — not just in command strings. |
| `{{NX_BUILD_CMD}}`           | Test stage — detected NX projects | Full `yarn nx run-many -t build -p {projects}` command. Detect project names from `project.json` files under `apps/`. Example: `yarn nx run-many -t build -p bff web`                                                                                                                                                                                                                                    |
| `{{NX_DB_MIGRATE_CMD}}`      | Test stage — detected DB project  | Full `yarn nx run {db-project}:migrate` command. Detect DB project name from `apps/` structure. Example: `yarn nx run db:migrate`                                                                                                                                                                                                                                                                        |
| `{{INFRA_SYNTH_CMD}}`        | Q — infra tooling                 | Command to synthesize/validate infra. Terraform: `terraform validate`. CDK: `yarn nx run infra:synth`. Pulumi: `pulumi preview`.                                                                                                                                                                                                                                                                         |
| `{{INFRA_DIFF_CMD}}`         | Q — infra tooling                 | Command to diff/plan infra changes. Terraform: `terraform plan`. CDK: `yarn nx run infra:diff`. Pulumi: `pulumi preview --diff`.                                                                                                                                                                                                                                                                         |
| `{{DOC_PRINCIPLES_ARTICLE}}` | Q — Doc Principles article path   | e.g. `docs/Engineering Guide/Documentation/01 Principles.md` — read by `@docs-writer`, not by the Document stage                                                                                                                                                                                                                                                                                         |
| `{{DOC_STRUCTURE_ARTICLE}}`  | Q — Doc Structure article path    | e.g. `docs/Engineering Guide/Documentation/02 Structure.md` — used by Document stage Step 0                                                                                                                                                                                                                                                                                                              |

Transition IDs are never substituted here — dev only asks `@scrum-master` to
transition a ticket by state name ("In Progress", "Done", …); the tracker agent
resolves the ID from its own definition. Keeping that mapping in one place
(`@scrum-master`) avoids the two skills drifting out of sync.

## Conditionals

- If Q5 is "none" (no issue tracker): remove every tracker-specific reference across `TEMPLATE.md` and all seven `references/*.md` files — Context Gathering Step 2 (fetch tracker context), Ceremony Step 1 (tracker setup), and Completion Step 5's tracker and tech-debt ticket offers. Rewrite the entry route for free-form work without a ticket key. Do not insert the answer `None` or an explanation such as "tracker references removed" into a ticket-prefix placeholder; remove or rewrite the entire dependent sentence/section. Do not leave Jira/Confluence names, tracker credentials, tracker transition steps, tracker task creation, or tracker-only commands.
- If no specialist agents are defined for a layer: replace `references/04-implement.md` and `references/05-test.md`'s delegation logic with "implement/review inline" for that layer
- If no DB layer exists in the project: remove `references/05-test.md` Step 4 (DB migration check), all database start/migrate prompts and commands, and any claim that a local database is required.
- If no install, build, test, or run command is configured: say that the command is not configured and do not invent one. Remove dependent onboarding steps that cannot run; retain the applicable verification guidance.
- If not an NX monorepo (Q3/Q2 detection): replace the NX commands in `references/05-test.md` with the project's actual build/test commands, and resolve `{{BUILD_UNIT_LABEL}}` to the detected tool's own term (or the single app's name if there is no monorepo tool at all) rather than leaving "NX project" as the default wording

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)
- [ ] With a tracker: routes cover the seven named stages (including `complete`) and bare-ticket full chain; ticket matching uses the confirmed project prefix, with no unresolved project token or example `ND` prefix.
- [ ] Without a tracker: the seven named stages and free-form full-chain entry work without ticket keys, tracker credentials, transitions, or `@scrum-master`. Resolve ambiguous stage words in context.
- [ ] The router's entry check is the only fresh-vs-resume decision, for full-chain and direct-stage entry alike; no stage reference carries its own Step 0. It reuses the matching story folder/report (by ticket key, or by description and recorded path without a tracker, asking only if several match). Single-stage entry does not restart the chain.
- [ ] No literal "Jira" wording in `TEMPLATE.md` or any `references/*.md` — tracker activity is named generically and delegated to `@scrum-master`, never described with tracker-specific vocabulary or transition IDs
- [ ] TEMPLATE.md only delegates — no implementation logic, no step details (those live in `references/`)
- [ ] `references/01-context-gathering.md` creates the story folder, the `2-report.md` skeleton and metrics (Step 2b, before the heavy reading) and `0-intent.md` — no other stage creates these; `stage start --stage context` runs before Step 3
- [ ] `references/04-implement.md` applies `patterns/task-tracking.md` for per-step tasks, in addition to the stage-level task the router creates
- [ ] Every Phase-row string across `TEMPLATE.md` and `references/*.md` lists all seven stages in order (`🎯 Context · 🚀 Ceremony · 📋 Plan · 🔨 Implement · 🧪 Test · 📝 Document · 🏁 Completion`) with consistent status icons
- [ ] Story and archive folder names are ASCII only: `docs/Stories/[{TICKET}] {name}` and `docs/Stories/archive/[{TICKET}] {name}`, no emoji or em dash anywhere in a folder name
- [ ] Every `patterns/*.md` and `templates/*.md` reference across `TEMPLATE.md` and `references/*.md` uses the subfolder path (`patterns/X.md`, `templates/Y.md`), never the old flat `pattern-X.md` / `X-template.md` form
- [ ] Story folder globs use `*{TICKET}*` wildcard, never `[{TICKET}]*`, everywhere they appear
- [ ] `0-intent.md` is written against `interfaces/intent.md` (questions, not headings); `1-plan.md` uses `templates/plan.md` with `## Solution`, `## Acceptance Criteria`, `## Steps` and links the intent instead of repeating problem/scope

- [ ] Metrics CLI and schema companions are installed verbatim; run `node --test <dev-skill>/scripts/*.test.mjs` to verify them

- [ ] The dev metrics CLI and its own `scripts/constants.mjs` / `scripts/utils.mjs` work when installed alone; its standalone-install test passes

- [ ] One Review Findings ledger uses stable IDs across reviews; no separate live findings tables.
- [ ] HLD-only deviation audit routes routine LLD updates directly to Documentation.
- [ ] One stop per phase: Context Step 5, Ceremony Step 2, Plan Step 5, Implement Step 4, Test Step 5, Document Step 6 are
      phase sign-offs and still stop unconditionally; Completion Step 4 is one combined ask.
      No other unconditional stops exist. Ceremony Step 1, Test Steps 2–4, Document Steps 2–5, Plan Step 4
      rework and Implement Step 3 step checkpoint are intelligent
      checkpoints. Omitted tracker branches must not be restored to satisfy this list.
- [ ] Every phase sign-off step carries its own `wait start` + **Stop and wait** line and records a `<Stage> sign-off` acceptance check; `scripts/timing.mjs` refuses `stage complete` without one in the current attempt (covered by its tests)
- [ ] Every stage reference names its `stage start` as the first action and ends with the
      same three steps — Sign-off (rework if any) → Report (`2-report.md`, metrics `report`) →
      Commit (proposed, developer runs it, verified in Git, then `stage complete`; Implement by
      step/block) — with every stop preceded by `report` + `wait start`.
- [ ] Quality summary preserves unknown counts and distinguishes failed runs from cases.
- [ ] Closure requires evidence for terminal resolutions; full-flow tracker completion has one owner.

- [ ] Plan Step 3 uses the selected provider's planning procedure and respects host write
      restrictions; a native planning approval, when present, is the Plan phase sign-off
      and adds no second stop. An unavailable native mode plans without claiming native enforcement.
- [ ] Plan Step 1 writes tests by default when the project has a test setup for the touched layers (type chosen from the work, existing framework only); skipping it requires a stated reason in the plan. Its verification is "suite runs, new cases red as expected", recorded as a passed self-sourced acceptance check so the metrics gate can close the step.

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

- [ ] All referenced component specialists exist and their scopes match the root Agents table. During bootstrap Stage A, record this as a cross-stage check owned by B/C; resolve it when those outputs exist, before final verification.
- [ ] No fixed component categories or guessed specialist names drive implementation/review routing.
