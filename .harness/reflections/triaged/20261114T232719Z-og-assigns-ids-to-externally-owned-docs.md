---
status: triaged
triaged: 2026-11-15T00:10:00Z
candidate: .harness/evolve/20261115T000300Z-og-ignore-file/
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by consumers: the operational graph adds an `id:` frontmatter line to every Markdown file under `docs/`. One of those files was owned by another tool in the consumer's pipeline, and that tool's own check would fail on the modified file.

Verified here: `docs/.og/docs.mjs` `assign()` is the single write path and `reindex()` calls it for every file `listMarkdownFiles(docs)` returns; there is no exclusion list beyond `docs/.og` itself.

## Impact

The graph silently edits files it does not own. In a repo where `docs/` also holds files governed by other tooling, this breaks that tooling or forces the consumer to hand-revert.

## Suggested direction (not committed)

An ignore mechanism for the graph (a `.ogignore` or a list in a config file, honoured by `listMarkdownFiles`), and a launch question or detection step that asks which paths under `docs/` are externally owned before the first `build`.
