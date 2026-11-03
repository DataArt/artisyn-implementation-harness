---
id: 1ff56a70
purpose: Track how the bootstrap evolves from a copied git template into a distributable, composable platform
keywords: [roadmap, registry distribution, harness-bootstrap, gaps]
---

# Harness Roadmap

_How the bootstrap evolves from a git template into a distributable, composable platform._

---

## 1. Registry Distribution

_From a copied git folder to a versioned, installable package._

**Current state**

The bootstrap is distributed as a versioned ZIP (`releases/harness-bootstrap/`, built from `.canonical-implementation-harness/`), extracted into a new repo and installed with `/harness-bootstrap launch`. `patch harvest`/`patch apply` let an installed project pull in later canonical updates. This works but:

- No registry — teams have to know the bootstrap exists and fetch the ZIP manually
- No single-command upgrade — `patch apply` works, but there's no `yarn add`-style pull

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

The [capability audit](<../01 Explore/03 Artisyn Capability Audit.md>) and engineering feedback identify two connected needs: keep project context useful and reduce the attention required to operate the harness. The work below builds on existing intelligent approval, artifact interfaces, lifecycle scripts and Evolve; it does not assume these mechanisms need to be invented.

These are proposed deliverables, not shipped capabilities or dated commitments. **P0** establishes trustworthy behavior and removes contract conflicts; **P1** improves daily use; **P2** is conditional expansion after the core demonstrates value. Completion requires the evidence described in each section.

### 5.1 Refine existing sign-off and intelligent approval — P0

**Already in place:** sign-off protects explicit human decisions; intelligent approval allows designated checkpoints to continue when predefined conditions are met and records why. The improvement is to review where each mechanism applies, especially repeated approval of unchanged content. Sign-off currently includes content decisions, manual execution and external confirmation.

**Deliver:** inventory every checkpoint with its decision, authorization scope, evidence and escalation conditions. Reuse an approval when the approved content is unchanged; present material changes as a delta. Separate human decisions from facts that an authoritative tool can verify, and separate permission to act from a requirement that a human type the command. Preserve explicitly guarded operations and required human decisions.

**Done when:** scenarios cover unchanged persisted plans, material plan changes, inconclusive evidence and guarded actions. The first proceeds without duplicate approval; the others follow their explicit policy. Approval scope survives resumption. Record which gates cause corrections, rejected work or changed decisions, alongside waiting time. Change gate policies explicitly; agents must not silently downgrade existing sign-offs.

### 5.2 Behavioral tests for core skills — P0

**Problem.** Evolve defines validation, but a completed behavioral suite for shipped skills is not presented. Passing script tests does not establish that an agent follows the workflow.

**Deliver:** begin with Dev, Design and Evolve scenarios for intended tasks, unrelated tasks that should not trigger the skill, ambiguous intent, stale context, scope changes and interrupted work. Include baseline/pressure cases and affected callers. Record skill revision, model, host, inputs, actual actions, verdict and limitations; distinguish runtime tests from manual walkthroughs.

**Done when:** a runnable suite and actual results exist for the core workflows, known failures are visible, and meaningful behavior regressions block adoption. Expand coverage to remaining shipped skills after the initial suite is usable. Track scenario coverage and regressions caught rather than claiming comprehensive validation from test count alone.

### 5.3 Consistent artifact contracts and publication — P0

**Problem.** Design supports selected artifacts, but some consumers still assume fixed files. Artifact names/paths, local IDs and publication completion also have conflicting instructions.

**Deliver:** one selected-artifact contract shared by solution creation, review, publication and Dev intake. Finalize publication only after required work succeeds; carry tracker identity explicitly so local designs can complete without tracker calls. Identify the authoritative distribution and expose active/canonical/package version differences.

**Done when:** minimal and full designs pass through the entire handoff, missing required artifacts fail clearly, local-ID publication works, and failed publication cannot leave a completed record. Contract checks detect incompatible producers and consumers.

### 5.4 Strengthen existing deviation audits and context freshness — P1

**Already in place:** Design and Dev include architecture/alignment review, deviation handling and documentation reconciliation. Approved context constrains implementation, and the delivery records preserve findings and decisions. This item improves those mechanisms rather than introducing reconciliation.

