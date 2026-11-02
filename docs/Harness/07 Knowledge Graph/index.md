---
id: 9a5ad494
purpose: Navigation index introducing the deterministic knowledge graph over the repo's doc tiers
keywords: [knowledge graph, navigation index, deterministic graph]
---

# Knowledge Graph

The harness maintains a deterministic knowledge graph over the repo's doc tiers (HLD, LLD, Engineering Guide, Stories, Product), built from a unique frontmatter ID per doc and a relation table derived from the six named graduation actions already defined in `docs/Harness/03 Lifecycles/05 Documents Flow.md`. One script, one SQLite file, no new always-on infrastructure.

| Page                                                            | Contents                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [01 Ops Model](<./01 Ops Model.md>)                             | Node/edge model, system context, and lifecycle wiring                          |
| [02 Storage and Build Model](<./02 Storage and Build Model.md>) | SQLite schema, frontmatter format, and the one-module build mechanism          |
| [03 Visualization Model](<./03 Visualization Model.md>)         | IDE-side and docs-site graph surfaces, shared data source, data-access pattern |
| [04 Graph Explorer](<./04 Graph Explorer.md>)                   | Live, interactive table of every indexed doc, grouped by tier                  |
