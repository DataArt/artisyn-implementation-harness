# Do → Verify → Report → Commit

Do the in-scope work, verify it, update `2-report.md` with what actually happened,
and only then suggest a commit. Never the other way round: the report is the
recovery point, a commit is not.

Inside a phase (an Implement step, a review fix) this means: update the step's
Progress row and note as soon as it is verified. At the end of the phase, the stage
reference's Report step finalises `2-report.md` and its Commit step suggests the
commits, as exact Conventional Commit messages, one per step or logical block; the
developer runs them and the stage waits for that before closing. Never
`git add`/`git commit` yourself. Do not claim a commit happened until you see it in
Git or the developer says so.

A failed required check blocks completion of the step. Pause for a check you
cannot run (no access, guarded command), not for each local fix.
