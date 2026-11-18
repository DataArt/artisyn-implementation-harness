# Reindex graph

Rebuild the operational graph (`project:docs/.og/`) on demand — so a developer can
refresh it after editing docs by hand, after a `/dev document` or `/design publish`
run, after a canonical tool fix ships (a corrected renderer, a new derived edge
type) with no need for a full launch re-run, or on an existing repo that has never
had a full intelligent pass. This procedure owns its own deploy/refresh step (Step
0 below), so it never requires `project:docs/.og/` to already exist.
`/implementation-harness launch`'s own Materialize stage
([01d Launch graph/verify](launch/01d-launch-graph-verify.md)) delegates to this
procedure wholesale, every run — it decides first-install vs. refresh itself.

## Staleness check

Every lifecycle reference point that queries the graph (`dev`'s Context Gathering,
Plan, and Document stages; `design`'s Context Gathering, Research, and Publish
stages) treats it as stale under the same mechanical test: any file under `docs/`
with a newer mtime than `docs/.og/docs-operational-graph.sqlite` itself. Run
`find docs -newer docs/.og/docs-operational-graph.sqlite -name '*.md'`; non-empty
output means stale — fall back to grep/glob for that query instead of trusting
the graph's results. This is deliberately a cheap mtime check, not a content
hash: a false "stale" (a doc touched without content changing) only costs an
unnecessary fallback read, never a wrong answer; `build()`/`reindex()` is cheap
enough to also just run it proactively when in doubt, rather than relying on the
check alone.

## Procedure

### Step 0 — Deploy or refresh the scripts

Check `project:docs/.og/docs-operational-graph.sqlite` for existence **before**
copying anything — that answer decides both this step's scope and Step 2's below.

- **Doesn't exist (first install):** copy `package:canonical/docs/.og/cli.mjs`,
  `constants.mjs`, `schema.mjs`, `utils.mjs`, `docs.mjs`, `edges.mjs`, and
  `docs-operational-graph.sqlite` verbatim into `project:docs/.og/` — never
  `cli.test.mjs`, canonical-only tooling, not deployed payload; no token
  substitution, this is code and a binary database file, not prose.
- **Already exists (refresh):** copy only the six module files
  (`cli.mjs`/`constants.mjs`/`schema.mjs`/`utils.mjs`/`docs.mjs`/`edges.mjs`)
  from the same source, overwriting the live ones — this is how a tool fix or
  feature shipped in canonical (e.g. a corrected Mermaid renderer, a new derived
  edge type) reaches an already-materialized project without a full launch
  re-run. Never touch `docs-operational-graph.sqlite` or `graph.mmd` here — they
  hold real indexed data; Step 1 updates them in place, it doesn't replace them.
- **Both cases:** copy `package:canonical/docs/.og/gitignore` to
  `project:docs/.og/.gitignore`, as `canonical/manifest.json`'s `deployRenames` says. The
  package ships it without the dot because npm packing drops `.gitignore` files. It
  ignores the v0 DB backup. Never copy over `project:docs/.og/og.config.json`: it is
  project-owned and names the Product folder.

This copy is idempotent: a verbatim file-for-file overwrite from the same
source, every run, not a merge or a diff-and-patch. Running it twice in a row
with no canonical change produces byte-identical files the second time — safe
to run on every `reindex-graph` invocation, never only "when something
changed," since there is no drift-detection step to get wrong or skip by
mistake.

### Step 0b — Migrate the docs when needed

Run `node docs/.og/cli.mjs migrate --dir <project root> --check` and read its JSON
(`{ pending, counts, missingConfig, invalidConfig }`). It always exits 0. Opening the DB
may migrate its schema from v0 to v1. OG then leaves a copy of the old DB in
`docs/.og/docs-operational-graph.v0.bak.sqlite`.

