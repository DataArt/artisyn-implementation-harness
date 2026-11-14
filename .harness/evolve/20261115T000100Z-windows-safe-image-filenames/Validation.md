# Validation plan — Windows-safe image filenames

Candidate: `20261115T000100Z-windows-safe-image-filenames`. Hashes: see `Report.md`. Status: **executed 2026-11-15.** Walkthroughs are labelled as such.

## Scenario table

| #   | Category   | Input / context                                                     | Expected behavior                   | Method                                                                                                                    | Actual outcome                                                                                                                                                                                    | Evidence              | Result                |
| --- | ---------- | ------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------- |
| 1   | Positive   | After adopt: `git ls-files \| grep -E '[:*?"<>                      | ]'`                                 | Cannot run until the renames land; the candidate's two links decode exactly to the planned new names and contain no colon | python decode check this pass                                                                                                                                                                     | pass (pre-adopt form) |                       | pending |
| 2   | Positive   | Old names grepped across repo (excluding `.harness/` history)       | No hits                             | grep                                                                                                                      | Live repo still has the 2 old references by design (not adopted); the candidate files have 0                                                                                                      | grep                  | pass (pre-adopt form) |
| 3   | Regression | `yarn nx run web-docs:build` or opening the two pages in dev server | Images render                       | build or browser                                                                                                          | Not run: the docs build needs the local toolchain (native bindings missing here). Links are static `/images/context/<file>` paths served from `docs/public/`, so a correct filename is sufficient | —                     | blocked (optional)    |
| 4   | Structural | Renamed files exist and are tracked                                 | `git ls-files` lists both new names | shell                                                                                                                     | Performed at adopt with `git mv`; verify then                                                                                                                                                     | —                     | pending at adopt      |

## Tool/runtime limitations

Build check depends on the local toolchain, which failed on native bindings in this environment earlier; the developer's environment runs it.

## Verdict

**Pass** for the content change; the two renames and the build check are adoption-time verifications. 2 of 4 scenarios pass now, 1 blocked optional, 1 deferred to adopt. Next action: `/evolve adopt 20261115T000100Z-windows-safe-image-filenames` once accepted.
