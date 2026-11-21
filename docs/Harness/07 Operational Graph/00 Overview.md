---
id: 9a5ad494
type: Product Concept
title: Operational Graph
description: Navigation index introducing the deterministic operational graph over the repo's doc tiers
tags: [operational graph, navigation index, deterministic graph]
generated: { by: process:okf-migration, at: 2026-11-02T14:35:32Z }
updated: { by: process:okf-migration, at: 2026-11-18T13:12:59Z }
---

# Operational Graph

The harness maintains a deterministic operational graph over the repo's doc tiers (HLD, LLD, Engineering Guide, Stories, Product), built from a unique frontmatter ID per doc and an edges table derived from the five named graduation actions already defined in `docs/Harness/03 Lifecycles/05 Documents Flow.md`, plus scan-authored and automatic keyword-overlap edges. One script (with satellite modules), one SQLite file, no new always-on infrastructure.

| Page                                                            | Contents                                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [01 Ops Model](<./01 Ops Model.md>)                             | Node/edge model, system context, and lifecycle wiring                            |
| [02 Storage and Build Model](<./02 Storage and Build Model.md>) | SQLite schema, frontmatter format, and the one-module build mechanism            |
| [03 Visualization Model](<./03 Visualization Model.md>)         | IDE-side and docs-site graph surfaces, shared data source, data-access pattern   |
| [04 Graph Explorer](<./04 Graph Explorer.md>)                   | Live, interactive table of every indexed doc, grouped by tier                    |
| [05 Knowledge Base Format](<./05 Knowledge Base Format.md>)     | OKF bundles, frontmatter contract, type map, `index.md` rules, conformance check |
