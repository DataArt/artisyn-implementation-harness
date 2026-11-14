---
status: triaged
triaged: 2026-11-14T22:05:00Z
candidate: .harness/evolve/20261114T220500Z-doc-catch-up-outside-ticket/
candidate-sibling: .harness/evolve/20261114T223000Z-root-instructions-interface/
timestamp: 2026-11-14T21:59:14Z
related: 20261109T221049Z-vibecoding-bypasses-dev-governance.md
---

## Observation

Second report of the same gap, this time with proposed remedies. The user's
own words (2026-11-14): "during vibe-codding session harness (dev flow) is not
involved, so docs can be degraded... what if we instruct CLAUDE/AGENTS md to
detect such session and once code generated use 'dev document' automatically
to update corresponding documents.... mb read sth from dev flow and capture
anything usefull... like terminology and docs principles... (but this included
in dev document)... or mb just involve docs-writer to simply align docs with
vibe-coding"

Reported experience, not re-verified in this session: code written in plain
chat (no `/dev` ticket) leaves LLD and other permanent docs stale. The
2026-11-09 reflection records a concrete instance with evidence
(TerminalScenarios work after `/dev complete DEV-20261109-J5LS`).

Verified now: `CLAUDE.md` and `.claude/agents/*.md` still contain no rule
for ad-hoc implementation sessions. `CLAUDE.md` only lists `/dev document`
as a phase in the formal chain.

## Impact

Same as the earlier reflection: docs drift silently after every untracked
coding session, and later `/dev` or `/design` runs inherit stale context.
Raised twice by the user within a week, so it is a felt friction, not a
one-off.

## Suggested direction (user's ideas, not committed)

Three options the user floated, roughly from heaviest to lightest:

1. Instruct `CLAUDE.md` / `AGENTS.md` to detect a vibe-coding session
   (substantial code generated with no active `/dev` ticket) and, once code
   is produced, run `/dev document` automatically to update the affected
   docs.
2. Have that catch-up step pull the useful parts of the dev flow:
   terminology registry and docs principles. The user notes these are
   already inside `/dev document`, so option 1 may cover this.
3. Lightest: just invoke `@docs-writer` at the end of the session to align
   docs with what was coded, without the full `/dev document` stage.

Open questions for Triage:

- Can `/dev document` run with no `0-intent.md` / no prior Implement stage,
  or does it need a lighter "catch-up" entry point?
- Should the trigger be automatic or a prompt to the user ("this session
  changed N files outside a ticket; run doc catch-up?")? Automatic runs
  spend budget without consent.
- Where does the rule live: `CLAUDE.md` (every session) vs. an agent
  profile vs. an Engineering Guide article referenced from `CLAUDE.md`.
- Merge with the 2026-11-09 reflection at triage; treat as one candidate.
