# Improvement interface

Store each candidate under .harness/evolve/{timestamp}-{slug}/ with Report.md,
candidate/ content and Validation.md. These are working artifacts, not discoverable
active skills. Both providers use this shared artifact root; import legacy provider-local candidates explicitly, preserving originals.

Report.md owns:

- Identity, requested outcome, scope/non-goals, source reflection paths and evidence.
- Action (update/create/merge/retire), existing owner and affected callers.
- Acceptance criteria and proposed file mapping: source, destination, baseline hash,
  candidate hash, and operation. Explicitly list removals and rollback material.
- Stage table: reflect, triage, validate, adopt; each pending, in_progress,
  completed, blocked or not_applicable, with evidence and reasons for bypasses.
- Draft readiness is a Triage outcome, not an executable stage.
- Current stage, next action, unresolved decisions and candidate acceptance record.
- Validation path and verdict; adoption results and integration evidence.

Keep one authoritative state table. Update it on transitions; do not infer completion
from file existence. Split independent changes into separately validated candidates.
