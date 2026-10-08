# Pattern: Session Continuity

Fresh vs. resume is decided once, by the Resume Detection step in
`{{provider:skills_root}}/design/SKILL.md`. This pattern only covers losing
context mid-stage (compaction, a new session picking up an active stage).

When that happens:

1. Re-read the current stage reference in full. Its per-step protocol still
   applies even if `design/SKILL.md` is no longer in context.
2. Run metrics `recover --dir "$DESIGN_DIR"` before recording anything new.
3. Read `design/Report.md` to see what is already done. Do not redo completed
   steps, do not re-ask a sign-off that was already given, and keep existing
   authorisation.

On exit, for a full-chain request re-read `{{provider:skills_root}}/design/SKILL.md`
and continue from the next stage. For direct-stage entry, return the result and
stop.
