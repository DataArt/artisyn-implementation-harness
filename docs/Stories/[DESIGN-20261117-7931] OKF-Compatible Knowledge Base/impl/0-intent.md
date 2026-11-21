---
id: a8ce6496
purpose: States the problem, target outcome, scope and constraints for implementing the OKF-compatible knowledge base and the OG scope guard
keywords: [intent, okf, knowledge base, operational graph, scope guard, migration, dev-lifecycle]
---

# DESIGN-20261117-7931: OKF-Compatible Knowledge Base — Intent

- **Ticket**: `DESIGN-20261117-7931`. This is a local design ID, not a Jira issue. The design's
  `Report.md` says: "Implementation tickets not published (developer decision). Implement from
  `solution/Efforts.md` WBS items 1–9 with `/dev` in this repo." No tracker fetch was run.
- **Date**: 2026-11-18
- **Sources**:
  - The spec is the approved Product-track design. It is not copied here:
    [`solution/Architecture.md`](../../product-design/approved/[DESIGN-20261117-7931]%20OKF-Compatible%20Knowledge%20Base/solution/Architecture.md),
    the four `solution/Design - *.md` files, `solution/Stack.md`, and
    [`solution/Efforts.md`](../../product-design/approved/[DESIGN-20261117-7931]%20OKF-Compatible%20Knowledge%20Base/solution/Efforts.md),
    which gives WBS 1–9 and a "Done when" row for each item.
  - [`design/00 Frame.md`](../../product-design/approved/[DESIGN-20261117-7931]%20OKF-Compatible%20Knowledge%20Base/design/00%20Frame.md)
    for EC1–EC10, and [`design/Report.md`](../../product-design/approved/[DESIGN-20261117-7931]%20OKF-Compatible%20Knowledge%20Base/design/Report.md)
    for the developer's decisions (Assumptions 1–20).
  - The Product docs already published by the design: `docs/Harness/07 Operational Graph/`
    (including the new `05 Knowledge Base Format.md`), `03 Lifecycles/05 Documents Flow.md`
    and `09 Distribution/`.
  - A check of the repo on 2026-11-18 (see "Current state" below).
  - The developer's message: `/dev DESIGN-20261117-7931`, with no extra words.

## What is the problem?

The harness docs are close to Open Knowledge Format (OKF) v0.2 but do not follow it. No doc
has a `type` key. Every `index.md` carries OG frontmatter and is a graph node. The Operational
Graph (OG) can also write `id:` into files it should never touch: `index --doc` has no path
guard. That leak already left a stray `id: ffe6a029` in `apps/web-explorer/README.md`. The
harness ships into other projects, so each of them gets the same leak and the same
non-conformant docs.

## What does better look like?

The design is already approved. What is left is to build and ship it, in the design's order:

- **Canonical package first** (`skills/implementation-harness/`). OG gets the scope guard,
  the B+ frontmatter parser and writer, schema v1 with a migration on open, and the `migrate`
  and `check` commands. Launch, `reindex-graph` and patch apply run the new flow. Writers,
  templates and `@docs-writer` produce B+ frontmatter and keep `index.md` bullets current.
- **A minor harness release** (developer decision at sign-off; it overrides the design's
  major release), stamped and bundled with `patch prepare`.
- **This repo as the first consumer**: `patch apply`, then a `reindex-graph` migration of its
  own docs. Index pages move their content to `00 Overview.md`, and nav and `docs/README.md`
  links follow. `docs/index.md` stays unchanged. Graph Explorer and the tier-sync CI script
  drop `AppReadme`. The site still builds.
- **A "Dogfood" page in Web Explorer** that explains the delivery loop, with this repo's
  migration as the worked example.

"Done" for each item is the matching row in the design's `Efforts.md` "Done when" table.

## Who and what is affected?

- **Consuming projects**: they get a breaking OG upgrade and a guided, confirmed migration of
  their docs.
- **Writers**: `@docs-writer`, `/design publish` and `/dev document` follow a new frontmatter
  contract and a new `index.md` rule.
- **HLD containers** (v1): **Implementation Harness E2E** (`cli.test.mjs` sits in the
  canonical package; its unit and live scenarios check the flows), **Harness Release Pipeline**
  (the version stamp; minor, see "Developer decisions at sign-off"), **Web Docs** (VitePress nav, Graph Explorer, migrated docs) and
  **Web Explorer** (the Dogfood page). The canonical package itself has no separate container.
  It is the product that the E2E and Release containers test and ship. This matches how the
  previous OG design (`DESIGN-20261102-Q5MU`) was mapped.

## What is out of scope?

