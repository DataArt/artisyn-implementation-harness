---
id: afdcc32a
---

# NFR Intent

An NFR pillar document states approved non-functional requirements, applicable
constraints and how acceptance is demonstrated. Create one document per selected
Well-Architected Framework pillar under the active HLD version's
`Non-Functional Concerns/` directory. Use the project's selected framework and names.

## Required semantic coverage

| Key            | Required content                                                       |
| -------------- | ---------------------------------------------------------------------- |
| `scope`        | Systems, actors, environments and critical flows the pillar governs    |
| `requirements` | Approved outcomes, targets and their measurement conditions            |
| `constraints`  | Confirmed operational, technical, policy and resource boundaries       |
| `verification` | Acceptance method, evidence and pass criteria for each requirement     |
| `flows`        | Critical ordered processes needed to interpret or satisfy requirements |

Headings may vary. Record justified non-applicability in the verification record;
do not fabricate requirements or processes merely to populate a section.

## Requirement statements

For each requirement, state its subject and required outcome. Include the approved
target, unit, measurement window and operating conditions where quantitative; define
unambiguous observable pass criteria for qualitative requirements. Link approval or
requirement evidence and distinguish required behavior from current implementation.

A measurement is not automatically a target. A configured limit is not automatically
an approved requirement or proof of compliance. Label current evidence accordingly;
state acceptance only when the specified conditions and criteria have been verified.

When targets are missing, research applicable authoritative benchmarks and platform
limits, then propose workload-specific targets with sources, conditions and tradeoffs
in the run/design record. Confirm the target set before publishing requirements.
A benchmark is a starting point, not automatic project approval; do not adopt a
platform SLA as the end-to-end application SLO. Reuse existing approved targets.
Never invent budgets or silently present proposed service levels as settled decisions.
Implementation choices (framework, rendering technique, absence of a database) are
context, not substitutes for required outcomes. Require a target/acceptance method
for each essential NFR.
Unknown targets, unresolved decisions and missing approval belong in external launch,
design or review records, per the certainty principle in 01 Principles.md. Essential missing
requirements, approval sources or acceptance criteria keep document readiness unresolved
in the external record. Missing executed test results prevent a compliance claim; they
do not prevent documenting an approved requirement and its verification method.
Do not turn incomplete essentials into an apparent pass by omitting them.

## Pillar-specific application

Use applicable approved requirements; this is a scope checklist, not a default policy.

- **Security:** access and authorization, data protection, trust boundaries and
  security-relevant auditability; identify covered identities, resources and actions.
- **Reliability:** required availability and recovery outcomes, failure conditions,
  permitted data loss and restoration behavior; distinguish objectives from results.
- **Performance:** latency, throughput or capacity under specified workload and
  observation conditions; state units and aggregation when a target uses them.
- **Operations:** deployment, rollback, detection and response acceptance criteria,
  required observability and operating responsibilities.
- **Cost:** approved spending/resource constraints with scope, period and workload
  assumptions; distinguish estimated, budgeted and measured amounts.
- **Other selected pillars:** apply the same statement/evidence contract to confirmed
  requirements without inventing additional project obligations.

## Critical flows and acceptance evidence

Document ordered recovery, access-control, deployment or other critical flows where
sequence matters to a requirement. State trigger, actors/responsibilities, ordered
steps, data/trust boundaries, outcomes and supported failure/escalation behavior.
Use a colored sequence or flow diagram only when it clarifies the process.

Map each requirement to its verification method: a test, measurement, configuration
inspection, exercise or other approved acceptance evidence. Identify the evidence
source and the conditions under which it supports a pass. Use a stable requirement
identifier to trace each requirement to its target, measurement conditions, method
and explicit pass criteria. Quantitative methods specify the metric, aggregation or
percentile, population/workload, relevant device/network/environment conditions and
evaluation window. Qualitative controls identify the inspection or exercise and
observable result. Configuration inspection proves only what it checks; a design
technique cannot demonstrate an outcome such as latency. Keep pending execution and
missing acceptance evidence in the external record.
Record confirmed decisions as statements, with rationale only
when a decision source supports it. Never claim a test or exercise occurred without
its results. Separate document readiness from demonstrated system compliance.

## See also

- `03 HLD Intent.md` — confirmed container architecture.
- `04 LLD Intent.md` — implemented behavior and evidence.
- `02 Structure.md` — document placement.
- `01 Principles.md` — presentation and diagram conventions.

Framework reference examples (Azure only when selected):
[WAF pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars),
[reliability metrics](https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics),
[security checklist](https://learn.microsoft.com/en-us/azure/well-architected/security/checklist),
and [cost checklist](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/checklist).
These guide requirement discovery; project approval establishes actual obligations.