**Improve:** verify which source revisions each audit or approval covers. Where not already captured, record that provenance and detect relevant changes afterward. For example, if the HLD changes after plan approval and before implementation resumes, rerun the affected audit and resolve its findings. Reuse existing deviation records and review flows; do not introduce a parallel audit. Check missing references and superseded decisions where mechanical validation is useful, with semantic review for unresolved meaning.

**Done when:** scenarios with changed, missing and conflicting context produce an explicit resolution or escalation; unrelated changes do not cause unnecessary stops. Measure stale-context escapes and contradictions caught. The target is detectable drift and evidence-backed reconciliation, not a guarantee that every architectural statement is correct.

### 5.5 Lightweight delivery path — P1

**Problem.** Small, bounded changes may pay the same interruption and documentation cost as architectural work.

**Deliver:** a minimal path with proportionate artifacts and checks, using the approval policy from 5.1. Define escalation conditions for changed acceptance criteria, consequential architectural decisions, security boundaries and external effects. Reuse existing context instead of requiring fresh design documents for every change.

**Done when:** small fixes complete with fewer human interruptions, while scenarios that expand scope reliably escalate. Compare approval count, human attention, elapsed time, verification quality and escaped defects against the full workflow.

### 5.6 Refine existing interfaces and progressive disclosure — P1

**Already in place:** Design uses adaptive artifact interfaces that define required coverage without prescribing fixed headings. Skills route to separate references and patterns so relevant detail can be loaded as needed. These are existing design choices, not missing capabilities.

**Improve:** identify actual duplication, unnecessary reference loading and execution instructions that contradict the flexibility of the interfaces. Simplify only those cases, keeping explicit inputs, outcomes, constraints and escalation conditions. Preserve exact schemas for machine-consumed state and statistics. Validate whether each proposed simplification helps before making it a general rule.

**Done when:** the behavioral suite preserves required outcomes after simplification, several valid artifact compositions pass the same contract, and irrelevant references are not routinely loaded. Measure context volume and delivery results; do not treat fewer tokens alone as success.

### 5.7 Extend existing evidence capture and generated reports — P1

**Already in place:** lifecycle scripts record timings, check outcomes and state, generate report sections and preserve unknown values. The metrics instructions explicitly prohibit manually duplicating generated rows. Reports already support delivery review and continuity.

**Improve:** trace a real workflow to find uncaptured events, inconsistent invocation or genuinely duplicated bookkeeping. Extend the existing collectors/renderers only where those gaps occur. Keep decisions and interpretation agent-authored; use scripts for mechanically available evidence. Review report fields with their consumers before removing or adding content.

**Done when:** captured evidence and report totals agree, interrupted or missing observations remain explicit, and routine telemetry is not copied manually between artifacts. Preserve provenance and unknown values; do not label AI workflow time as human labour. Measure bookkeeping effort and report usefulness during recovery/review.

### 5.8 Validate and extend existing idempotency and recovery — P1

**Already in place:** stage idempotency checks, durable work records, session-continuity instructions and metric recovery support resumption without replaying completed work. The remaining task is to test their coverage across interruptions, particularly around external side effects; absence of such test evidence does not mean the recovery mechanism is absent.

**Improve:** inject interruptions immediately before and after ticket creation, publication and phase transitions. Verify existing checks preserve approval scope and reconcile actual state before retrying. Add action identity or checkpoints only where the scenarios expose a gap. When an external result cannot be established, expose the uncertainty rather than assuming success or repeating the action.

**Done when:** failure scenarios around ticket creation, publication and phase transitions resume without duplicate external actions, lost decisions or false completion. Test interrupted transitions in addition to clean runs.

### 5.9 Validate selection of existing Stories history — P1

**Already in place:** `docs/Stories/` and its archive preserve design and implementation history, decisions, reports and associated evidence. Historical context is part of the harness's context model. This item validates how well later work selects and interprets that existing history.

**Improve:** use follow-up tasks with known relevant Stories, distracting records and superseded decisions to test the current selection process. Record which sources were used and whether their decisions remain applicable. Improve links, discovery instructions or indexing only where measured misses justify it; a separate memory service is not a prerequisite.

