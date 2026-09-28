---
skill: evolve
output: {{provider:skills_root}}/evolve/SKILL.md
companion_templates:
  - references/00-router.md
  - references/01-reflect.md
  - references/02-triage.md
  - references/03-draft.md
  - references/04-validate.md
  - references/05-adopt.md
  - interfaces/reflection.md
  - interfaces/improvement.md
  - interfaces/validation.md
  - patterns/task-tracking.md
---

## Purpose

Consolidate Reflect → Triage (including drafting) → Validate → Adopt into one progressively loaded
lifecycle. Replace skill-lifecycle, skill-reflect, skill-triage, skill-new and
skill-promote. The lifecycle ends with verified local adoption.

## Derivation

Use the enabled Skill lifecycle configuration (legacy Q10 key retained for
compatibility) to deploy Evolve. Resolve provider-specific skill, agent, reflection
and working-state paths and the selected root instruction file consistently. Keep
legacy reflections and drafts readable; do not migrate or delete user artifacts
automatically. Retire old generated lifecycle commands only during an authorized
apply/launch, after updating callers. Do not ship parallel orchestrators.

## Verify

- All four command routes and direct-entry prerequisites resolve; Draft is internal to Triage.
- Native tasks and durable report use the same stage evidence.
- Candidate content stays inactive until adoption; skills deploy as name/SKILL.md.
- Validation records evidence and hashes, with no elapsed-time promotion gate.
- Dev hooks invoke {{provider:invoke:evolve}} reflect; docs and discovery use /evolve.
- Adoption completion requires verified local integration; there is no subsequent stage.
