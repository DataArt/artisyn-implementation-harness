---
id: fceb8241
aside: false
purpose: Map nine tools and their capability-depth ratings onto the six SDLC stages
keywords: [SDLC stages, tool coverage, capability depth, maturity labels]
---

# Tools Across the Six SDLC Stages

The same six stages used in the [Story](<../../The Story/00 Software Development Lifecycle.md#1-the-wheel-works>): **Analysis → Design → Implementation → QA → Deployment → Maintenance**. These are SDLC stages, not the six internal steps of Artisyn's Dev workflow.

![Nine tools across six SDLC stages, with features and assessed capability depth](/images/context/sdlc-tool-coverage.svg)

[Open the full-size diagram](/images/context/sdlc-tool-coverage.svg).

## How to read maturity

The labels assess **documented capability depth for the listed features**, not overall product maturity, adoption, reliability, or verified delivery performance. A narrow feature can reach M3 without covering the whole stage. Ratings are our interpretation of the [source-linked comparison](<./02 Feature Comparison.md>) and [Artisyn audit](<./03 Artisyn Capability Audit.md>), dated 17 September 2026; no new execution benchmark was run.

| Label                    | Meaning                                                                | Evidence required                                         |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| M1 — Task assistance     | Helps with a bounded activity                                          | Explicit practice or skill for that activity              |
| M2 — Repeatable workflow | Defines a sequence with outputs, checks or handoffs                    | Documented workflow beyond a single task                  |
| M3 — Maintained context  | Makes durable constraints, records or feedback available to later work | Workflow plus explicit persistent context/reuse mechanism |
| E — External/enabling    | Provides inputs or a handoff; host or another system owns execution    | Does not establish an end-to-end stage workflow           |
| — Not established        | Reviewed sources do not establish the stage capability                 | Not a claim that the tool cannot do it                    |

This loosely parallels the Story's Code AI → Workflow AI → Assisted AI adoption model, but evaluates specific documented mechanisms. Team adoption maturity cannot be inferred from installing a tool. M3 does not imply enforced policy, automated learning, or comprehensive coverage.

## Coverage and features

The tables reproduce the diagram as readable text. Tool names retain the source scope established in the comparison: BMAD core/selected workflows, Agent OS v3, Matt Pocock's skills, and Kiro's reviewed specs/steering capabilities. Optional modules and host integrations are not silently counted as core features.

### Analysis

Needs, requirements and acceptance criteria.

| Tool                 | Level | Documented feature / boundary                   |
| -------------------- | ----- | ----------------------------------------------- |
| Artisyn              | M1    | Clarify supplied intent and acceptance criteria |
| BMAD                 | M3    | Product brief, PRD and requirement identities   |
| Superpowers          | M2    | Clarify problem and approve change scope        |
| Compound Engineering | M2    | Brainstorm and frame product contracts          |
| Spec Kit             | M2    | Specify requirements and resolve ambiguity      |
| OpenSpec             | M3    | Proposals and persistent requirement deltas     |
| Agent OS             | M2    | Shape specifications and product context        |
| Matt’s skills        | M2    | Clarify intent; create specs and tickets        |
| Kiro                 | M2    | Requirements and acceptance criteria            |

### Design

Architecture, decisions and solution structure.

| Tool                 | Level | Documented feature / boundary                 |
| -------------------- | ----- | --------------------------------------------- |
| Artisyn              | M3    | Evaluate options; govern HLD and solution     |
| BMAD                 | M3    | Shared architecture spine and decision IDs    |
| Superpowers          | M2    | Architectural design and execution plan       |
| Compound Engineering | M3    | Plan decisions using prior solution knowledge |
| Spec Kit             | M3    | Technical plan under project constitution     |
| OpenSpec             | M3    | Change design linked to current system specs  |
| Agent OS             | M3    | Inject shared standards into shaped specs     |
| Matt’s skills        | M3    | Domain model, context map and ADRs            |
| Kiro                 | M3    | Design documents with persistent steering     |

### Implementation

Code, tasks and engineering execution.

| Tool                 | Level | Documented feature / boundary                  |
| -------------------- | ----- | ---------------------------------------------- |
| Artisyn              | M3    | Layer agents, HLD constraints, step approvals  |
| BMAD                 | M3    | Story delivery under shared project context    |
| Superpowers          | M2    | Task agents, TDD and spec/quality reviews      |
| Compound Engineering | M3    | Planned delivery informed by reusable lessons  |
| Spec Kit             | M3    | Dependency tasks and constitution-led delivery |
| OpenSpec             | M3    | Apply change tasks against system specs        |
| Agent OS             | E     | Standards support; host owns execution         |
| Matt’s skills        | M2    | Implement tickets with TDD and review          |
| Kiro                 | M3    | Execute spec tasks using project steering      |

### QA

Verification, review and acceptance.

| Tool                 | Level | Documented feature / boundary                   |
| -------------------- | ----- | ----------------------------------------------- |
| Artisyn              | M3    | Checks, deviation ledger and quality statistics |
| BMAD                 | M2    | Testing/review workflows; module-dependent      |
| Superpowers          | M2    | TDD, debugging and independent review           |
| Compound Engineering | M2    | Specialist review and planned validation        |
| Spec Kit             | M2    | Analyze consistency; converge code with spec    |
| OpenSpec             | M2    | Optional change and implementation verification |
| Agent OS             | E     | Standards inform checks owned by host           |
| Matt’s skills        | M2    | TDD, debugging and review practices             |
| Kiro                 | M2    | Spec validation; surface-dependent testing      |

### Deployment

Release execution, rollout and rollback.

| Tool                 | Level | Documented feature / boundary                  |
| -------------------- | ----- | ---------------------------------------------- |
| Artisyn              | E     | Infra work/evidence; no general release engine |
| BMAD                 | —     | Release/rollback mechanism not established     |
| Superpowers          | E     | Branch/PR handoff is not production rollout    |
| Compound Engineering | —     | Release/rollback mechanism not established     |
| Spec Kit             | —     | Release/rollback mechanism not established     |
| OpenSpec             | —     | Archive/sync is not application deployment     |
| Agent OS             | E     | Host and external delivery pipeline            |
| Matt’s skills        | —     | Release/rollback mechanism not established     |
| Kiro                 | —     | Not established by reviewed spec/steering docs |

### Maintenance

Engineering evolution; operations shown separately.

| Tool                 | Level | Documented feature / boundary                    |
| -------------------- | ----- | ------------------------------------------------ |
| Artisyn              | M3    | History, drift checks, Evolve and patch recipes  |
| BMAD                 | M3    | Refresh context and shared architectural records |
| Superpowers          | M2    | Debugging and tested skill improvements          |
| Compound Engineering | M3    | Capture solutions; retrieve lessons next time    |
| Spec Kit             | M3    | Maintain constitution; converge changed code     |
| OpenSpec             | M3    | Archive changes; merge into current specs        |
| Agent OS             | M3    | Discover, maintain and share standards           |
| Matt’s skills        | M3    | Refactor architecture; maintain domain/ADRs      |
| Kiro                 | M3    | Maintain specs and persistent project steering   |

## Boundaries that matter

- **Analysis:** Artisyn elaborates supplied engineering intent. BMAD's product brief and PRD workflow reaches further upstream. Specification creation alone does not establish customer research or portfolio prioritisation.
- **Design:** M3 includes different mechanisms: Artisyn's HLD governance, BMAD's shared architecture, OpenSpec's current system specifications, or persistent standards/ADRs. These are not interchangeable levels of architectural rigor.
- **Implementation and QA:** Persistent project context is useful, but does not prove stronger tests or better code. Superpowers' M2 execution/testing rating recognizes its explicit workflow; it does not deny repository context or rank it below Artisyn on quality.
- **Deployment:** A release ZIP for the harness, a completed branch, an archived specification, and application rollout are different things. This research does not establish a general production deployment/rollback workflow across these tools. Pair the engineering workflow with an explicitly evaluated delivery pipeline.
- **Maintenance:** The diagram rates engineering evolution and knowledge maintenance. It does not establish production observability, on-call incident handling, SLO enforcement, or continuous compliance for any tool.

Artisyn's M3 labels describe source-level mechanisms with [known implementation gaps](<./03 Artisyn Capability Audit.md#implementation-gaps>). The audited scripts support lifecycle records; they do not validate the quality of every architectural judgment or guarantee that the agent obeys every gate.
