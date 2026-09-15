# Do → Verify → Report → Commit

Complete the in-scope work, run relevant available checks, then update `2-report.md`
with actual progress, evidence and findings resolutions before any commit.
Apply `patterns/approvals.md`: pause for unavailable required verification or an
unauthorized commit, not for each local fix. A failed required check blocks completion.

Use logical commits. Outside a call site that names this pattern as part of a fixed
sign-off gate (e.g. Implement Step 3, Plan Step 6), provide a suggested Conventional
Commit and continue independent authorized work once it's developer-run. At a named
sign-off gate, that gate's explicit stop-and-wait governs instead: propose the exact
commit and wait for the developer's confirmation before continuing — do not proceed
on the strength of this paragraph. Do not claim a commit occurred until observed or
confirmed. Report state remains the recovery point even without a commit.
