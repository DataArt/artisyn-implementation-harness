# Technology decision interface

Use only when technology selection, replacement, versioning or compatibility is part
of the solution. State the decision scope, constraints, selected technology and the
capability it provides. Record relevant alternatives and trade-offs in the evaluation
record; publish only the confirmed choice and its consequences.

Cover compatibility with existing interfaces, runtime/build/deployment constraints,
operational ownership, licensing or cost obligations, migration and rollback needs,
and verification of the selected technology. Do not generate a generic full-stack
diagram or inventory unchanged technologies. Link existing HLD/LLD/NFR decisions.

## Ways to express this design

- A technology-to-responsibility table can relate each changed dependency to its
  capability, owning component, relevant version and configuration constraints.
- A compatibility or dependency diagram can expose runtime/build relationships
  that affect installation, deployment or interoperability.
- A small configuration or integration example can clarify how a selected tool
  connects to the existing environment, using confirmed values and no credentials.

## What good looks like

A reader knows where each selected technology is used, what compatibility must
hold, and how to verify the integration. Version specificity reflects the decision;
it does not invent unsupported pins. Selection rationale stays in Evaluate.

A library replacement may need only a compatibility table and migration notes.
A runtime upgrade may benefit from a dependency view and a build/deploy check list.
Neither implies documenting the project's entire stack.
