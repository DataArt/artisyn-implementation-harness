# DESIGN-20261117-7931 — OKF-Compatible Knowledge Base

## Problem

The harness docs are close to OKF but do not conform to it, and OG can write IDs into files it should never touch.

**What we have.** The harness keeps its knowledge in `docs/` as markdown. Each doc has OG frontmatter: `id`, `purpose`, `keywords`.

**What OKF expects.** Google Cloud's Open Knowledge Format (OKF, v0.2, experimental) is an emerging convention for giving agents curated context. It uses markdown files with YAML frontmatter. Each file needs a `type` key. Links are untyped. Two filenames are reserved:

- `index.md`: a navigation listing with no frontmatter, except `okf_version` at the bundle root.
- `log.md`.

**Gaps found in code (established):**

| #   | Gap                                                                                                                                      | Evidence                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | No doc has a `type` key. The tier lives only in the OG database column.                                                                  | OG frontmatter is `id`, `purpose`, `keywords`                      |
| 2   | Every `index.md` carries frontmatter and is indexed as a concept node.                                                                   | OKF reserves `index.md` without frontmatter                        |
| 3   | `index --doc` has no scope guard. It stamps an `id:` into any file it is given: outside `docs/`, an `index.md`, or an `.ogignore`d path. | `DocsStore.assign` write path                                      |
| 4   | `reindex` scans only `docs/` and prunes all other rows. The stray `id:` stays in the file.                                               | `apps/web-explorer/README.md` has `id: ffe6a029` with no graph row |
| 5   | The OG docs still describe an `AppReadme` tier for `apps/*/README.md`. The code no longer keeps it.                                      | `07 Operational Graph/01 Ops Model.md`                             |
| 6   | `.ogignore` holds path prefixes only. It cannot say "every `index.md`".                                                                  | `.ogignore` format                                                 |

**Why now.** The harness ships into other projects. A published convention lets external agents and consumers read the knowledge base without learning OG. The leak also copies stray IDs into every consuming project.

**Current state:**

```mermaid
flowchart LR
    classDef primary fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef external fill:#E8F4FD,stroke:#4A90D9,color:#2C5F8A
    classDef store fill:#F0F7EE,stroke:#5A8A5A,color:#2D4A2D
    classDef problem fill:#FFF0F0,stroke:#D9534F,color:#8B0000

    W["Writer / agent"]:::external
    L["reindex-graph<br/>lifecycle step"]:::external

    subgraph OG["OG — docs/.og/"]
        direction TB
        IDX["index --doc &lt;any path&gt;"]:::primary
        ASSIGN["DocsStore.assign<br/>no path guard"]:::problem
        RE["reindex<br/>docs/ only + .ogignore prefixes"]:::primary
        PRUNE["prune rows<br/>outside docs/"]:::problem
        DB[("SQLite<br/>rows + tier column")]:::store
    end

    subgraph FILES["Files on disk"]
        direction LR
        FM["doc frontmatter<br/>id · purpose · keywords<br/>no type key"]:::problem
        INDEXMD["index.md<br/>frontmatter + concept node"]:::problem
        OUT["apps/*/README.md<br/>stray id:"]:::problem
    end

    W --> IDX --> ASSIGN
    L --> RE
    ASSIGN -->|"writes id:"| FM
    ASSIGN -->|"writes id:"| INDEXMD
    ASSIGN -->|"writes id:"| OUT
    ASSIGN -->|"row + tier"| DB
    RE --> PRUNE
    PRUNE -.->|"row gone, id: stays"| OUT

    style OG fill:#F5F9FF,stroke:#4A90D9,color:#2C5F8A
    style FILES fill:#FAFAFA,stroke:#999,color:#333
```

The tier is derived from the path and stored only in SQLite. No file carries it.

## Success

### Known ECs