The Frame's out-of-scope list still holds: typed edges in files, any change to OG's query
model, treating harness config as OKF concepts, the OKF trust fields (`status`, `verified`,
`stale_after`), and publishing to an external catalog. Also out of scope: `log.md`, VitePress
rewrites, and any change to `docs/index.md`.

## What are the constraints?

- The approved design is the spec. Its decision registers D1–D4 are settled. Developer input
  can override them only where they say so in this sign-off.
- **Delivery order is fixed**: canonical first, then `patch prepare`, then `patch apply`, then
  `reindex-graph`. This repo's `docs/.og/` must end byte-identical to canonical, except the
  project-owned and generated files.
- **Guarded commands are the developer's**: `git push`, and the live agent E2E run
  (`yarn nx run implementation-harness-e2e:agent-e2e`). The release to the five channels
  happens in CI after merge and approval, not here.
- `yarn` only, no hardcoded region, Node 24 for `node:sqlite` (the default shell Node is
  x86_64 v23, so prefix the PATH).
- `migrate` refuses dirty `.md` files. The dogfood migration needs a commit before it runs.
- The site is public, so `by` actors in frontmatter are never personal identities.

### Current state (checked 2026-11-18)

- The canonical `docs/.og/` and this repo's `docs/.og/` differ only in the expected ways:
  `cli.test.mjs` (canonical only), the seed DB versus the live DB, and `graph.mmd` (repo only).
- The stray `id: ffe6a029` is still in `apps/web-explorer/README.md`. There are 12
  `index.md` files under `docs/`. The harness package is at `4.1.0`.
- `AppReadme` and `impl-to-readme` appear where the design says they do: OG, the
  canonical and local `06-document.md`, `check-tier-sync.mjs` and `cytoscapeStyle.ts`.
  Graph Explorer's `script.ts` and `docUrl.ts` mention `AppReadme` only in comments.
- **Not in the design**:
  `apps/implementation-harness-e2e/src/scenarios/reindex-graph.ts:90-91` asserts that an
  agent-written doc has `purpose:` and `keywords:`. After this change the live E2E would fail
  unless that check moves to `description:` and `tags:`. I treat this as in scope; see
  question 2.
- The design branch `docs/design-20261117-7931-okf-knowledge-base` is 8 commits ahead of
  `main` and not merged yet.

## Developer decisions at sign-off (2026-11-18)

- **Minor release, not major.** This overrides the design's cross-cutting "Release" decision
  and Efforts item 7. The developer said: "i think this is not major release... rathe minor".
  `yarn harness:version` takes the bump from the conventional-commit types since the last
  harness tag. So this story's commits use plain `feat`/`fix`, with no `!` and no
  `BREAKING CHANGE` footer. The expected version is `4.2.0`, up from `4.1.0`. Two
  consequences follow:
  - The published Product docs say "Applies from the major harness release that introduces
    OG schema v1" in 17 places. They are in `07 Operational Graph/01–03, 05`,
    `09 Distribution/02 Update.md` and `03 Lifecycles/05 Documents Flow.md`. Document must
    reword them to name the actual release.
  - The read-compat window is still removed at the next major release, as the design says.
- **Open questions 1–3 answered "the rest is ok"**, so all three proposals stand. All nine
  WBS items run as one story. The live E2E `reindex-graph` scenario check moves to
  `description:`/`tags:` in the docs-flow step. The feature branch stacks on the design branch.

## What was open at Context

1. **One story or several?** The design says "implement WBS 1–9 with `/dev`". The proposal is
   one story with all nine items as ordered plan steps. This follows the precedent
   `DESIGN-20261102-Q5MU`, which ran as a single 11-step story. Item 7's "canonical changes
   are merged" would then mean "committed on this branch", with `patch prepare` and
   `patch apply` run locally from it. The alternative is to stop after item 7, merge, and run
   items 8–9 as a second story.
2. **E2E scenario update.** Should the `purpose:`/`keywords:` assertion in the live
   `reindex-graph` scenario move to `description:`/`tags:` as part of this story? Proposed:
   yes, in the same step as the docs-flow change (WBS 6).
3. **Branch base.** The design branch is not merged into `main` yet. Ceremony can either stack
   the feature branch on the design branch, or wait until the design PR is merged and then
   branch from `main`. Proposed: stack on the design branch and rebase once it is merged.
   **Resolved at Ceremony (2026-11-18):** the developer said "i d like to stay on this
   branch", so there is no separate feature branch. Implementation lands on
   `docs/design-20261117-7931-okf-knowledge-base`, and the design and its implementation
   go to `main` in one PR.
