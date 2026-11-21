---
id: e4fd637e
type: Product Concept
title: Graph Explorer
description: Interactive table of every doc the operational graph has indexed, grouped by tier
tags: [knowledge graph, graph explorer, operational graph, docs-operational-graph.sqlite]
generated: { by: process:okf-migration, at: 2026-11-02T21:23:06Z }
updated: { by: process:okf-migration, at: 2026-11-03T00:11:34Z }
---

# Graph Explorer

Every doc the operational graph (`docs/.og/`) has indexed, grouped by tier. Queries the
built `docs-operational-graph.sqlite` live, client-side, via `sql.js`; falls back to the
table as of the last site build if the live query can't run (the asset failed to fetch,
or the WASM runtime failed to initialize) — never a blank page.
