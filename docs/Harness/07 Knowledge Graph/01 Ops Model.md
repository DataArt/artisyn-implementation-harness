---
id: 04bbbf49
purpose: Describe the knowledge graph's system context and how lifecycle skills wire into it
keywords: [knowledge graph, ops model, system context, operational-graph]
---

# Ops Model

The knowledge graph is additive tooling: a CLI entry (`cli.mjs`) plus its satellite modules (`constants.mjs`, `utils.mjs`, `docs.mjs`, `edges.mjs`, `schema.mjs`) and one SQLite file (`docs/.og/docs-operational-graph.sqlite`), consumed by the existing docs site build. No new container joins the architecture, and the existing browser-to-hosting data flow is unchanged — the graph page ships as part of the same static build output.

## System context

```mermaid
flowchart TD
    DEV(["👤 Developer / Agent"]):::actor

    subgraph HARNESS ["🧰 Bootstrap & lifecycle skills"]
        direction TB
        BOOT["🚀 /harness-bootstrap launch"]:::skill
        CTX["🎯 /dev context\n/design frame · research"]:::skill
        PUB["📤 /dev document\n/design publish"]:::skill
    end

    SCRIPT["📜 cli.mjs + satellites\nbuild · index · query · search"]:::tool
    DB[("🗄️ docs/.og/\ndocs-operational-graph.sqlite\ndocs + edges")]:::store

    subgraph DOCS ["🏛️ Permanent docs/"]
        direction LR
        HLD["🗺️ HLD"]:::hld
        LLD["🔧 LLD"]:::lld
        EG["📖 Engineering Guide"]:::eg
        PCTX["🧠 Product (generic tier,\nthis repo's instance: docs/Harness/)"]:::pctx
        README["📄 apps/*/README.md"]:::readme
    end
    STORY["📁 Stories/&lt;TICKET&gt;"]:::story

    CI["⚙️ Build / CI"]:::infra
    WEB["🌐 Docs site graph page"]:::web
    IDE["🖥️ IDE representation"]:::ide

    DEV --> BOOT & CTX & PUB
    BOOT --> SCRIPT
    CTX --> SCRIPT
    PUB --> SCRIPT
    SCRIPT --> DB
    SCRIPT -. reads/writes IDs + edges .-> HLD
    SCRIPT -. reads/writes IDs + edges .-> LLD
    SCRIPT -. reads/writes IDs + edges .-> EG
    SCRIPT -. reads/writes IDs + edges .-> PCTX
    SCRIPT -. reads/writes IDs + edges .-> README
    SCRIPT -. reads/writes IDs .-> STORY
    CI --> SCRIPT
    DB --> WEB
    DB --> IDE

    classDef actor fill:#2C3E50,stroke:#1A252F,color:#fff
    classDef skill fill:#8E44AD,stroke:#6C3483,color:#fff
    classDef tool  fill:#D97706,stroke:#B45309,color:#fff
    classDef store fill:#4B5563,stroke:#374151,color:#fff
    classDef hld   fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef lld   fill:#0E7490,stroke:#0c4a6e,color:#fff
    classDef eg    fill:#065F46,stroke:#064e3b,color:#fff
    classDef pctx  fill:#7C3AED,stroke:#5B21B6,color:#fff
    classDef story fill:#D97706,stroke:#B45309,color:#fff
    classDef infra fill:#1A6B3C,stroke:#14532d,color:#fff
    classDef web   fill:#0E7490,stroke:#0c4a6e,color:#fff
    classDef ide   fill:#4B5563,stroke:#374151,color:#fff
    classDef readme fill:#4B5563,stroke:#374151,color:#fff
```

## Node and edge model

```mermaid
flowchart LR
    subgraph NODES ["Node types"]
        direction TB
        N1["HLD"]:::hld
        N2["LLD"]:::lld
        N3["EngineeringGuide"]:::eg
        N4["Story\n(design/solution/impl as attributes)"]:::story
        N5["Product\n(generic tier;\nthis repo's instance: docs/Harness/)"]:::pctx
        N6["AppReadme"]:::readme
    end

    N4 -->|"story-to-product"| N5
    N4 -->|"story-to-hld"| N1
    N4 -->|"impl-to-hld"| N1
    N4 -->|"impl-to-lld"| N2
    N4 -->|"impl-to-engineering-guide"| N3
    N4 -->|"impl-to-readme"| N6
    N1 -.->|"references\n(scan-authored)"| N3
    N1 -.->|"mirrors-consistent / mirrors-gap\n(derived)"| N2
    N2 -.->|"keyword-match\n(derived)"| N3

    classDef hld   fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef lld   fill:#0E7490,stroke:#0c4a6e,color:#fff
    classDef eg    fill:#065F46,stroke:#064e3b,color:#fff
    classDef story fill:#D97706,stroke:#B45309,color:#fff
    classDef pctx  fill:#7C3AED,stroke:#5B21B6,color:#fff
    classDef readme fill:#4B5563,stroke:#374151,color:#fff
```

A Story's `design/`, `solution/`, `impl/` subfolders are attributes of its single `Story` node, not separate sub-nodes. Each project bootstrapping the harness instantiates its own `Product` tier under its own name; this repo's instance is `docs/Harness/`.

Ten edge types exist in total, in three families, per `docs/.og/constants.mjs`:

