---
status: pending-triage
timestamp: 2026-11-09T22:10:49Z
---

## Observation

The user's own words, prompting this reflection: "we need to think about the
case even when dev vibecodding, CLAUDE/AGENTS needs to be instructed to
respect dev flow principles and align vibecodding with documentations...
governance, update, deviations... op grapgh..."

Observed directly in this session: after `/dev complete DEV-20261109-J5LS`
archived the ticket, the user kept driving substantial follow-up work in
plain chat — a new `TerminalScenarios` component and `data/scenarios.ts`
(replacing `LifecycleDemo`), a `SectionLink` extraction, several CSS/layout
fixes, a broken-link fix, an `env.ts` URL fix, and an untracked-file cleanup
(`tsconfig.tsbuildinfo`). None of it went through `/dev`: no `0-intent.md`,
no plan, no Test-stage acceptance criteria, no Document-stage deviation audit,
no `docs/System Architecture (LLD)/Web Explorer/00. Overview.md` update for
the new component (that doc still only describes the pre-TerminalScenarios
shape of the app from the archived ticket), no operational-graph re-index,
and no Review Findings/Tech Debt entries for any judgment calls made along
the way (e.g., the terminal-height JS-measurement approach, or the decision
to use GitHub links instead of docs-site links for `docs/Stories/**`
content). Each individual change was verified (build/lint/typecheck, manual
review, screenshots), so the _work_ was sound — but none of it fed back into
the permanent docs or the operational graph the way a `/dev`-routed change
would have.

Neither `CLAUDE.md` nor any `.claude/agents/*.md` profile currently says
anything about this case. They describe the formal lifecycles
(`/design`, `/dev`, `/evolve`) and the layer-ownership/tooling rules for each
agent, but nothing instructs the agent (or a human driving it conversationally,
i.e. "vibecoding") to notice when free-form implementation work has grown
large enough that it should be: (a) retroactively routed through `/dev
document` to close the doc/governance gap, (b) flagged to the user as a
candidate for `/evolve reflect`, or (c) at minimum checked against the
operational graph for staleness before being considered "done."

## Impact

Without this, a project's permanent docs (LLD especially, since it's the
"what's actually built" tier) silently drift out of sync every time
substantial work happens outside a tracked `/dev` ticket — exactly the
"delivery gap" `/where-we-are` exists to catch, except nothing currently
nudges toward running `/where-we-are` or `/dev document` after an ad-hoc
session like this one ends. The gap compounds: each future `/dev` or
`/design` session that reads the LLD for context inherits a doc that no
longer matches the code, without any signal that it's stale.

## Suggested direction (not committed)

- Add a short rule to `CLAUDE.md` (or a referenced Engineering Guide article)
  naming this case explicitly: substantial conversational/ad-hoc
  implementation work (new components, new files, structural changes — not
  typo fixes) should prompt the agent to ask whether to route the change
  through `/dev document` (or a lighter "catch-up" entry point) before
  considering it finished, rather than silently leaving docs and the
  operational graph behind.
- Consider whether `/where-we-are` (the delivery-gap report) should be
  suggested automatically at the end of a long ad-hoc session with
  significant diffs, the same way Test-stage findings currently suggest
  `/evolve reflect` for a repeatable convention gap.
- Scope question for Triage: should this live in `CLAUDE.md` itself (applies
  to every agent, every session) or in a specific agent profile
  (`@architect`'s "when to flag staleness" remit already overlaps this) — and
  whether it needs a new lightweight procedure or can reuse `/dev document`
  as-is by letting it run without a prior Implement stage.
