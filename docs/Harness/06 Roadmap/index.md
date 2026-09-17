# Roadmap

_How the bootstrap evolves from a git template into a distributable, composable platform._

---

## 1. Registry Distribution

_From a copied git folder to a versioned, installable package._

**Current state**

The bootstrap is distributed by copying `docs/Harness/package/` into a new repo. This works but:

- No versioning — projects drift from the template immediately
- No updates — improvements don't propagate to existing projects
- No discovery — teams have to know the bootstrap exists

**Target state**

```
yarn add @artisyn-harness/bootstrap
```

- Semantic versioning — projects pin a version and upgrade deliberately
- Changelog — teams can see what changed and why
- Registry — internal npm / GitHub Packages / Artifactory

> Open questions: which registry, monorepo structure, CLI vs library, migration path for existing projects

---

## 2. Codex / Kiro Alignment

_Positioning the harness relative to emerging AI-native development tools._

The AI dev tooling landscape is converging around shared concepts:

- **OpenAI Codex** — AI agent with repo access, task execution, PR generation
- **Kiro** — spec-driven AI development (specs → hooks → agent tasks)
- **Claude Code** — the current harness runtime

These tools share primitives: agent context files, skill/hook systems, structured lifecycles.

| Harness concept            | Codex / Kiro equivalent                 | Alignment action                                |
| -------------------------- | --------------------------------------- | ----------------------------------------------- |
| `CLAUDE.md`                | Agent context / system prompt file      | Standardise format, make tool-agnostic          |
| Skills (`.claude/skills/`) | Kiro hooks / Codex tasks                | Extract to a neutral skill format               |
| Agents (`@bff`, `@web`...) | Codex environments / Kiro agent configs | Abstract agent definitions                      |
| Memory                     | Persistent context / spec files         | Align memory schema with spec-driven approaches |

> Open questions: what does a "tool-agnostic harness" look like? What is the minimum common layer?

---

## 3. Speckkit / Superpowers

_Injectable capability packs that extend the harness for specific domains or contexts._

The base bootstrap is intentionally thin — it covers the universal SDLC (design, dev, test, document, operate). Domain-specific capabilities should be injectable, not baked in.

A **capability pack** is a versioned bundle that adds:

- Domain skills (e.g. `/mobile-design`, `/data-pipeline-plan`)
- Domain agents (e.g. `@ios`, `@spark`, `@ml`)
- Domain conventions (e.g. a mobile-specific CLAUDE.md section)
- Domain HLD templates (e.g. a pre-filled mobile architecture overview)

**Example packs**

| Pack                      | Adds                                                           |
| ------------------------- | -------------------------------------------------------------- |
| `@harness/aws-serverless` | Lambda patterns, SAM skills, `/sam-deploy` command             |
| `@harness/mobile-ios`     | Swift conventions, `@ios` agent, Xcode build skills            |
| `@harness/data-platform`  | dbt skills, `@spark` agent, pipeline design templates          |
| `@harness/presales`       | SA playbook skills, discovery templates, estimation frameworks |

> Open questions: injection mechanism (CLI flag? CLAUDE.md import? skill discovery?), pack authoring spec, versioning strategy

---

## 4. Adopt → Validate → Improve

_The feedback loop that makes the harness get better with every project._

```
Adopt         → Validate          → Improve
────────────────────────────────────────────
New project     Run /war            /evolve reflect
uses bootstrap  Run /where-we-are   /evolve triage
                PR reviews          /evolve validate
                Retrospectives      /evolve adopt
                                    patch harvest → other projects
```

**Adopt**

- SA or tech lead bootstraps a new project from the registry
- Team runs first `/dev` and `/design` cycles
- Friction points are noted (missing skills, wrong conventions, agent scope issues)

**Validate**

- `/war implementation` — AWS Well-Architected audit of the codebase
- `/war design` — WAF audit of the HLD
- `/where-we-are` — gap report surfaces documentation debt
- PR reviews flag harness deviations

**Improve**

- Friction → `/evolve reflect` → `/evolve triage` → draft candidate
- Candidate validated → `/evolve validate` → `/evolve adopt` into this project's harness
- Cross-project sharing (a bootstrap-level concern, not part of Evolve) goes through `patch harvest` / `patch apply`
- Next project gets the improvement via a bootstrap PR and semver bump

> Open questions: who owns the bootstrap registry? What is the PR / review process for skill graduation?

---

## 5. Gaps to close

The comparison and capability audit identified the following work. These are ordered by risk to the harness's central promise: project context should remain useful and connected to delivery.

| Priority | Gap                                                           | Roadmap outcome                                                                                                                                     | Suggested measure                                                                    |
| -------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| P0       | Context consistency is instructed rather than guaranteed      | Add source-of-truth checks across HLD, LLD, reports, decisions and code; detect stale, missing and contradictory context before execution continues | Contradictions caught; stale-context escapes; reconciliation success rate            |
| P0       | Skill behavior is not covered by a presented test suite       | Create a pressure-test suite for every shipped skill: intended task, negative trigger, regression caller, tool boundary and versioned verdict       | Skills with passing behavioral evidence; regressions caught before activation        |
| P0       | Design handoffs have contract drift                           | Unify selected-artifact paths, review gates, publication completion and tracker-free local IDs; add minimal-design contract tests                   | Invalid handoffs blocked; local designs completed without tracker errors             |
| P1       | Product discovery is upstream of Artisyn                      | Define an explicit intake contract and integrations for PRD, prioritization, product decisions and approved tickets                                 | Intake completeness; requirements changed after Design begins                        |
| P1       | Deployment and production operations are outside the core     | Decide whether to integrate release/rollback, monitoring, incidents and SLO evidence or document the boundary as a supported integration            | Deployment evidence coverage; rollback drill success                                 |
| P1       | History is archived better than it is retrieved               | Add relevance-aware history selection, conflict handling and citations for prior decisions, reports and solved problems                             | Relevant-history precision; missed relevant decisions; contradiction rate            |
| P1       | Statistics are local, without aggregate visibility            | Build a provenance-preserving project/portfolio aggregation layer for timing, waits, quality, rework and cost                                       | Dashboard completeness; unknown-value rate; attribution coverage                     |
| P1       | Human gates may impose too much ceremony                      | Add risk-based policies for lightweight changes while preserving stronger gates for architecture, security and infrastructure work                  | Approval count; wait time; escaped defects by policy tier                            |
| P1       | Cross-host behavior is not proven at parity                   | Run real smoke scenarios on each claimed host and publish supported/unsupported capability differences                                              | Host scenario pass rate; documented exceptions                                       |
| P2       | Improvement sharing is portable but not centrally coordinated | Define fleet rollout, staged adoption, rollback and ownership for canonical patches                                                                 | Adoption success; rollback success; project customizations preserved                 |
| P2       | No independent benchmark supports superiority claims          | Run matched changes across Artisyn and selected alternatives with pinned revisions, models and tests                                                | Correctness, architecture drift, human interventions, elapsed time and measured cost |

The intended sequence is: make context and skill behavior testable, remove internal contract drift, then add retrieval and aggregate evidence. Deployment integrations and fleet operations should follow explicit ownership decisions rather than quietly expanding the harness's scope.
