---
id: 9ce77df8
---

# DESIGN-20261102-Q5MU: Deterministic Docs Knowledge Graph — Intent

- **Ticket**: `DESIGN-20261102-Q5MU` — a local design ID, not a Jira issue. Confirmed
  in the design's own `Report.md` Completion row: "Implementation ticket not
  published to Jira — developer chose `/dev` directly in this repo." No tracker
  fetch was run for this reason.
- **Date**: 2026-11-02
- **Sources**:
  - Approved design, `product-design` track (this is cross-project harness tooling,
    not this repo's own application architecture):
    `docs/Stories/product-design/approved/[DESIGN-20261102-Q5MU] Deterministic Docs Knowledge Graph/solution/Architecture.md`
    (the spec — not copied here) and the 6 decision design/evaluate files alongside it.
  - `docs/Stories/product-design/approved/[DESIGN-20261102-Q5MU] Deterministic Docs Knowledge Graph/solution/Efforts.md`
    — the single-ticket, 11-step ordered build sequence this implementation follows.
  - `docs/Stories/product-design/approved/[DESIGN-20261102-Q5MU] Deterministic Docs Knowledge Graph/design/Report.md`
    — design lifecycle history and the developer's own confirmed decisions.
  - Published Product-track docs at `docs/Harness/07 Knowledge Graph/`.

## What is the problem?

Lifecycle skills (`/dev context`, `/design frame`/`research`) currently rely on
grep/glob to find related docs across tiers (HLD, LLD, Engineering Guide, Stories,
Product). There is no structured, queryable record of how docs relate to each other
(e.g. which Story published to which HLD doc, whether an LLD folder still mirrors
its HLD container). This makes context gathering slower and makes drift between
tiers (like an HLD container with no matching LLD folder) invisible until someone
notices by hand.

## What does better look like?

A deterministic, file-based knowledge graph (`docs/.kb/docs-graph.sqlite`, built by
one new script `docs-graph.mjs`) that:

- Assigns every doc a stable, collision-safe ID (idempotent, additive-only).
- Records the six named graduation edges (Story → HLD/LLD/Engineering
  Guide/Product/README, per `docs/Harness/03 Lifecycles/05 Documents Flow.md`) plus
  a computed `mirrors-consistent`/`mirrors-gap` edge between HLD containers and LLD
  folders.
- Is queried by Context/Research (`/dev context`, `/design frame`/`research`), with
  required fallback to grep/glob when the graph is missing, stale, or unavailable.
- Is written to automatically by Document/Publish (`/dev document`, `/design
publish`) as a side effect of completing, non-blocking on failure.
- Is built proactively by `/harness-bootstrap launch` (assigns IDs to existing docs
  missing one, builds the initial graph).
- Is visualized two ways from the same `.sqlite` file: a VitePress graph page
  (client-side `sql.js` query, list/table by tier) shipped as part of the existing
  Web container's static build, and a generated Mermaid artifact for IDE-side
  viewing.
- Has a CI smoke test covering schema ops and a cross-read check (the same file
  `node:sqlite` writes, opened and queried by `sql.js`, no conversion step).
- Is validated end to end by running `/harness-bootstrap launch` against this repo
  once everything above is wired (the acceptance check for the whole unit, per
  `solution/Efforts.md` step 11).

"Done" is the 11 build steps in `solution/Efforts.md` complete, with step 11's
bootstrap-launch run confirming existing docs without IDs get one, the graph builds,
and both representations reflect it.

## Who and what is affected?

- **Harness tooling, repo-wide**: a new `docs-graph.mjs` core module plus wiring
  into `/dev context`, `/design frame`, `/design research`, `/dev document`,
  `/design publish`, and `/harness-bootstrap launch`.
- **Web container** (`apps/docs-web/`): `yarn build`/CI gains a `build()` step
  producing the `.sqlite` asset, plus a new minimal graph page.
- **CI**: a new smoke test.
- No change to `CLAUDE.md`'s container table (Web / Auth / Infrastructure /
  Discuss) or to the Browser → CloudFront → S3 data flow — confirmed explicitly in
  `solution/Architecture.md`'s "Plugging into the existing system" section. This is
  additive tooling, not a new deployed container.