1. **`missingConfig: true`** — `docs/.og/og.config.json` is absent and the launch answers
   do not name the Product folder. Ask the developer which folder under `docs/` holds the
   shared product docs, or "none". Write `{"productDir": "docs/<folder>"}`, or `{}` for
   none. Later runs then stop asking.
2. **`invalidConfig`** — show the reason. Ask the developer to fix the file. Until then OG
   indexes no Product tier.
3. **`pending: false`** — say "no migration needed" and go to Step 1.
4. **`pending: true`** — run `node docs/.og/cli.mjs migrate --dir <project root> --dry-run`.
   Show the developer a short summary: `filesChanged`, the node and edge counts before
   and after, `mergedEdges`, `overviewConflicts` and the `needsWriter` count. Ask them to
   confirm.
   - **Confirmed:** run `node docs/.og/cli.mjs migrate --dir <project root>`. Launch adds
     `--allow-dirty`, because its own files are not committed yet. Any other caller does
     not.
   - **Exit 1:** stop. Print the reason (dirty `.md` files, a newer DB, a failed schema
     migration). Skip Step 1. The developer commits or stashes and runs this again.
   - **Declined:** skip `migrate`. Still run Step 1 and the `check` report, and end with
     "migration pending". The graph keeps its data, because OG still reads the old
     `purpose`/`keywords` keys until the docs are migrated.

After a real `migrate`, report its JSON: authored edges before and after, `mergedEdges`
and `orphanedAuthored` (must be empty). Hand the `needsWriter` list to
`@docs-writer` in Step 2a.

### Step 1 — Deterministic build

Files under `docs/` owned by other tooling go in `docs/.ogignore`: one project-relative
path prefix per line (`docs/vendor/`, `docs/agents/issue-tracker.md`), `#` comments allowed.
Listed paths are never indexed and never receive a frontmatter `id`; a previously indexed
path is pruned on the next build. Ask the developer about externally owned paths before the
first build in a repo whose `docs/` predates the harness.

Run `node docs/.og/cli.mjs build --dir <project root>` directly, no copy step.
Report the real result — parse its JSON output:

- `skipped` — malformed HLD container names, if any, with the reason given
- `pruned` — doc IDs removed because their file is gone or out of scope, if any
- `scopeViolations` — out-of-scope files that still carry an OG `id:`, if any
- `orphanedAuthored` — authored edges removed with a pruned row; each needs a writer to
  retarget it (`index --edge … --to`) or accept the loss
- `frontmatterErrors` — docs whose frontmatter is outside the supported YAML subset
- `invalidConfig` — when `og.config.json` was ignored

Then run `node docs/.og/cli.mjs check --dir <project root>` and print its `counts` and
every finding: missing `type`/`description`/`tags`, broken `index.md` entries, concept
docs their folder's `index.md` does not list, bundle roots without
`okf_version: '0.2'`, and frontmatter errors. `check` reports; writers fix.

A non-zero exit means `build()` failed; show the diagnostic it printed and stop —
never retry silently, never partially apply.

### Step 2 — Intelligent scan

This is the one place in the whole operational-graph tool that reads content and
writes `description:`/`tags:`/content-reference edges — `cli.mjs` itself stays
deterministic and model-free (the design's "zero new runtime deps, no model calls"
constraint applies to the script, not to this skill procedure). Read
`docs/Engineering Guide/Documentation/02 Structure.md` once, first, before scanning
anything — its tier rules (what HLD/LLD/Engineering Guide/Story/README each own,
and how they relate) are what makes a cross-reference grounded rather than guessed.
Three passes, in this order — each one needs the previous pass's output:

