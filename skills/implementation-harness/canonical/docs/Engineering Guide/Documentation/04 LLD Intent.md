# LLD Intent

An LLD component document states how the inspected implementation works at component
resolution. It connects concrete structure and contracts to execution, data movement
and observable outcomes so maintainers can follow the code's behavior.

## Required abstraction: C4 components

This harness requires **LLD at C4 level 3 (Component)**. Decompose one identified
container into cohesive responsibility/interface boundaries and explain their
collaboration. A component is an architectural grouping of implementation, not
a requirement to draw every file, class, function or UI widget separately.

The C4 abstraction ladder is illustrated in `03 HLD Intent.md`; LLD sits one zoom
level below HLD, inside a single container. Each
container's LLD overview must show its actual internal components, responsibilities,
dependencies and boundary collaborators. Component documents drill into these named
units and link back to that overview. Label interactions with their purpose and
contract; connect important sequences, state ownership and operational detail to
this structure. File/type references provide evidence and optional code-level
detail; they cannot replace the component view. Conversely, repeating HLD container
boxes without decomposing the selected container does not satisfy LLD granularity.

Group components by cohesive responsibility, not arbitrary source-file counts or
directory names. Map library, pipeline and infrastructure details to their actual
runtime or provisioning context; label supporting module/deployment views accurately.
Reject LLD that cannot locate the component boundary, collaborators and behavior
within its parent container. Preserve the existing greenfield rule: do not invent
implemented components when there is no code.
Sources: [C4 diagrams](https://c4model.com/diagrams) and
[Component view](https://c4model.com/diagrams/component). C4 treats this view as optional;
this harness explicitly requires it for implemented LLD.

## Required semantic coverage

Use the same five coverage keys as HLD, at implemented component resolution.
Headings may vary; verify meaning rather than a fixed heading count.

| Key           | Required content                                                   |
| ------------- | ------------------------------------------------------------------ |
| `scope`       | Component purpose, implemented responsibilities and boundary       |
| `structure`   | Relevant modules/types, ownership, dependencies and wiring         |
| `flows`       | Primary implemented business, data or interaction sequence         |
| `contracts`   | Concrete entry points, inputs/outputs and integration behavior     |
| `constraints` | Implemented limits and consequential choices supported by evidence |

A default structure is Overview, Component structure, Execution flows, Integration
contracts, and Constraints. Combine sections where useful. Record non-applicability
in the verification record; do not manufacture detail to populate every section.

## Statements and evidence

- Read actual source and configuration. Every named type, method, registration,
  configuration key, default and described behavior must trace to inspected evidence.
- Cite precise source locations for technical claims. Distinguish configured behavior
  from measured runtime behavior; configuration alone does not prove an observed result.
- Document implementation as it exists. Approved future design belongs in HLD/design
  records and must not appear as an already implemented LLD fact.
- State consequential implementation choices when relevant. Rationale and alternatives
  require a documented decision source; observed code does not reveal motivation.
- Keep unknowns, unresolved questions and missing evidence in external launch/design/
  review records, per the certainty principle in 01 Principles.md.
- Missing essential implementation evidence prevents readiness. Do not invent a
  signature, default or error path, or omit an essential behavior to claim completion.

## Execution and data flows

Choose the primary flows that explain this component's implemented role. State the
trigger or entry point, actors/callers, ordered operations, data read/transformed/
written, boundary crossings and outcomes. Trace asynchronous handoffs, state changes,
validation or error propagation when they matter and the inspected code supports them.

Connect business steps to their implementing operations when this helps maintainers.
For infrastructure or utility components, an applicable provisioning, execution or
data sequence can serve this purpose; do not invent a user-facing business process.
Use a colored sequence/flow diagram when it clarifies ordering, branching or ownership.
A structural diagram may explain wiring but does not replace a needed flow sequence.
Document relevant failure/recovery behavior only when verified in source/config.

## UI illustrations

For UI components, include or link a mockup/illustration when it materially clarifies
layout, key interactions or implemented states. Tie controls and state transitions to
the corresponding handlers/data flow. Inspect the actual UI or its source and identify
the evidence; do not present a proposed redesign as existing behavior. Omit mockups
when they add no useful detail, especially for components without a UI responsibility.

## Shared layer principles and patterns

When recurring conventions help explain a layer, keep a focused shared document
under that container's LLD folder. Component LLDs link to it instead of repeating
common rules. Include only relevant patterns supported by inspected implementation
or documented decisions; do not generate a generic best-practice catalogue.

- Web: UI UX Patterns.md covers established navigation/layout conventions,
  reusable interactions, loading/empty/error states, accessibility behavior, and
  useful wireframes or state illustrations tied to implemented flows.
- Backend: Principles and Patterns.md covers shared API contracts, validation,
  authorization, errors, retries, and transaction boundaries where applicable.
- Data: Principles and Patterns.md covers modeling, ownership, migrations,
  consistency, retention, and query conventions where applicable.

Use the project's actual container names and responsibilities; do not create a
Backend or Data folder when no such layer exists. For combined responsibilities,
use focused sections or separate documents only where useful. State each pattern's
scope, concrete rule or behavior, representative source evidence, and consequential
exceptions. Documented decisions may explain implemented patterns; approved future
patterns remain in HLD/design records until implemented. Keep system-wide and
cross-container decisions in HLD and link them from LLD.

Shared pattern documents follow the same evidence and no-placeholder rules as
component LLDs. Link them from the LLD index, keep each within the LLD budget in
01 Principles.md, and split
out useful illustrations rather than duplicating component descriptions. Omit a
shared document when there is no useful common pattern; record that choice in the
external verification record.

## Operationally useful detail for any component

Select coverage from actual responsibilities, not a fixed Web/Infrastructure taxonomy.
For services, jobs, libraries, clients, pipelines, data stores or provisioned resources,
explain how a maintainer locates, changes, executes and diagnoses relevant behavior.

| Concern, when applicable | Required evidence-backed detail                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Internal architecture    | Modules and dependency direction; ownership of state/data; entry points and extension points                        |
| Execution                | Trace a representative input/event through processing, state changes, outputs and failure handling                  |
| Configuration            | Key, purpose, consumer, source/precedence, default or required status, validation and sensitivity; no secret values |
| Commands and automation  | Actual invocation/target, prerequisites, dependencies, inputs, effects, outputs and guarded status                  |
| Contracts                | Types/schema/protocol, validation, error semantics and compatibility boundaries                                     |
| Lifecycle                | Initialization, scheduling, shutdown, persistence, recovery or cleanup as applicable                                |
| Shared patterns          | Established rules, representative implementation, exceptions and links from consumers                               |

Inspect build definitions, scripts, configuration schemas/examples and dependency
wiring as well as application code. Discover the repository's actual tools; do not
assume a package.json, Nx, a server, database or deployment pipeline. Document key
names from declarations/templates without reading secret values. Request missing
source scope from the orchestrator rather than inventing behavior outside worker inputs.
Keep operational detail in its owning document; link it rather than repeating it.

## Verification and related contracts

Keep component documents within the LLD budget in 01 Principles.md. Verify all five coverage keys, concrete
identifiers, ordered flows, source links and applicable limits against actual files.
Return claim-to-source evidence and external unresolved issues in the verification
record. Accept the document only when required coverage is supported.

- `03 HLD Intent.md` — confirmed container architecture.
- `05 NFR Intent.md` — approved requirements and acceptance evidence.
- `02 Structure.md` — document placement.
- `01 Principles.md` — presentation and diagram conventions.