- **`EDGE_TYPES`** (6 types, `derived=0`): `story-to-product`, `story-to-hld`, `impl-to-hld`, `impl-to-lld`, `impl-to-engineering-guide`, `impl-to-readme` — the named graduation actions from `03 Lifecycles/05 Documents Flow.md`, each authored as a Story-to-destination-tier edge by `index()`'s `--edge` flag.
- **`SCAN_EDGE_TYPES`** (1 type, `derived=0`): `references` — a generic content cross-reference, authored by `reindex-graph.md`'s intelligent scan when a doc's content names another doc it references, not a graduation event.
- **`DERIVED_EDGE_TYPES`** (3 types, `derived=1`): `mirrors-consistent`/`mirrors-gap`, computed by diffing HLD container file names (`Target Architecture (HLD)/<Version>/Containers/<Name>.md`) against LLD folder names (`System Architecture (LLD)/<Name>/`), per the naming convention in `docs/Engineering Guide/Documentation/02 Structure.md`; and `keyword-match`, computed from shared `keywords:` frontmatter tokens between any two docs. Neither pair is ever authored.

HLD version supersession is not modeled as a graph edge — the existing folder-per-version/README-router convention already covers it.

The docs-site Graph Explorer groups these ten types into four visual/filter buckets (`cytoscapeStyle.ts`'s `edgeGroup()`): `keyword-match` (automatic, by far the largest group — roughly 503 of this repo's ~660 edges, so it gets the most recessive styling), `references` (scan-authored content links), `graduation` (the six `EDGE_TYPES`), and `mirrors` (the `mirrors-*` pair). See `03 Visualization Model.md`.

## Graph type

Nodes are typed — each is one of the six types above. Edges are typed and directed — each of the ten types above has a defined source-tier → destination-tier meaning, except `references` and `keyword-match`, which may connect any two tiers. A `derived` flag on each edge distinguishes the seven authored edges (the six graduation types plus `references`, written by a lifecycle action or the intelligent scan) from the three computed edges (`mirrors-consistent`, `mirrors-gap`, `keyword-match`, never authored). Cycles are permitted — edges are typed relationship statements, not a dependency or control-flow order, so nothing in this design enforces acyclicity.

## Settled interfaces

| Component                                | Settled interface                                                                                                                                                                                                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cli.mjs` (+ satellites)                 | The script. Ships from the canonical shipping root `.canonical-implementation-harness/canonical/docs/.og/`, deployed into a project's `docs/.og/` by `/harness-bootstrap launch`'s Materialize stage or the standalone `/harness-bootstrap reindex-graph` route. |
| `docs/.og/docs-operational-graph.sqlite` | The data file. Sole producer and consumer is `cli.mjs`.                                                                                                                                                                                                          |

## Lifecycle wiring

Read is required at Context Gathering/Research (`/dev context`, `/design frame`/`research`), with required fallback to existing grep/glob when the graph is missing, stale, or unavailable.

Write is required but tool-automated, not manually authored, at Document/Publish (`/dev document`, `/design publish`): the same script assigns an ID if missing and writes the corresponding graduation edge as a side effect of completing.

Context Gathering and Research query the graph first, with a required fallback to the existing grep/glob pattern when it isn't available:

```mermaid
sequenceDiagram
    actor Dev as Developer/Agent
    participant Phase as /dev context · /design frame/research
    participant Script as cli.mjs
    participant DB as docs-operational-graph.sqlite
    participant Fallback as grep/glob pattern

    Dev->>Phase: start context gathering
    Phase->>Script: query()/search() by related edges
    alt graph available and current
        Script->>DB: read docs + edges
        DB-->>Script: related docs by edge
        Script-->>Phase: related docs surfaced
        Phase-->>Dev: context already in hand
    else graph missing, stale, or script unavailable
        Script-->>Phase: unavailable
        Phase->>Fallback: fall back to grep/glob
        Fallback-->>Phase: context via existing pattern
        Phase-->>Dev: proceeds unblocked
    end
```

```mermaid
sequenceDiagram
    actor Dev as Developer/Agent
    participant Pub as /design publish
    participant Script as cli.mjs
    participant Tier as Destination tier doc
    participant DB as docs-operational-graph.sqlite

    Dev->>Pub: complete publish
    Pub->>Tier: write published doc
    Pub->>Script: assign ID (if missing) + write graduation edge
    Script->>DB: update docs + edges
    DB-->>Pub: graph updated as side effect of publish completing
```

## Bootstrap wiring

The script ships from the canonical shipping root `.canonical-implementation-harness/canonical/docs/.og/`. `/harness-bootstrap launch`'s Materialize stage deploys it into the project's `docs/.og/` and runs it proactively: it assigns deterministic, collision-safe frontmatter IDs to any doc missing one and builds the initial graph in the same pass, silently on success. The standalone `/harness-bootstrap reindex-graph` route deploys and runs the same script on demand, without a full launch.

`/harness-bootstrap launch` invokes the same script to seed the graph for an existing doc tree:

```mermaid
sequenceDiagram
    actor Dev as Developer/Agent
    participant Boot as /harness-bootstrap launch
    participant Script as cli.mjs
    participant Docs as Existing docs/
    participant DB as docs-operational-graph.sqlite

    Dev->>Boot: launch bootstrap
    Boot->>Script: run build
    Script->>Docs: scan existing docs
    Script->>Docs: assign deterministic ID (skip if already present)
    Script->>DB: build initial graph
    DB-->>Boot: graph built, completes silently on success
```

## Visualization surface

Both an IDE-side representation and a docs-site graph page exist, sharing one SQLite data source. The docs-site page queries it client-side in the browser. See `03 Visualization Model.md` for the data-access pattern.