- EC1: The harness knowledge base under `docs/` conforms to OKF v0.2. Every concept doc carries a frontmatter `type`. `index.md` files follow OKF's reserved-file rule.
- EC2: OG never writes frontmatter into an `index.md` and never indexes one into the graph.
- EC3: OG never writes into or indexes any file outside `docs/`.
- EC4: The rules land first in the canonical package (`skills/implementation-harness/`). They reach this repo through `/implementation-harness patch prepare` → `patch apply`. The repo dogfoods its own patch flow.
- EC5: The docs flow is adjusted so writers produce conformant frontmatter: `@docs-writer`, Documentation Principles, Documents Flow, and the `/design publish` and `/dev document` steps.
- EC6: OG stays the single query layer. OKF adds a file convention, not a second graph. Skills keep querying OG only.

### Proposed ECs

- [proposed] EC7 — No silent provenance loss. Four authored graduation edges point into index pages: 2 `story-to-hld` into the HLD index, plus 1 `story-to-hld` and 1 `impl-to-engineering-guide` into the Engineering Guide index. Each is retargeted or explicitly dropped. Node and edge counts are diffed before and after migration. The stray `id:` in `apps/web-explorer/README.md` is removed.
- [proposed] EC8 — The site still works. VitePress still renders `docs/index.md` (home layout, needs `layout`/`hero` frontmatter) and the section landing pages. The docs build passes.
- [proposed] EC9 — Guards fail loud and are tested. `index --doc` on a guarded path exits non-zero with a clear message. `index --doc` honors `.ogignore`, not only `reindex`. Both are covered in `cli.test.mjs`.
- [proposed] EC10 — Safe for consuming projects and reversible. `patch apply` is idempotent on a project that already has stamped `index.md` or out-of-docs IDs, and does not break it. A deterministic check verifies conformance (the spec ships no validator). The OKF version is pinned, so the convention can be dropped cheaply if OKF does not catch on. The migration detects the project's state and handles greenfield, older-harness and already-migrated projects; running it again changes nothing.

## Decisions

Each decision gets its own Research → Evaluate → Solution loop. The delivery order (canonical first, then patch to this repo) is a fixed constraint, not a decision.

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Why it's independent                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Target frontmatter format** — the exact key set and value rules every concept doc carries. The developer's direction is to stay close to canonical OKF: `type` (required), `title`, `description` (was `purpose`), `tags` (was `keywords`), `timestamp`. Open within it: `timestamp` versus OKF v0.2's `generated: {by, at}` (v0.2 superseded `timestamp`), keeping OG's `id` as an extra key, the `type` vocabulary and who writes it, the `title` source, `tags` list syntax, and existing `name:`/`type: reference` keys from templates. Covers EC1, EC5. | It is the file contract. Any schema, layout or guard can carry it, and it can be approved on its own.                                                                                                       |
| 2   | **Graph schema and migration** — the SQLite `docs` table that follows the format (rename, add or drop columns; a schema version via `PRAGMA user_version`), and how existing databases and docs migrate. Migration ships as a `patch` instruction that restructures frontmatter, migrates the database and reindexes. Covers EC6, EC7, EC10.                                                                                                                                                                                                                   | The same format can be stored under internal column names or renamed ones. The migration mechanics stand alone.                                                                                             |
| 3   | **OKF bundle layout** — where the bundle root and `okf_version` sit. How `index.md` meets the reserved-file rule, given VitePress needs `docs/index.md` home frontmatter and some index pages carry real content. Whether to add `log.md`. Whether conformance lives in the source tree or a generated export. The developer proposed five tier bundles (HLD, LLD, Stories, Engineering Guide, Product) as a candidate. Covers EC1, EC8, EC10.                                                                                                                 | It is about files and folders, not key names or OG code. Options: in-place, generated export, hybrid.                                                                                                       |
| 4   | **OG scope guard** — what OG may write to and index: where the guard sits (`assign`, `index --doc`, `reindex`), the rule set (only under `docs/`, never `index.md`, `.ogignore` honored on every write path), what happens to the `AppReadme` tier and `impl-to-readme` edge, and how the 4 graduation edges into index pages and the stray `apps/web-explorer/README.md` id are migrated. Covers EC2, EC3, EC6, EC7, EC9.                                                                                                                                     | It fixes a real leak that exists with or without OKF. It is a code and edge-migration choice with its own options (built-in rule vs extended `.ogignore` syntax vs config list), and could ship on its own. |

