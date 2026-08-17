# Pattern: Do → Report → Commit

Applies whenever a unit of work completes and needs to be committed — an implementation step, a documentation item, a PR review fix, or a phase wrap-up. The ordering is always the same.

## Steps

1. **Do** — complete the unit of work (implement, write doc, apply fix, archive folder)
2. **Verify** — present the result and any verification instructions; **STOP** and wait for the developer to confirm it is correct
3. **Report** — update `2-report.md` to reflect the completed work _before_ the commit message is presented:
   - Progress table row → `✅ Done`
   - Relevant section note (implementation note, documentation item, fix resolution)
   - Efforts row if applicable
4. **Commit** — present the suggested commit message; **STOP** and wait for the developer to confirm the commit is done
5. Do not start the next unit of work until step 4 is confirmed

## Invariant

**`2-report.md` must always reflect the current state before any commit is made.** The report and the commit history must stay in sync. If the session ends early after a commit, the report is the recovery point — it must never lag behind the committed code.

## Where this applies

| Phase                                         | Unit of work                    |
| --------------------------------------------- | ------------------------------- |
| Implement (`dev-implement` Step 3)            | Each plan step                  |
| PR review fix (`pattern-review-gate` Stage 2) | Each confirmed fix or fix group |
| Document (`dev-document` Step 4 → 6)          | Full doc phase wrap-up          |

## Why

Committing before updating the report means the report lags behind the code. If the session is interrupted between the commit and the report update, future sessions have no record of what was done. Presenting a commit message before verifying the work skips the validation checkpoint that catches regressions.
