# Code Conventions

This canonical guide defines how launch captures project conventions. Replace this
instructional content in the installed copy with supported rules from the repository.
Read Documentation/01 Principles.md for presentation and immediate self-review.

## Capture intent

Help a contributor make a change that fits the existing codebase. Inspect representative
source from each actual layer, compiler/build/formatter settings, automation and
explicit team decisions. Follow recurring patterns across multiple examples; a single
implementation is not evidence of a repository-wide convention.

| Concern                    | Capture when applicable                                                        |
| -------------------------- | ------------------------------------------------------------------------------ |
| Naming and organization    | File/type/function naming, module layout and ownership boundaries              |
| Dependencies               | Allowed direction, public interfaces, shared abstractions and import rules     |
| Data and state             | Types/schema, state ownership, mutation, persistence and serialization         |
| Errors and boundaries      | Validation, error propagation, logging and external-call conventions           |
| Configuration              | Declared keys, source/precedence and handling rules; never secret values       |
| Verification               | Actual checks and conventions for existing tests; never invent missing tooling |
| Language or layer patterns | Recurring idioms that guide changes in that part of the codebase               |
| Collaboration              | Confirmed commit/branch rules, with references to operational procedures       |

Each installed rule records its scope, concrete convention, representative source
link and enforcement: configured/enforced, documented team decision, or observed
recurring pattern. Separate scoped exceptions explicitly. Do not describe an observed
pattern as an enforced rule or add preferred best practices without a project decision.
Apply Principles' contradictory-evidence check before publishing “always,” “only” or
“never”: inspect examples across the claimed scope and record scoped exceptions.
Verify guarded commands against the applicable instruction or permission configuration,
citing which authority establishes the restriction. Do not infer that a related
command is guarded merely because another command in its group is.

Omit irrelevant categories and record essential evidence gaps in the external run
record. Prefer a small set of useful conventions to a generic language style guide.
Tool compatibility, skill authoring, task orchestration and root-file selection belong
in their own guides; link them only when they help apply a coding convention.

## Acceptance

A reader can locate an example and determine how to name, place, structure and verify
a representative change in each relevant layer. Verify every rule against its cited
source; the presence of headings or portable harness boilerplate does not pass.
