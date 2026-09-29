# Solution artifact interfaces

This folder defines adaptive interfaces for the Design lifecycle's Solution phase.
The interfaces specify the questions an artifact must answer; they do not prescribe
headings, diagrams, paragraph counts, or a fixed system topology. Read
`Documentation/01 Principles.md` for presentation, readability and diagram rules.

## Selection

Select the smallest set of interfaces that answers the framed problem. Do not create
an empty artifact merely because a template exists. Record selected and intentionally
omitted interfaces in the design report, with the applicability decision and evidence.

## Preliminary concern scan

Before selecting artifacts, scan the framed problem, affected boundaries and existing
HLD/LLD/NFR documents for concerns that could change the solution. This is an
applicability decision, not a requirement to add a section or invent a requirement.
Mark each concern as **material**, **informational**, or **not applicable**, with a
short evidence-backed reason in the design report. A material concern must be
addressed by a selected artifact, an explicit design decision, or a linked existing
requirement. Keep the concern scan in the report; do not copy an empty checklist into
published solution files.

| Concern                      | Check whether the solution changes or depends on                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Boundaries and ownership     | System/container/component responsibility, deployment topology, trust boundary, team ownership or external dependency |
| User and business behavior   | Actors, journeys, business rules, accessibility, interaction states or acceptance outcomes                            |
| Data and state               | Data ownership, schema, lifecycle, consistency, privacy, retention, migration or event ordering                       |
| Interfaces and compatibility | API, event, command, file, UI, version, backward-compatibility or integration contract                                |
| Security and privacy         | Identity, authorization, secrets, threat surface, encryption, auditability or regulatory handling                     |
| Reliability and recovery     | Failure modes, retries, idempotency, availability, recovery, rollback or data-loss tolerance                          |
| Performance and capacity     | Latency, throughput, concurrency, payload, resource limits, scaling or cost-performance trade-offs                    |
| Operations and delivery      | Build, configuration, observability, deployment, migration, feature flags, support or ownership procedure             |
| Cost and licensing           | Resource consumption, usage-based pricing, licensing, vendor commitment or budget constraint                          |
| Compliance and policy        | Residency, retention, accessibility, organizational policy or platform constraint                                     |
| Evolution and migration      | Incremental rollout, coexistence, deprecation, versioning, rollback or future extension                               |

Use the project's actual vocabulary and add a concern when the problem introduces
one. Reuse approved NFR targets and architecture constraints; the scan identifies
impact and missing decisions, while HLD/LLD/NFR remain the authoritative destinations
for their respective content. An unaddressed material concern blocks the Solution
review even when every selected artifact is otherwise complete.

| Interface         | Select when                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `architecture.md` | System, container, deployment or responsibility boundaries change                             |
| `design.md`       | Behavior, state, contracts, algorithms or implementation structure change                     |
| `stack.md`        | A technology, platform, dependency or compatibility decision is required                      |
| `efforts.md`      | The change needs implementation slices, sequencing, migration, rollout, cost or risk analysis |

Add a focused artifact when these interfaces cannot express the problem clearly:
for example a data model, migration plan, threat model, UI flow, deployment view or
recovery exercise. The new artifact must declare its purpose, scope, evidence,
decisions and verification method. Do not force unrelated concerns into one of the
four interfaces.

## Shared contract

Every selected artifact must make its scope, affected boundaries, important behavior
or flow, settled decisions, evidence and verification discoverable. Separate:

- observed current behavior;
- evaluated alternatives and trade-offs;
- confirmed target decisions; and
- implementation obligations and open decisions recorded externally.

Published solution artifacts contain supported statements and confirmed decisions.
Unresolved questions, rejected alternatives and missing evidence stay in the design
report or decision record. An artifact may state that a concern is not applicable,
with a reason in the report, rather than adding an empty section.

Reuse existing HLD, LLD and NFR documents by reference. Describe only the delta this
solution introduces; do not duplicate architecture or requirements. Identify the
downstream HLD/LLD/NFR documents that must change during implementation or publish.

## Choosing an expression

Each interface offers optional presentation ideas and examples of useful compositions.
They are inspiration, not an output checklist or required section order. Choose a
representation for the question it answers, and omit it when it adds no information.
Apply the existing Documentation Principles for formatting and diagram conventions.
The semantic coverage above remains the contract; a polished diagram alone does not
satisfy it. Examples illustrate structure, not approved technologies or requirements.

| Reader's question                                       | Possible expression                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| What owns each responsibility and how do parts connect? | Boundary/component diagram with a responsibility and contract table           |
| What happens in a concrete scenario?                    | Sequence diagram with the material failure or recovery branch                 |
| Which transitions are allowed?                          | State diagram with triggers, guards and outcomes                              |
| What does the user see, decide and do?                  | UI flow or mockup with interaction and accessibility behavior                 |
| What crosses a boundary?                                | API, event, command or schema example with validation and compatibility rules |

## Acceptance criteria

The reviewer checks that the selected artifact set answers the problem, contains no
empty boilerplate, uses evidence or confirmed decisions for claims, shows relevant
flows and boundaries, and gives implementers concrete obligations and verification.
The presence of a prescribed heading, diagram or non-empty table is not acceptance
evidence. Run the independent design review after the author and orchestrator checks.
