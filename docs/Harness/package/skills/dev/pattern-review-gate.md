# Pattern: Review Gate

Applies whenever an agent (`@architect`, `@nestjs-dev`, `@react-dev`, etc.) returns findings that must be acted on — PR review, deviation audit, satellite review, or any structured agent output. The pattern has two stages with a hard stop between them.

## Stage 1 — Write and present

1. **Write all findings to `2-report.md`** under a named section (e.g. `## PR Review`, `## Deviation Audit`, `## Satellite Review`) before doing anything else. If the session ends early, the findings are preserved.
2. **Classify each finding** before presenting it:
   - **Real, introduced by this change** → `Must fix` (apply only after developer confirms in Stage 2)
   - **Pre-existing** → out of scope; note it but do not fix
   - **Ruled out by explicit design decision** → counter-explain why it doesn't apply; record the rationale
   - **Theoretical / non-load-bearing** → advisory only; do not act
3. **Present the classified table** with triage reasoning to the developer.
4. **STOP** — wait for the developer to confirm which findings to fix. Do not apply any fix, even an obviously correct one, before this confirmation.

## Stage 2 — Per-fix loop

For each confirmed fix (or tightly related group), apply the do → report → commit pattern (`.claude/skills/dev/pattern-do-report-commit.md`):

1. Implement the fix
2. Present the change and the verification instructions
3. **STOP** — wait for the developer to confirm the fix is correct
4. Update the relevant section in `2-report.md` with the resolution
5. Present a commit message for this fix
6. **STOP** — wait for the developer to confirm the commit is done
7. Proceed to the next fix

Do not batch multiple unrelated fixes into a single commit. Do not present a commit message before the developer has validated the change.

## Why

Skipping Stage 1 (applying fixes before writing the report) means findings are lost if the session ends early. Batching Stage 2 (committing all fixes at once) removes the per-fix validation checkpoint, which is the same discipline `dev-implement` enforces for implementation steps. The pattern is identical in both contexts.