The decisions meet in three places. Decision 1's keys decide Decision 2's columns. At `index.md`, Decision 4 decides whether index pages leave the graph and Decision 3 decides what their frontmatter becomes. The bundle roots in Decision 3 may line up with OG's tiers, which Decision 1's `type` can reuse. Evaluate checks the picks agree.

## Boundaries

**In scope:**

- The target frontmatter format for docs under `docs/`, close to canonical OKF.
- A migration instruction shipped in the `patch` that restructures frontmatter, migrates the database and reindexes.
- OKF `generated: {by, at}` (creation) and an `updated: {by, at}` extension key (last meaningful update). `updated` is not an OKF key; OKF allows extra keys.
- Fix: the Product folder name is set per project at harness launch. Canonical OG reads it from launch configuration instead of hard-coding `docs/Harness`.
- A migration that handles three project states: greenfield launch (nothing to migrate), a project on an older harness (migrate), and a project already migrated (no-op).
- OG's SQLite schema (`docs` table columns), and migrating existing databases in this repo and in consuming projects.
- `index.md` handling.
- The OG scope guard: `index`, `reindex`, `assign`.
- The fate of the `AppReadme` tier and the `impl-to-readme` edge.
- Migrating existing docs and edges.
- Updating the OG docs (`07 Operational Graph`), Documents Flow, Documentation Principles and `@docs-writer`.
- Canonical package changes, plus a patch bundle applied to this repo.

**Out of scope:**

- Writing typed edges into the files. They stay in SQLite; OKF defers lineage.
- Replacing OG's query model. Commands (`search`, `query`, `index`, `reindex`) keep their roles; only their columns and guards change.
- Treating harness config (skills, agents, CLAUDE.md) as OKF concepts.
- OKF trust fields `status`, `verified`, `stale_after`. Possible follow-up. (`generated` is in scope.)
- Publishing the bundle to any external catalog.

## Constraints

| Constraint                                                                                                                                                                                                                                 | Status                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| OKF is v0.2 and experimental. This frame read `SPEC.md` through a summary only.                                                                                                                                                            | Open: Research must re-verify against the source |
| The canonical OG code is byte-identical to this repo's `docs/.og/`. One canonical change patches cleanly.                                                                                                                                  | Established                                      |
| VitePress needs frontmatter on `docs/index.md` (home layout).                                                                                                                                                                              | Established                                      |
| Some section `index.md` pages carry real content, not only navigation: `09 Distribution`, `05 Principles`, `02 Quick Start`.                                                                                                               | Established                                      |
| `.ogignore` is prefix-only.                                                                                                                                                                                                                | Established                                      |
| OG is deterministic, with no model calls.                                                                                                                                                                                                  | Established                                      |
| `id` is additive-only and never reassigned.                                                                                                                                                                                                | Established                                      |
| The schema in `docs/.og/schema.mjs` is `CREATE TABLE IF NOT EXISTS` with no version, so a column change needs an explicit migration. A rebuild from files is not enough: authored edges (graduation and `references`) live only in SQLite. | Established                                      |
| Guarded commands (`git push`, `cdk deploy`, the agent E2E run) are never run by the agent.                                                                                                                                                 | Repo convention                                  |
| `yarn` only. No hardcoded region. Node 24 for `node:sqlite`.                                                                                                                                                                               | Repo convention                                  |

## Links

- Ticket: DESIGN-20261117-7931 (local design ID, no tracker ticket)
- Related tickets: none
- Reference docs:
  - `docs/Harness/07 Operational Graph/` (01 Ops Model, 02 Storage and Build Model)
  - `docs/Harness/03 Lifecycles/05 Documents Flow.md`
  - `docs/Engineering Guide/Documentation/01 Principles.md`
  - `skills/implementation-harness/references/reindex-graph.md`
  - `skills/implementation-harness/references/patch/`
  - OKF spec: https://raw.githubusercontent.com/GoogleCloudPlatform/knowledge-catalog/main/okf/SPEC.md
