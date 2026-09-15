# Pattern: Session Continuity

Applies to every dev-lifecycle stage reference (`references/01-context-gathering.md`,
`references/02-ceremony.md`, `references/03-plan.md`, `references/04-implement.md`,
`references/05-test.md`, `references/06-document.md`).

## On entry (top of each stage reference)

> 🔁 **Session continuity:** If this stage is resuming after context compaction,
> re-read this full reference file before doing anything. The per-step protocol is
> non-negotiable and must be followed even if `dev/SKILL.md` is no longer in context.

## On exit

For a full-flow request, re-read `.claude/skills/dev/SKILL.md` and continue from the
next stage. For direct-stage entry, return the stage result and stop. Preserve existing
authorization and unresolved decisions across compaction; apply `patterns/approvals.md`
and recover metrics before recording new work. Do not replay completed work or recreate
approval gates just because the session resumed.
