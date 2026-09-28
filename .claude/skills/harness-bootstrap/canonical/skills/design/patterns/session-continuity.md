# Pattern: Session Continuity (Design)

Applies to every design-lifecycle phase skill (`design-frame`, `design-research`, `design-evaluate`, `design-solution`, `design-review-gate`, `design-address-feedback`, `design-publish`).

## On entry (top of each skill)

> 🔁 **Session continuity:** If this skill is resuming after context compaction, re-read this full SKILL.md before doing anything. The per-step protocol is non-negotiable and must be followed even if the `{{provider:invoke:design}}` orchestrator is no longer in context.

## On exit (end of each skill)

When this phase is complete, re-read `{{provider:skills_root}}/design/SKILL.md` and resume the orchestrator from the next phase. This makes the agent self-healing after compaction — the developer does not need to re-invoke `{{provider:invoke:design}}` manually.

## Why

Design sessions span multiple phases across multiple sessions. After context compaction, the `{{provider:invoke:design}}` orchestrator falls out of active context. Without an explicit re-read instruction, the agent correctly completes the current phase but loses the phase handoff protocol — it stops prompting for the next phase and no longer follows the stop-and-confirm rhythm between phases.
