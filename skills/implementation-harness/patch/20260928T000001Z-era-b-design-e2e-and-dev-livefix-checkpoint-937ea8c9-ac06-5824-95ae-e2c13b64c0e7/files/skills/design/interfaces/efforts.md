# Delivery efforts interface

Use when implementation needs decomposition, ordering, migration, rollout, rollback,
capacity, cost or risk planning. Define delivery units by a meaningful outcome and
ownership, using a component, container, FE/BE/Infra slice or another boundary that
fits the change. Each unit must be specific and measurable, achievable within the
framed constraints, relevant to the selected solution, and time-bounded by one
focused dev session when possible. It must also be large enough to include all
necessary changes without ceremony overhead. Split or combine units when ownership,
sequencing or acceptance evidence requires it; do not manufacture tickets for a
small change.

Represent a simple spike as an MCP-assisted investigation when an available MCP can
resolve it during design. Create a separate spike ticket only when the MCP result is
unavailable, non-deterministic or still needs implementation-time validation.

Estimate only when the developer or an approved estimation method supplies the
estimate. For cost or capacity, state workload, units, time window, assumptions,
source and sensitivity. Distinguish confirmed obligations from proposed work and
external risks. Identify migration and rollback steps where data or compatibility
could be affected. Link resulting tickets and verification work; do not leave empty
effort or risk tables.

## Ways to express this design

- An outcome-based breakdown can show deliverables, owners, dependencies and
  completion evidence, with estimates only where supplied or authorized.
- A dependency graph can distinguish parallel work from genuine ordering
  constraints. A rollout sequence can show coexistence, migration and rollback gates.
- An operational-cost model can relate resources to workload, units, time windows
  and approved assumptions; a sensitivity table can show which assumptions matter.

## What good looks like

A delivery owner can identify the first useful slice, what blocks later work, who
owns each outcome, and the evidence needed to proceed or roll back. Costs and
estimates are traceable; uncertainty is not disguised as a precise commitment.

A small feature may need a short deliverable table with one row per meaningful
component, container or cross-cutting slice rather than per endpoint, file or trivial
edit. A data migration may benefit
from a dependency graph and cutover/rollback sequence. A capacity change may use
workload scenarios and a cost model. Use only the views that aid the actual decision.
