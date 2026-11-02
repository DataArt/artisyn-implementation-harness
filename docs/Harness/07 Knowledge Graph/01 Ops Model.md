---
id: 04bbbf49
---

# Ops Model

The knowledge graph is additive tooling: one script (`docs-graph.mjs`) plus one SQLite file (`docs/kb/docs-graph.sqlite`), consumed by the existing docs site build. No new container joins the architecture, and the existing browser-to-hosting data flow is unchanged — the graph page ships as part of the same static build output.

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

    SCRIPT["📜 docs-graph.mjs\nbuild · index · query · search"]:::tool
    DB[("🗄️ docs/kb/docs-graph.sqlite\ndocs + relations")]:::store

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

    N4 -->|"publish-product"| N5
    N4 -->|"publish-project"| N1
    N4 -->|"document-arch-deviation"| N1
    N4 -->|"document-component-detail"| N2
    N4 -->|"document-operational-steps"| N3
    N4 -->|"document-env-vars"| N6
    N1 -.->|"mirrors-consistent / mirrors-gap\n(computed, not authored)"| N2

    classDef hld   fill:#1D4ED8,stroke:#1e3a8a,color:#fff
    classDef lld   fill:#0E7490,stroke:#0c4a6e,color:#fff
    classDef eg    fill:#065F46,stroke:#064e3b,color:#fff
    classDef story fill:#D97706,stroke:#B45309,color:#fff
    classDef pctx  fill:#7C3AED,stroke:#5B21B6,color:#fff
    classDef readme fill:#4B5563,stroke:#374151,color:#fff
```

A Story's `design/`, `solution/`, `impl/` subfolders are attributes of its single `Story` node, not separate sub-nodes. Each project bootstrapping the harness instantiates its own `Product` tier under its own name; this repo's instance is `docs/Harness/`.

The six solid edges are the named graduation actions from `03 Lifecycles/05 Documents Flow.md`, each authored as a Story-to-destination-tier edge. The seventh edge, `mirrors-consistent`/`mirrors-gap`, is computed — not authored — by diffing HLD container file names (`Target Architecture (HLD)/<Version>/Containers/<Name>.md`) against LLD folder names (`System Architecture (LLD)/<Name>/`), per the naming convention in `docs/Engineering Guide/Documentation/02 Structure.md`. HLD version supersession is not modeled as a graph edge — the existing folder-per-version/README-router convention already covers it.

## Graph type

Nodes are typed — each is one of the six types above. Edges are typed and directed — each of the seven types above has a defined source-tier → destination-tier meaning. A `derived` flag on each edge distinguishes the six authored edges (written by a lifecycle action) from the one computed edge (`mirrors-consistent`/`mirrors-gap`, derived from file/folder naming, never authored). Cycles are permitted — edges are typed relationship statements, not a dependency or control-flow order, so nothing in this design enforces acyclicity.

## Settled interfaces

| Component                   | Settled interface                                                          |
| --------------------------- | -------------------------------------------------------------------------- |
| `docs-graph.mjs`            | The script. Ships inside `docs/Harness/package/` once that package exists. |
| `docs/kb/docs-graph.sqlite` | The data file. Sole producer and consumer is `docs-graph.mjs`.             |

## Lifecycle wiring

Read is required at Context Gathering/Research (`/dev context`, `/design frame`/`research`), with required fallback to existing grep/glob when the graph is missing, stale, or unavailable.

Write is required but tool-automated, not manually authored, at Document/Publish (`/dev document`, `/design publish`): the same script assigns an ID if missing and writes the corresponding graduation edge as a side effect of completing.

Context Gathering and Research query the graph first, with a required fallback to the existing grep/glob pattern when it isn't available:

```mermaid
sequenceDiagram
    actor Dev as Developer/Agent
    participant Phase as /dev context · /design frame/research
    participant Script as docs-graph.mjs
    participant DB as docs-graph.sqlite
    participant Fallback as grep/glob pattern

    Dev->>Phase: start context gathering
    Phase->>Script: query()/search() by related edges
    alt graph available and current
        Script->>DB: read docs + relations
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
    participant Script as docs-graph.mjs
    participant Tier as Destination tier doc
    participant DB as docs-graph.sqlite

    Dev->>Pub: complete publish
    Pub->>Tier: write published doc
    Pub->>Script: assign ID (if missing) + write graduation edge
    Script->>DB: update docs + relations
    DB-->>Pub: graph updated as side effect of publish completing
```

## Bootstrap wiring

The script ships inside `docs/Harness/package/` once that package exists. `/harness-bootstrap launch` runs it proactively: it assigns deterministic, collision-safe frontmatter IDs to any doc missing one and builds the initial graph in the same pass, silently on success.

`/harness-bootstrap launch` invokes the same script to seed the graph for an existing doc tree:

```mermaid
sequenceDiagram
    actor Dev as Developer/Agent
    participant Boot as /harness-bootstrap launch
    participant Script as docs-graph.mjs
    participant Docs as Existing docs/
    participant DB as docs-graph.sqlite

    Dev->>Boot: launch bootstrap
    Boot->>Script: run build
    Script->>Docs: scan existing docs
    Script->>Docs: assign deterministic ID (skip if already present)
    Script->>DB: build initial graph
    DB-->>Boot: graph built, completes silently on success
```

## Visualization surface

Both an IDE-side representation and a docs-site graph page exist, sharing one SQLite data source. The docs-site page queries it client-side in the browser. See `03 Visualization Model.md` for the data-access pattern.
