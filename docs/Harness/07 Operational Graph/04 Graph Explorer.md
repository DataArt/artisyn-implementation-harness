---
id: e4fd637e
purpose: Interactive table of every doc the operational graph has indexed, grouped by tier
keywords: [knowledge graph, graph explorer, operational graph, docs-operational-graph.sqlite]
---

# Graph Explorer

Every doc the operational graph (`docs/.og/`) has indexed, grouped by tier. Queries the
built `docs-operational-graph.sqlite` live, client-side, via `sql.js`; falls back to the
table as of the last site build if the live query can't run (the asset failed to fetch,
or the WASM runtime failed to initialize) — never a blank page.
