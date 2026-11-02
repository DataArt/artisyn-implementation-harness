---
id: 112687ab
---

# DESIGN-20261102-Q5MU: Deterministic Docs Knowledge Graph — Design: Graph storage format

Two tables — `docs` and `relations` — persisted in one file, `docs/kb/docs-graph.sqlite`,
written by `docs-graph.mjs` through `node:sqlite` and read by both Node and the
browser against the same bytes, no export step between them.

## Schema and dual-runtime access

```mermaid
flowchart TD
    subgraph FILE ["🗄️ docs/kb/docs-graph.sqlite"]
        direction TB
        DOCS["docs\nid (PK, unique)\ntier\npath\ntitle\npurpose\nkeywords\nupdated_at"]:::table
        REL["relations\nfrom_id (FK → docs.id)\nto_id (FK → docs.id)\nedge_type\nderived (0|1)\nUNIQUE(from_id, to_id, edge_type)"]:::table
        DOCS --- REL
    end

    NODE["📜 docs-graph.mjs\nnode:sqlite DatabaseSync\nsynchronous, parameterized CRUD"]:::node
    BROWSER["🌐 VitePress graph page\nsql.js (WASM SQLite)\nclient-side query, no export"]:::browser

    NODE -->|"build() writes"| FILE
    FILE -->|"static asset, same bytes"| BROWSER
    NODE -->|"query()/search() reads"| FILE

    classDef table   fill:#4B5563,stroke:#374151,color:#fff
    classDef node    fill:#D97706,stroke:#B45309,color:#fff
    classDef browser fill:#0E7490,stroke:#0c4a6e,color:#fff
```

| Column       | Type           | Description                                                                                                                                                                                    |
| ------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | TEXT           | Primary key, unique.                                                                                                                                                                           |
| `tier`       | TEXT           | One of `HLD`/`LLD`/`EngineeringGuide`/`Story`/`Product`/`AppReadme`.                                                                                                                           |
| `path`       | TEXT           | Relative repo path.                                                                                                                                                                            |
| `title`      | TEXT           | The doc's human-readable title — frontmatter `title:` if present, else the doc's first `# ` heading.                                                                                           |
| `purpose`    | TEXT, nullable | Frontmatter `description:`/`summary:` if present, else null; one of two fields allowed to be absent, consistent with graceful degradation for docs that don't carry a description yet.         |
| `keywords`   | TEXT, nullable | A list of search keywords from frontmatter `keywords:` if present, else null; the other field allowed to be absent, no fallback derivation. Broadens `search()` beyond title/purpose matching. |
| `updated_at` | TEXT           | ISO timestamp of the last index run that touched the row.                                                                                                                                      |

| Column      | Type    | Description                                                                                                                                                                           |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from_id`   | TEXT    | Foreign key into `docs.id`.                                                                                                                                                           |
| `to_id`     | TEXT    | Foreign key into `docs.id`.                                                                                                                                                           |
| `edge_type` | TEXT    | One of the seven types in `solution/Architecture.md`'s node and edge model.                                                                                                           |
| `derived`   | INTEGER | `0` for the six authored graduation edges, `1` for the computed `mirrors-consistent`/`mirrors-gap` edge — lets a consumer tell an edge someone wrote from an edge the build computed. |

Composite uniqueness on `(from_id, to_id, edge_type)` — the same edge between the same two docs is never recorded twice; a second write to an existing edge is an upsert, not an insert.

### Why an edge list, not a parent column

`relations` is an edge list, not a `parent_id` column on `docs`. A single doc can have multiple outgoing edges of different types in the same build — for example, one Story producing a `document-arch-deviation` edge to an HLD doc, a `document-component-detail` edge to an LLD doc, and a `document-operational-steps` edge to an Engineering Guide doc, all at once. A `parent_id` field allows only one parent per doc and cannot represent this, nor the derived `mirrors-consistent`/`mirrors-gap` edge, which relates two already-existing docs to each other rather than expressing a parent-child creation relation.

## Example

Sample `docs` rows:

| id                | tier             | path                                             | title         |
| ----------------- | ---------------- | ------------------------------------------------ | ------------- |
| `s-20261102-a1b2` | Story            | `Stories/[ND-42] Example/design/`                | Example Story |
| `hld-web`         | HLD              | `Target Architecture (HLD)/v1/Containers/Web.md` | Web           |
| `lld-web`         | LLD              | `System Architecture (LLD)/Web/00. Overview.md`  | Web Overview  |
| `eg-deploy`       | EngineeringGuide | `Engineering Guide/12 Deploy.md`                 | Deploy        |

Sample `relations` rows:

| from_id           | to_id       | edge_type                    | derived |
| ----------------- | ----------- | ---------------------------- | ------- |
| `s-20261102-a1b2` | `hld-web`   | `document-arch-deviation`    | 0       |
| `s-20261102-a1b2` | `lld-web`   | `document-component-detail`  | 0       |
| `s-20261102-a1b2` | `eg-deploy` | `document-operational-steps` | 0       |
| `hld-web`         | `lld-web`   | `mirrors-consistent`         | 1       |

One Story produces three authored edges to three different destination tiers in the same build; the fourth row is the derived mirror edge between the HLD and LLD docs, computed from their matching names, unrelated to the Story.

## Access pattern

Node-side callers (`docs-graph.mjs` itself, lifecycle-skill invocations, CI) use
`node:sqlite`'s `DatabaseSync`: synchronous, parameterized queries only, even
though every input originates from trusted frontmatter.

Browser-side, the VitePress graph page loads `docs-graph.sqlite` as a static
asset and queries it with `sql.js` (the WASM SQLite build) entirely client-side —
no server round-trip, no separate JSON export. The rendering layer that consumes
these client-side query results is specified in
`solution/Design - Visualization surface.md`.

## ID generation

Doc IDs are frontmatter-stored strings, assigned once — at bootstrap for
pre-existing docs, or at Document/Publish time for newly graduating docs — and
never reassigned afterward. The exact deterministic, collision-safe generation
algorithm is an implementation obligation tracked as a spike in
`solution/Efforts.md`; this design fixes only the shape (a stable, immutable,
frontmatter-resident string), not the generation scheme.

### Why a string ID, not an auto-increment integer

`id` is a stable string stored in the doc's own frontmatter, not a database-internal auto-increment integer. Two reasons: (1) the proposed EC requires the graph be deterministically regenerable from frontmatter alone — an auto-increment integer's value depends on insertion order, so a from-scratch rebuild could reassign different integers each time, breaking stability; (2) the ID must be readable directly from the doc file, without querying the database first, so another doc or a human can reference it. An internal SQLite rowid may still be used underneath for storage/index efficiency, with the frontmatter string kept as a separate unique-indexed column — that's an implementation detail for whoever builds the script, not a constraint this design fixes.

## Frontmatter format

Every indexed doc carries this frontmatter block (YAML, at the top of the file):

```yaml
---
id: <unique-string>
title: <string>
description: <string>
keywords: [<string>, ...]
---
```

| Key           | Required?                                                                                                                                                                            | Maps to         | Fallback if absent                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | Required once a doc is indexed (absent before that — see Research's graceful-degradation proposed EC); assigned once, by `docs-graph.mjs`, never hand-authored and never reassigned. | `docs.id`       | None — must exist once indexed.                                                                                                                                        |
| `title`       | Optional.                                                                                                                                                                            | `docs.title`    | `docs-graph.mjs` derives it from the doc's first `# ` heading at index time; the derived value is stored in `docs.title`, not written back into the doc's frontmatter. |
| `description` | Optional.                                                                                                                                                                            | `docs.purpose`  | Left `NULL` — no fallback derivation, since a doc's purpose can't be reliably inferred the way a title can from its first heading.                                     |
| `keywords`    | Optional.                                                                                                                                                                            | `docs.keywords` | Left `NULL` — no fallback derivation, same treatment as `description`.                                                                                                 |

