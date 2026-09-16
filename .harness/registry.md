# Tracked deployment registry

Project-local allowlist mapping canonical files to permanent outputs for this
project's harness install. Follows the schema in
`.claude/skills/harness-bootstrap/registry.md` and
`.claude/skills/harness-bootstrap/references/06-patch-state.md`.

- `patch harvest`: permanent → generalize → canonical.
- `patch prepare`: canonical (direct edits) → portable bundle. No personalization, no deployment.
- `patch apply`: canonical → personalize → permanent.
- `.harness/state/` holds baselines and outcomes; `.harness/patch/` holds immutable
  manifests with update diffs and full added files.

Template paths are package-relative, rooted at
`.claude/skills/harness-bootstrap/canonical/`; Deployed paths are project-relative.

Selected lifecycles: Dev, Design (Two-track: project HLD + `docs/Harness/` shared
product-context), Skill (Evolve), Architecture (AWS Well-Architected). Tracker: Jira,
project `ND`, at `https://support.dataart.com` (`@scrum-master` deployed). X-ray
deployed (adapted: no BFF/DB layer — Auth row uses `@auth`; `@interactive-demo`
referenced verbatim per its own INTENT, not yet deployed anywhere in canonical).
`dev-approvals` was renamed to `dev-approval-sign-off` (`patterns/approval-sign-off.md`)
and split out a new `dev-approval-intelligent` (`patterns/approval-intelligent.md`)
companion; harvested into canonical as bundle `09e72961-134c-4597-8e0c-45c1e93264dd`.
The same split was added to `design` (new `design-approval-sign-off`/
`design-approval-intelligent` — additive, design never had a centralized approvals
file before) via bundle `47f2bd3b-e3ba-4a6a-b1ff-243fc53c63ee`. A separate audit
found hardcoded "NX monorepo"/`apps/`+`libs/` assumptions in `where-we-are`, `war`,
and `dev`'s canonical templates; fixed via `prepare` bundle
`8bc7fb00-a021-456c-a4b4-2d4e506dc62b` and applied to this project's deployed
`where-we-are`/`war` skills (`dev` needed no deployed change — its literal "NX
project" wording already equals this project's resolved `{{BUILD_UNIT_LABEL}}`).
Review feedback (three rounds) then fixed the two approval patterns: (1) they
mixed concerns — sign-off philosophized about intelligent-approval, both
hardcoded a call-site inventory that had drifted into a real contradiction
(dev's sign-off pattern listed Plan Step 4 rework as mandatory while
intelligent-approval listed it as conditional) — split into independent, lean
mechanisms with every call site stating its own criterion inline; (2) the
per-site criterion had inverted polarity ("materiality criterion" described the
auto-approve condition, not when review is required) — renamed to
"auto-approval conditions", and remaining lifecycle policy (routine-work
authorization, commit policy, archival, recording destination) was extracted
out of the patterns into SKILL.md/do-report-commit.md/06-document.md/
07-publish.md and each call site; (3) Ceremony/Frame's auto-approval conditions
were missing a case (ambiguous next transition could satisfy both the
auto-approve and escalate branches) — added a third condition. All landed via
bundle `1f148d52-c168-4ac9-9c92-fa323dc42e3a`. See `patch/REGISTRY.md` for all
four bundles.

| Name                           | Type      | Compare | Template Path                                                 | Deployed Path                                               |
| ------------------------------ | --------- | ------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| dev                            | skill     | content | `canonical/skills/dev/TEMPLATE.md`                            | `.claude/skills/dev/SKILL.md`                               |
| dev-announce-progress          | companion | content | `canonical/skills/dev/patterns/announce-progress.md`          | `.claude/skills/dev/patterns/announce-progress.md`          |
| dev-approval-sign-off          | companion | content | `canonical/skills/dev/patterns/approval-sign-off.md`          | `.claude/skills/dev/patterns/approval-sign-off.md`          |
| dev-approval-intelligent       | companion | content | `canonical/skills/dev/patterns/approval-intelligent.md`       | `.claude/skills/dev/patterns/approval-intelligent.md`       |
| dev-do-report-commit           | companion | content | `canonical/skills/dev/patterns/do-report-commit.md`           | `.claude/skills/dev/patterns/do-report-commit.md`           |
| dev-metrics                    | companion | content | `canonical/skills/dev/patterns/metrics.md`                    | `.claude/skills/dev/patterns/metrics.md`                    |
| dev-review-gate                | companion | content | `canonical/skills/dev/patterns/review-gate.md`                | `.claude/skills/dev/patterns/review-gate.md`                |
| dev-satellite-review           | companion | content | `canonical/skills/dev/patterns/satellite-review.md`           | `.claude/skills/dev/patterns/satellite-review.md`           |
| dev-session-continuity         | companion | content | `canonical/skills/dev/patterns/session-continuity.md`         | `.claude/skills/dev/patterns/session-continuity.md`         |
| dev-task-tracking              | companion | content | `canonical/skills/dev/patterns/task-tracking.md`              | `.claude/skills/dev/patterns/task-tracking.md`              |
| dev-write-confirm              | companion | content | `canonical/skills/dev/patterns/write-confirm.md`              | `.claude/skills/dev/patterns/write-confirm.md`              |
| dev-00-router                  | companion | content | `canonical/skills/dev/references/00-router.md`                | `.claude/skills/dev/references/00-router.md`                |
| dev-01-context-gathering       | companion | content | `canonical/skills/dev/references/01-context-gathering.md`     | `.claude/skills/dev/references/01-context-gathering.md`     |
| dev-02-ceremony                | companion | content | `canonical/skills/dev/references/02-ceremony.md`              | `.claude/skills/dev/references/02-ceremony.md`              |
| dev-03-plan                    | companion | content | `canonical/skills/dev/references/03-plan.md`                  | `.claude/skills/dev/references/03-plan.md`                  |
| dev-04-implement               | companion | content | `canonical/skills/dev/references/04-implement.md`             | `.claude/skills/dev/references/04-implement.md`             |
| dev-05-test                    | companion | content | `canonical/skills/dev/references/05-test.md`                  | `.claude/skills/dev/references/05-test.md`                  |
| dev-06-document                | companion | content | `canonical/skills/dev/references/06-document.md`              | `.claude/skills/dev/references/06-document.md`              |
| dev-constants                  | companion | content | `canonical/skills/dev/scripts/constants.mjs`                  | `.claude/skills/dev/scripts/constants.mjs`                  |
| dev-quality                    | companion | content | `canonical/skills/dev/scripts/quality.mjs`                    | `.claude/skills/dev/scripts/quality.mjs`                    |
| dev-quality.test               | companion | content | `canonical/skills/dev/scripts/quality.test.mjs`               | `.claude/skills/dev/scripts/quality.test.mjs`               |
| dev-timing                     | companion | content | `canonical/skills/dev/scripts/timing.mjs`                     | `.claude/skills/dev/scripts/timing.mjs`                     |
| dev-timing.test                | companion | content | `canonical/skills/dev/scripts/timing.test.mjs`                | `.claude/skills/dev/scripts/timing.test.mjs`                |
| dev-utils                      | companion | content | `canonical/skills/dev/scripts/utils.mjs`                      | `.claude/skills/dev/scripts/utils.mjs`                      |
| dev-intent                     | companion | content | `canonical/skills/dev/templates/intent.md`                    | `.claude/skills/dev/templates/intent.md`                    |
| dev-plan                       | companion | content | `canonical/skills/dev/templates/plan.md`                      | `.claude/skills/dev/templates/plan.md`                      |
| dev-report                     | companion | content | `canonical/skills/dev/templates/report.md`                    | `.claude/skills/dev/templates/report.md`                    |
| dev-stat                       | companion | content | `canonical/skills/dev/templates/stat.json`                    | `.claude/skills/dev/templates/stat.json`                    |
| dev-stat.schema                | companion | content | `canonical/skills/dev/templates/stat.schema.json`             | `.claude/skills/dev/templates/stat.schema.json`             |
| design                         | skill     | content | `canonical/skills/design/TEMPLATE.md`                         | `.claude/skills/design/SKILL.md`                            |
| design-approval-sign-off       | companion | content | `canonical/skills/design/patterns/approval-sign-off.md`       | `.claude/skills/design/patterns/approval-sign-off.md`       |
| design-approval-intelligent    | companion | content | `canonical/skills/design/patterns/approval-intelligent.md`    | `.claude/skills/design/patterns/approval-intelligent.md`    |
| design-announce-progress       | companion | content | `canonical/skills/design/patterns/announce-progress.md`       | `.claude/skills/design/patterns/announce-progress.md`       |
| design-compact-between-phases  | companion | content | `canonical/skills/design/patterns/compact-between-phases.md`  | `.claude/skills/design/patterns/compact-between-phases.md`  |
| design-context-resolution      | companion | content | `canonical/skills/design/patterns/context-resolution.md`      | `.claude/skills/design/patterns/context-resolution.md`      |
| design-design-architect-review | companion | content | `canonical/skills/design/patterns/design-architect-review.md` | `.claude/skills/design/patterns/design-architect-review.md` |
| design-design-oq-triage        | companion | content | `canonical/skills/design/patterns/design-oq-triage.md`        | `.claude/skills/design/patterns/design-oq-triage.md`        |
| design-design-quality-gate     | companion | content | `canonical/skills/design/patterns/design-quality-gate.md`     | `.claude/skills/design/patterns/design-quality-gate.md`     |
| design-do-report-commit        | companion | content | `canonical/skills/design/patterns/do-report-commit.md`        | `.claude/skills/design/patterns/do-report-commit.md`        |
| design-docs-writer-authoring   | companion | content | `canonical/skills/design/patterns/docs-writer-authoring.md`   | `.claude/skills/design/patterns/docs-writer-authoring.md`   |
| design-metrics                 | companion | content | `canonical/skills/design/patterns/metrics.md`                 | `.claude/skills/design/patterns/metrics.md`                 |
| design-multi-decision-split    | companion | content | `canonical/skills/design/patterns/multi-decision-split.md`    | `.claude/skills/design/patterns/multi-decision-split.md`    |
| design-satellite-review        | companion | content | `canonical/skills/design/patterns/satellite-review.md`        | `.claude/skills/design/patterns/satellite-review.md`        |
| design-session-continuity      | companion | content | `canonical/skills/design/patterns/session-continuity.md`      | `.claude/skills/design/patterns/session-continuity.md`      |
| design-task-tracking           | companion | content | `canonical/skills/design/patterns/task-tracking.md`           | `.claude/skills/design/patterns/task-tracking.md`           |
| design-waf-review              | companion | content | `canonical/skills/design/patterns/waf-review.md`              | `.claude/skills/design/patterns/waf-review.md`              |
| design-write-confirm           | companion | content | `canonical/skills/design/patterns/write-confirm.md`           | `.claude/skills/design/patterns/write-confirm.md`           |
| design-00-router               | companion | content | `canonical/skills/design/references/00-router.md`             | `.claude/skills/design/references/00-router.md`             |
| design-01-frame                | companion | content | `canonical/skills/design/references/01-frame.md`              | `.claude/skills/design/references/01-frame.md`              |
| design-02-research             | companion | content | `canonical/skills/design/references/02-research.md`           | `.claude/skills/design/references/02-research.md`           |
| design-03-evaluate             | companion | content | `canonical/skills/design/references/03-evaluate.md`           | `.claude/skills/design/references/03-evaluate.md`           |
| design-04-solution             | companion | content | `canonical/skills/design/references/04-solution.md`           | `.claude/skills/design/references/04-solution.md`           |
| design-05-review-gate          | companion | content | `canonical/skills/design/references/05-review-gate.md`        | `.claude/skills/design/references/05-review-gate.md`        |
| design-06-address-feedback     | companion | content | `canonical/skills/design/references/06-address-feedback.md`   | `.claude/skills/design/references/06-address-feedback.md`   |
| design-07-publish              | companion | content | `canonical/skills/design/references/07-publish.md`            | `.claude/skills/design/references/07-publish.md`            |
| design-constants               | companion | content | `canonical/skills/design/scripts/constants.mjs`               | `.claude/skills/design/scripts/constants.mjs`               |
| design-design-metrics          | companion | content | `canonical/skills/design/scripts/design-metrics.mjs`          | `.claude/skills/design/scripts/design-metrics.mjs`          |
| design-design-metrics.test     | companion | content | `canonical/skills/design/scripts/design-metrics.test.mjs`     | `.claude/skills/design/scripts/design-metrics.test.mjs`     |
| design-utils                   | companion | content | `canonical/skills/design/scripts/utils.mjs`                   | `.claude/skills/design/scripts/utils.mjs`                   |
| design-evaluate                | companion | content | `canonical/skills/design/templates/evaluate.md`               | `.claude/skills/design/templates/evaluate.md`               |
| design-frame                   | companion | content | `canonical/skills/design/templates/frame.md`                  | `.claude/skills/design/templates/frame.md`                  |
| design-report                  | companion | content | `canonical/skills/design/templates/report.md`                 | `.claude/skills/design/templates/report.md`                 |
| design-research                | companion | content | `canonical/skills/design/templates/research.md`               | `.claude/skills/design/templates/research.md`               |
| design-stat                    | companion | content | `canonical/skills/design/templates/stat.json`                 | `.claude/skills/design/templates/stat.json`                 |
| design-stat.schema             | companion | content | `canonical/skills/design/templates/stat.schema.json`          | `.claude/skills/design/templates/stat.schema.json`          |
| design-INTENT                  | companion | content | `canonical/skills/design/interfaces/INTENT.md`                | `.claude/skills/design/interfaces/INTENT.md`                |
| design-architecture            | companion | content | `canonical/skills/design/interfaces/architecture.md`          | `.claude/skills/design/interfaces/architecture.md`          |
| design-design                  | companion | content | `canonical/skills/design/interfaces/design.md`                | `.claude/skills/design/interfaces/design.md`                |
| design-efforts                 | companion | content | `canonical/skills/design/interfaces/efforts.md`               | `.claude/skills/design/interfaces/efforts.md`               |
| design-stack                   | companion | content | `canonical/skills/design/interfaces/stack.md`                 | `.claude/skills/design/interfaces/stack.md`                 |
| evolve                         | skill     | content | `canonical/skills/evolve/TEMPLATE.md`                         | `.claude/skills/evolve/SKILL.md`                            |
| evolve-task-tracking           | companion | content | `canonical/skills/evolve/patterns/task-tracking.md`           | `.claude/skills/evolve/patterns/task-tracking.md`           |
| evolve-00-router               | companion | content | `canonical/skills/evolve/references/00-router.md`             | `.claude/skills/evolve/references/00-router.md`             |
| evolve-01-reflect              | companion | content | `canonical/skills/evolve/references/01-reflect.md`            | `.claude/skills/evolve/references/01-reflect.md`            |
| evolve-02-triage               | companion | content | `canonical/skills/evolve/references/02-triage.md`             | `.claude/skills/evolve/references/02-triage.md`             |
| evolve-03-draft                | companion | content | `canonical/skills/evolve/references/03-draft.md`              | `.claude/skills/evolve/references/03-draft.md`              |
| evolve-04-validate             | companion | content | `canonical/skills/evolve/references/04-validate.md`           | `.claude/skills/evolve/references/04-validate.md`           |
| evolve-05-adopt                | companion | content | `canonical/skills/evolve/references/05-adopt.md`              | `.claude/skills/evolve/references/05-adopt.md`              |
| evolve-improvement             | companion | content | `canonical/skills/evolve/interfaces/improvement.md`           | `.claude/skills/evolve/interfaces/improvement.md`           |
| evolve-reflection              | companion | content | `canonical/skills/evolve/interfaces/reflection.md`            | `.claude/skills/evolve/interfaces/reflection.md`            |
| evolve-validation              | companion | content | `canonical/skills/evolve/interfaces/validation.md`            | `.claude/skills/evolve/interfaces/validation.md`            |
| war                            | skill     | content | `canonical/skills/war/TEMPLATE.md`                            | `.claude/skills/war/SKILL.md`                               |
| war-present-and-save           | companion | content | `canonical/skills/war/patterns/present-and-save.md`           | `.claude/skills/war/patterns/present-and-save.md`           |
| war-scope-resolution           | companion | content | `canonical/skills/war/patterns/scope-resolution.md`           | `.claude/skills/war/patterns/scope-resolution.md`           |
| war-01-design                  | companion | content | `canonical/skills/war/references/01-design.md`                | `.claude/skills/war/references/01-design.md`                |
| war-02-implementation          | companion | content | `canonical/skills/war/references/02-implementation.md`        | `.claude/skills/war/references/02-implementation.md`        |
| war-design-report              | companion | content | `canonical/skills/war/templates/design-report.md`             | `.claude/skills/war/templates/design-report.md`             |
| war-implementation-report      | companion | content | `canonical/skills/war/templates/implementation-report.md`     | `.claude/skills/war/templates/implementation-report.md`     |
| where-we-are                   | skill     | content | `canonical/skills/where-we-are/TEMPLATE.md`                   | `.claude/skills/where-we-are/SKILL.md`                      |
| where-we-are-report-template   | companion | content | `canonical/skills/where-we-are/report-template.md`            | `.claude/skills/where-we-are/report-template.md`            |
| architect                      | agent     | content | `canonical/agents/architect/TEMPLATE.md`                      | `.claude/agents/architect.md`                               |
| auth                           | agent     | content | `canonical/agents/layer/TEMPLATE.md`                          | `.claude/agents/auth.md`                                    |
| docs-writer                    | agent     | content | `canonical/agents/docs-writer/TEMPLATE.md`                    | `.claude/agents/docs-writer.md`                             |
| infra                          | agent     | content | `canonical/agents/layer/TEMPLATE.md`                          | `.claude/agents/infra.md`                                   |
| onboarding                     | agent     | content | `canonical/agents/onboarding/TEMPLATE.md`                     | `.claude/agents/onboarding.md`                              |
| product-architect              | agent     | content | `canonical/agents/product-architect/TEMPLATE.md`              | `.claude/agents/product-architect.md`                       |
| web                            | agent     | content | `canonical/agents/layer/TEMPLATE.md`                          | `.claude/agents/web.md`                                     |
| x-ray                          | skill     | content | `canonical/skills/x-ray/TEMPLATE.md`                          | `.claude/skills/x-ray/SKILL.md`                             |
| x-ray-claude-in-chrome-setup   | companion | content | `canonical/skills/x-ray/references/claude-in-chrome-setup.md` | `.claude/skills/x-ray/references/claude-in-chrome-setup.md` |
| scrum-master                   | agent     | content | `canonical/agents/scrum-master/TEMPLATE.md`                   | `.claude/agents/scrum-master.md`                            |
