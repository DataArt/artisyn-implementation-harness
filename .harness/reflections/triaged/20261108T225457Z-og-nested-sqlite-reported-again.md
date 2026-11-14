---
status: pending-triage
timestamp: 2026-11-08T22:54:57Z
ticket: DESIGN-20261108-1L8P
---

## Observation

The user's own words, prompting this reflection: "just now you created nested
docs-operational-graph.sqlite track this case as this is a bug... will need to
fix later."

**Reported experience vs. verified fact:** I checked before writing this down.
`docs/.og/docs/.og/docs-operational-graph.sqlite` does exist (confirmed via
`find docs/.og -iname "*.sqlite"`), but its file mtime (2026-11-08 19:02) and
`git log --oneline --follow` on that exact path show it was last touched by
commit `1cc03fc` ("docs(DESIGN-20261103-LBBI): research, 5 options evaluated")
— a different, earlier design session, not this one. `git status --short`
shows no pending changes under `docs/.og/` at all. This session only ran
read-only `node docs/.og/cli.mjs search --dir docs --term ...` /
`query --related-to ...` lookups during Research Step 2 (per
`.claude/skills/design/references/04-research.md`'s required graph-query
step) against the top-level, correctly-pathed
`docs/.og/docs-operational-graph.sqlite` (mtime 22:20, i.e. touched by this
session's reads, which is expected for that file) — it did not write to
`docs/.og/docs/.og/`. So: the nested file is real, but this session did not
create it; it was already sitting there, pre-existing, before this session
started.

This is also **not a new finding** — the identical bug was already captured
today in `.harness/reflections/20261108T211208Z-og-nested-docs-folder-bug.md`
(still `pending-triage`), including the same root-cause lead (commit `09b6bf9`
introduced the operational-graph tool; `1cc03fc` touched the nested path
again) and the same suggested fix direction.

## Impact

No new impact beyond what the earlier reflection already describes (duplicate
nested sqlite artifact in version control). The only new information here is
that the user independently re-noticed the same stray file and, this time,
attributed its creation to the current session — which the evidence above
doesn't support. Worth flagging to Triage so the eventual fix also double-checks
whatever code path runs during `/design`'s Research Step 2 graph query, in case
there's a trigger condition (e.g. a specific `--dir` value) that _can_ reproduce
this live, even though it didn't reproduce in this session's actual invocation
(`--dir docs`, which returned `[]` both times, no reported error, no new file
written).

## Suggested direction (not committed)

- Triage should treat this as evidence for, not a second instance of,
  `20261108T211208Z-og-nested-docs-folder-bug.md` — don't open a second fix
  candidate for the same bug.
- When fixing, also try to reproduce live with the exact invocation shape used
  in this session (`node docs/.og/cli.mjs search --dir docs --term <text>`
  from the repo root) to rule in/out whether _that_ specific call shape is
  itself safe, since it did not reproduce the nested write here.
- Separately: the stray `docs/.og/docs/.og/docs-operational-graph.sqlite` file
  is still sitting in the tree from a past commit and still needs the one-time
  cleanup the earlier reflection already suggested, independent of whichever
  session gets blamed for it.