No other frontmatter key is read or written by this design. Existing frontmatter keys a doc already carries (for any other purpose) are left untouched — `docs-graph.mjs` only ever adds `id` (if missing) and reads `title`/`description` if present; it never removes or rewrites an existing key.

## Build flow

```mermaid
sequenceDiagram
    participant Trigger as Bootstrap / Document / Publish
    participant Script as docs-graph.mjs build()
    participant Tree as docs/ tree (frontmatter)
    participant DB as docs-graph.sqlite

    Trigger->>Script: invoke build()
    Script->>DB: open (create if absent)
    Script->>Tree: scan frontmatter IDs
    Tree-->>Script: existing IDs + docs missing an ID
    Script->>Script: assign new IDs where missing
    Script->>Script: extract title + purpose from frontmatter/heading
    Script->>DB: upsert docs rows (refresh updated_at)
    Script->>Tree: read six named graduation actions per doc
    Script->>Tree: diff HLD container file names vs LLD folder names
    Script->>DB: upsert relations rows (respecting composite uniqueness)
    DB-->>Script: build complete
```

1. `build()` opens, or creates if absent, `docs/kb/docs-graph.sqlite` via
   `node:sqlite`.
2. Scans the doc tree for existing frontmatter IDs and assigns new ones where
   missing, per the bootstrap and graduation triggers in
   `solution/Architecture.md`.
3. Upserts `docs` rows by `id` — extracting `title` (frontmatter `title:`,
   falling back to the doc's first `# ` heading), `purpose` (frontmatter
   `description:`, left null if absent), and `keywords` (frontmatter
   `keywords:`, left null if absent) during the same scan —
   refreshing `updated_at`.
4. Computes the seven edge types: six from the named graduation actions already
   recorded against each doc, one (`mirrors-consistent`/`mirrors-gap`) from
   comparing HLD container file names against LLD folder names.
5. Upserts `relations` rows, respecting the composite-uniqueness constraint —
   never a duplicate insert.

## Failure / recovery

A uniqueness-constraint violation — for example a duplicate `id` from a bad
manual frontmatter edit — fails only that row's write. The build does not abort:
it continues upserting every cleanly-resolvable doc and reports the conflicting
doc(s) for manual resolution, matching `solution/Architecture.md`'s
graceful-degradation posture. The exact error-reporting format is a migration/
rollout obligation defined in the implementation, not fixed here.

## Compatibility rule

The schema is additive-only going forward: future revisions may add nullable
columns with defaults. `id` and the `(from_id, to_id, edge_type)` composite
uniqueness constraint are stable contracts — any consumer, Node or browser, can
rely on both indefinitely.

## Verification

A CI smoke test exercises `CREATE TABLE`, insert, and uniqueness-violation
rejection against the live `node:sqlite` API, so an upstream API regression is
caught immediately. A second fixture test opens and queries, with `sql.js`, the
same file `node:sqlite` produced, confirming no conversion step is needed between
the two runtimes. A third fixture test confirms `title` extraction falls back
correctly to a doc's first heading when no frontmatter `title:` field is
present, and that `purpose` is left null (not an empty string) when no
description exists.
