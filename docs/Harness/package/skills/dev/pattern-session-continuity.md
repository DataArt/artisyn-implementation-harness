# Pattern: Session Continuity

Applies to every dev-lifecycle phase skill (`dev-plan`, `dev-implement`, `dev-test`, `dev-document`).

## On entry (top of each skill)

> 🔁 **Session continuity:** If this skill is resuming after context compaction, re-read this full SKILL.md before doing anything. The per-step protocol is non-negotiable and must be followed even if the `/dev` orchestrator is no longer in context.

## On exit (end of each skill)

When this phase is complete, re-read `.claude/skills/dev/SKILL.md` and resume the orchestrator from the next phase. This makes the agent self-healing after compaction — the developer does not need to re-invoke `/dev` manually.

## Why

After session compaction, the `/dev` orchestrator falls out of active context. Without an explicit re-read instruction, the agent correctly completes the current phase but loses awareness of the phase handoff protocol — it stops prompting for the next phase and no longer follows the stop-and-confirm rhythm between phases.
