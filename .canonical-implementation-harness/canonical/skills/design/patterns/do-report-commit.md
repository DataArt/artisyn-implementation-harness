# Do → Report → Commit

Applies at the end of every design stage, after `patterns/phase-sign-off.md`'s
sign-off is approved. Report and Commit are routine — no sign-off, no wait, no
stop on Report; Commit is its own stop because it is a manual operation.

## Steps

1. **Do** — the sign-off is already approved; the artifact is final.
2. **Report** — update `design/Report.md`: Phase tracker (current phase `✅`,
   next phase `🔄`), append an Efforts row (date, phase, one-line note). Then
   metrics `report`.
3. **Commit** — present the suggested commit message. This is a manual-operation
   sign-off (`patterns/approval-sign-off.md`): the developer runs it, you wait.
   `wait start --reason user_input`. **Stop and wait.** On the reply, check
   `git log`/`git status`: the commit exists and the worktree holds nothing from
   this phase. If not, say what is missing and wait again. Only then
   `stage complete`.

After the commit is confirmed, announce the outcome and continue straight into
the next phase — no separate "ready to continue?" question.

## Invariant

`design/Report.md` must reflect the completed phase before any commit is
presented. It is the recovery point — the next session reads it to know where
to resume.
