# Intelligent approval

A narrower mechanism than `patterns/approval-sign-off.md`, for a step that names
itself an **intelligent-approval checkpoint**: one where whether human review is
warranted depends on what the generated content actually turned out to be, not on
the step itself.

At such a checkpoint, before presenting anything to the developer:

1. State the checkpoint's auto-approval conditions — what has to be true for it to
   be safe to skip human review — before looking at the actual content. Do not
   loosen the conditions after seeing whether the change happens to look trivial.
2. Evaluate the actual content strictly against those conditions.
3. **All conditions met → auto-approve.** Do not ask. Record, in the artifact the
   checkpoint's own instructions name — never a side channel — what was checked
   and why it qualified, in one or two lines. Continue without stopping.
4. **Any condition fails, or is uncertain → escalate.** Fall back to an ordinary
   sign-off (`patterns/approval-sign-off.md`): present the content and stop and
   wait. Default to escalating on any doubt — an unnecessary question costs a
   reply; a wrongly-skipped one costs an unreviewed decision reaching the
   developer as a fait accompli.

A skip is never silent. If the developer cannot find, after the fact, exactly what
was auto-approved and why, this pattern is being used to hide work rather than to
save the developer's attention — that is a misuse of the checkpoint it was applied
to, not a valid use of this pattern.
