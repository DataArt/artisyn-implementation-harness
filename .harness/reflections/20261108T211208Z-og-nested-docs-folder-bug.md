---
status: pending-triage
timestamp: 2026-11-08T21:12:08Z
ticket: DEV-20261108-K7XQ
---

## Observation

`docs/.og/docs/.og/docs-operational-graph.sqlite` exists as a tracked file in the
repo — a self-referential nested path (`docs/.og/docs/.og/...` instead of the
correct `docs/.og/...`). Verified via `git log --oneline --follow` on that exact
path: it was introduced in commit `09b6bf9` ("feat(harness-bootstrap): add
operational-graph tool for deterministic docs indexing") and touched again in
`1cc03fc`, both well before this session started — this is a pre-existing bug in
the operational-graph tooling or its invocation pattern, not something introduced
by DEV-20261108-K7XQ's work (confirmed: `git status` shows this session's worktree
clean of any change to that path).

The user's own words, prompting this reflection: "seems we have bug in og
scripts... docs/.og/docs nested folder created."

## Impact

A duplicate, nested sqlite artifact sits in version control, doubling storage for
no benefit and signaling that some code path resolves a path relative to the wrong
base (likely computing `<cwd>/docs/.og/...` when `cwd` was already `docs/.og/` or
similar, or a `--dir` argument getting joined onto an already-rooted path). Not
investigated further this session — `docs/.og/cli.mjs`, `constants.mjs`, and the
exact command/cwd combination that produced the nested write were not traced to a
root cause.

## Suggested direction (not committed)

- Triage should read `docs/.og/constants.mjs` and `docs/.og/cli.mjs` (specifically
  how `--dir` is resolved and joined against `DOCS_ROOT`) to find the actual path-
  join bug, then decide: fix the resolution logic, and separately delete the stray
  `docs/.og/docs/` directory from the repo (a one-time cleanup, distinct from the
  code fix).
- Check whether this is reproducible on demand (e.g., running a `cli.mjs` command
  from inside `docs/.og/` itself, or passing a non-root-relative `--dir` value)
  before attempting a fix, so the fix is verified against the actual trigger.
