---
status: pending-triage
timestamp: 2026-11-08T23:20:06Z
ticket: DESIGN-20261108-1L8P
---

## Observation

The user's own words, prompting this reflection: "it would be perfect if we can use
for the docs termins from terminology document... and search and updtae docs
frontmatters and og with terms from list rather than invent different terms every
time..."

`docs/Engineering Guide/Documentation/07 Terminology.md` already exists and
documents its own fill rule: "During `/design`, Solution Step 2 proposes a row
for any domain term the solution coins that isn't here yet; `docs-writer`
appends it as part of writing `solution/Architecture.md`." That rule is reactive
— it only adds _new_ terms the current design coins. It says nothing about the
registry being read from when writing a doc's `purpose`/`keywords` frontmatter,
or when indexing a doc into the operational graph
(`docs/.og/cli.mjs index --doc ... `) — those steps currently let each
`docs-writer`/orchestrator invocation choose its own wording independently,
with no requirement to check the registry for an existing approved term first.

Observed in this session: when publishing new container docs for this design
(`Web Explorer.md`, `Web Portal.md`, and the `Web.md`→`Web Docs.md` rename),
the delegation prompt to `docs-writer` asked it to write frontmatter
`keywords:` "accurate to the doc's actual content" and to propose a Terminology
row only for a newly-coined, at-risk-of-drift term — it was never instructed to
first search `07 Terminology.md` for terms already approved for related
concepts (e.g. "Web layer", "container", "GitHub Pages project-site base path")
and reuse that exact wording in the new frontmatter/keywords. The design's own
earlier Context Gathering step similarly builds its Evidence table and later
the operational-graph `index --edge` calls without a registry lookup step.

## Impact

Without a push step (search registry → reuse term) alongside the existing pull
step (coin term → add to registry), the registry only grows from designs that
happen to coin something new — it never corrects wording in docs that could have
reused an already-approved term but didn't, because nothing prompted the
check. Over many design/publish cycles this is exactly the drift the registry
exists to prevent: frontmatter keywords and operational-graph edges for the
same concept can still end up phrased three different ways across documents,
quietly, since the registry's existence doesn't by itself stop a new doc from
choosing its own synonym.

## Suggested direction (not committed)

- Add a step (likely in `.claude/skills/design/patterns/docs-writer-authoring.md`
  or the Publish stage reference, `references/09-publish.md` Step 3) requiring
  `docs-writer` to read `07 Terminology.md` _before_ drafting a doc's
  frontmatter/keywords and section headings, and to use an approved term's exact
  wording wherever the doc discusses that concept — not just to propose new rows
  reactively.
- Consider whether the operational-graph indexing step
  (`docs/.og/cli.mjs index --doc ... --edge ... --to ...`) should also validate
  or tag edges against the registry, so a doc's `keywords:` frontmatter and its
  graph node labels stay in the same approved vocabulary — this needs checking
  against `docs/.og/cli.mjs`'s actual capabilities before assuming it's
  feasible.
- Scope question for Triage: is this a `docs-writer`-role-level change (every
  invocation, regardless of lifecycle) or specific to `/design`'s Solution and
  Publish stages where new terminology is most likely to get coined or reused.