**Done when:** later tasks retrieve consequential history, distinguish current decisions from superseded ones and expose unresolved conflicts. Track missed relevant decisions, retrieval precision and whether the retrieved material changes the outcome.

### 5.10 Pilot workflow efficiency and approval usefulness — P1

**Purpose:** use a small engineering pilot to decide which workflow steps to keep, simplify or make conditional. Existing statistics describe what happened; this pilot interprets them together with correctness and developer feedback. It is an evaluation activity, not a new harness capability or a claim that the current process has no value.

**Deliver:** start with a bounded bug fix and an architectural change, each followed by a related task that can benefit from history. Compare the current workflow with one proposed refinement, such as removing duplicate approval of unchanged content. Use comparable starting states, the same model/host and task criteria, and the existing statistics/reports. Record developer attention, approval waits, substantive corrections, correctness and drift. Repeat enough to expose variability rather than declaring a winner from one run.

**Done when:** publish a short decision record with observations, limitations and the resulting policy decision. For example: removing a repeated sign-off reduced interruptions while the tests still caught material plan changes—or it missed a consequential change, so the gate needs adjustment. A broader host-only/context-only/full-workflow or competitor benchmark can follow later; it is not required to make this first improvement. Do not use the feature-matrix score as performance evidence.

### 5.11 Upstream requirements intake — P1

**Problem.** Product discovery is upstream, and supplied requirements may lack provenance, acceptance criteria or a decision owner.

**Deliver:** a small intake contract linking tickets to approved requirements/product decisions, constraints, ownership and unresolved questions. Define how changed requirements invalidate affected work. Start with configured integrations rather than building a new product-discovery platform.

**Done when:** incomplete inputs trigger targeted clarification and requirement changes remain traceable through design and implementation. Measure intake-related rework and missed requirement changes.

### 5.12 Verified host support — P1

**Problem.** Adaptation recipes do not prove equivalent behavior across coding-agent hosts.

**Deliver:** real smoke scenarios for each claimed host covering context loading, delegation, approval, checks and resumption. Publish capability differences and supported fallbacks. Keep these scenarios aligned with the runtime work in section 2.

**Done when:** each support claim has a tested host/version and recorded results; unavailable capabilities are visible before work begins. Mocked contract tests remain useful but are labeled separately from live compatibility checks.

### 5.13 Aggregate statistics — P2

**Problem.** Work-item records do not yet provide reliable project or portfolio trends.

**Deliver:** start with a read-only project summary over existing records, preserving provenance, coverage and unknowns. Expand to portfolio views and cost attribution only when collection quality and actual users justify it.

**Done when:** aggregate totals reconcile to underlying work items, incompatible or incomplete data is identified, and a real review decision uses the summary. Defer a separate dashboard platform until that value is demonstrated.

### 5.14 Deployment and operations handoff — P2

**Problem.** Implementation completion does not establish application rollout, rollback readiness or production health.

**Deliver:** define the boundary and evidence handoff to an existing delivery/operations system: artifact version, release decision, rollout status, rollback reference and operational owner. Pilot one configured integration if a project needs it; retain deployment authorization in the appropriate system.

**Done when:** one end-to-end example links delivery evidence to actual rollout/rollback outcomes without treating a PR or archived specification as a deployment. A general release engine or observability platform is not committed by this item.

### 5.15 Controlled cross-project updates — P2

**Problem.** Portable patch recipes exist, but coordinated adoption across projects is not demonstrated.

**Deliver:** first verify staged patch adoption and rollback on a small set of differently personalized projects. Record owners, baselines, conflicts and validation results. Consider fleet orchestration only after this workflow is reliable and demand exists.

**Done when:** successful adoption and rollback preserve project customization; partial/conflicting updates remain visible. Connect the result to the distribution work in section 1 instead of introducing a parallel update mechanism.

### Delivery sequence

Start with **5.1–5.3**: refine the existing approval mechanisms, establish behavioral evidence and fix artifact contracts. Use that foundation to trial the lightweight path and targeted instruction simplification. Validate existing deviation audits, evidence capture, recovery and Stories selection; extend them where scenarios demonstrate a gap. Use the small pilot in 5.10 to assess proposed changes. Prioritize P2 expansion when observed needs justify it.