- Future consumers (not built here): the harness-bootstrap package once
  `docs/Harness/package/` exists, and any project this harness is bootstrapped into.

## What is out of scope?

- A second script or storage backend — `docs-graph.mjs` is the only script; SQLite
  via `node:sqlite` is the only store (Decision 1, Architecture.md).
- A full-featured interactive graph UI — the VitePress page is a minimal
  list/table-by-tier view; a richer rendering library stays open per Decision 4.
- A finished IDE-side rendering mechanism — only a generated `.mmd`/`.md` artifact
  openable via existing editor preview; the mechanism itself is explicitly deferred
  as a spike (Architecture.md Decision 4, Efforts.md step 9).
- Packaging into `docs/Harness/package/` for cross-project bootstrap — that package
  does not exist yet; this ticket ships the script inside this repo only.
- Modeling HLD version supersession as a graph edge — already covered by the
  folder-per-version/README-router convention (Architecture.md, Node and edge model).
- Jira tracking — this ticket is implemented directly via `/dev` with no Jira issue,
  consistent with the design's own Completion note.

## What are the constraints?

- Zero new npm dependencies for the core module (`node:sqlite`'s `DatabaseSync` is
  a Node built-in); `sql.js` is the one new dependency, scoped to the client-side
  VitePress page (Decision 1, 4).
- ID assignment must be additive-only and idempotent: insert one frontmatter field,
  never touch other content, skip docs that already have an ID.
- Graph writes at Document/Publish must be non-blocking: failure is reported, the
  lifecycle stage continues.
- Graph reads at Context/Research must have a required (not best-effort) fallback
  to grep/glob when the graph is missing, stale, or unavailable.
- `/harness-bootstrap launch` must stay silent on success and exit non-zero with a
  diagnostic on failure — no new confirmation prompt.
- `docs/.kb/docs-graph.sqlite` and `docs-graph.mjs` must not be hardcoded to a region
  or introduce a guarded command in their own operation (per `CLAUDE.md`'s hard
  stops); none of the design artifacts suggest either risk, but it is called out
  here as a build-time constraint.
- The approved `solution/Architecture.md` and the six `solution/Design -
{Decision}.md` files are the spec for all six decisions; this intent does not
  restate them.

## What is still open?

None at sign-off. The design was fully evaluated and confirmed (6 decisions,
WAF-reviewed, developer sign-off recorded in `design/Report.md`'s Evaluate and
Solution rows). `solution/Efforts.md` states explicitly that the implementation-time
spikes (deterministic ID generation scheme, fallback/failure-mode specifics, IDE
rendering mechanism) are "resolved pragmatically inline during the run, then checked
against reality in step 11 — not researched ahead of time." Those inline decisions
belong to Plan/Implement, not to this intent.

**Appended during Plan rework (2026-11-02):** `solution/Architecture.md`'s "no new
container, no new infra" framing and its "Packaging into `docs/Harness/package/` ...
out of scope" note (above) both remain true, but the design did not account for the
fact that a real cross-project packaging mechanism already exists at
`.canonical-implementation-harness/canonical/` (confirmed via `.claude/skills/harness-bootstrap`'s
symlink to it) — a different path than the `docs/Harness/package/` the design
assumed didn't exist yet. The developer's direction: build `docs-graph.mjs` and its
tests as portable canonical package content under `canonical/docs/.kb/`, wire
`/harness-bootstrap launch`'s stage sequence and the dev/design skills at their
canonical source (`canonical/skills/dev|design/`), and validate propagation into
this repo's own live `.claude/skills/` and `docs/.kb/` by actually running
`/harness-bootstrap launch` against this repo, before wiring the VitePress page to
the artifact that run produces. This does not change the intent's problem, outcome,
or affected-container boundaries — it corrects _where_ the implementation lives so
it is reusable by every project this harness bootstraps into, per this repo's own
stated purpose of being the harness's canonical source (`CLAUDE.md` "Why").