**2a — Fulfill the docs table, one doc at a time.** Run `node docs/.og/cli.mjs
list --dir <project root> --missing description,tags` and parse its JSON array. Add
the `needsWriter` docs from Step 0b, if it ran. For each doc, read it and apply
`Documentation/01 Principles.md`'s "Operational graph frontmatter" rule: write
`description:` (one line, what the doc is for) and `tags:` (a short list), from your
own understanding of its actual content. Set `updated` to
`{ by: process:reindex-graph, at: <now in UTC> }`. Additive-only for a doc that
already has one of the two fields — only fill in what's missing. Only frontmatter
changes in approved or archived Story files. Re-run `node docs/.og/cli.mjs build
--dir <project root>` once this pass is done, so every doc's row in the db actually
has its `description`/`tags` before Step 2b reads them.

**2b — Rebuild edges from the now-complete docs table.** The `build()` you just ran
already did the keyword-overlap half of this pass on its own: it re-derives every
`keyword-match` edge straight from the `tags` column (`edges.mjs`'s
`computeKeywordMatches()`), with no doc read and no agent judgment involved. Do not
re-derive that case by hand — if two docs' tags already overlap, their edge is
already in the db.

Your job in 2b is only the relationships keyword overlap _can't_ express — a real,
specific reference one doc makes to another, not just shared vocabulary. Run `node
docs/.og/cli.mjs list --dir <project root>` (no `--missing` filter) to see every
doc's `title`/`description`/`tags`, then write an edge wherever a doc's `description`
names another doc it concretely realizes or depends on, or where 2a's read turned
up an explicit markdown link to another doc under `docs/` — not just plausible by
tier position (tier adjacency alone is what the deterministic
`mirrors-consistent`/`mirrors-gap` edges already cover). Write each one:
`node docs/.og/cli.mjs index --dir <project root> --doc <this-doc-path> --edge
references --to <the-doc-it-references>`. Use one of the five named `EDGE_TYPES`
instead only when the relationship is unmistakably that exact graduation event
(rare for pre-existing docs — that needs certainty about _why_ the doc was
written, not just that it relates to another); otherwise use the generic
`references` type.

Do not invent **graduation** provenance for these docs. Pre-existing docs have no
stored link to the Story/ticket that produced them (most Stories are archived or
gone, and fabricating one would misattribute it). The authored `derived=0`
graduation edge types (`story-to-hld` etc.) stay exactly as `dev/06-document.md`'s
and `design/09-publish.md`'s existing write-path wiring produces them — forward
from here, never backfilled. `references` edges are different: they assert a real,
grounded content link, not a claimed graduation event.

**2c — Review for stale or illogical relations.** Once 2b has written its edges,
read back every doc's own edges (`node docs/.og/cli.mjs query --dir <project root>
--related-to <path>`, or inspect the full set) and re-check each one against what
you now know: does it still hold up, or did an earlier pass get the relationship
wrong, or has the target doc's purpose since changed enough that the edge no
longer fits? Retract anything that doesn't: `node docs/.og/cli.mjs unedge --dir
<project root> --doc <path> --edge <type> --to <path>`. This is a correction pass,
not a rubber stamp — report what you retracted and why, not just a clean bill.

Re-run `node docs/.og/cli.mjs build --dir <project root>` once more after 2b/2c so
the final edge set lands in the db and `graph.mmd` reflects it. Report how many
docs were scanned, how many got frontmatter written, how many `keyword-match`
edges `build()` derived on its own (no agent involvement), how many `references`
edges you wrote by hand in 2b, and how many were retracted in 2c.

**Skip this step** when Step 0 found the db already existed (a refresh, not a
first install) — say so explicitly rather than silently running a partial scan. One
exception: when Step 0b migrated and listed `needsWriter` docs, run 2a for those docs
only, then rebuild.

## Completion evidence

`docs/.og/docs-operational-graph.sqlite` and `docs/.og/graph.mmd` have a newer
mtime than before the run. The developer sees, not swallowed: the Step 0b outcome
(no migration needed, migrated with its counts, declined as "migration pending", or
stopped with its reason); the `build` report; the `check` counts; and, when Step 2
ran, the scanned/frontmatter-written/edges-written/retracted counts — this is a standalone,
developer-invoked operation, not a silent background step.
