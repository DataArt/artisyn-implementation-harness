# Reindex graph

Rebuild the operational graph (`project:docs/.og/`) on demand — the same work
`/harness-bootstrap launch`'s "Materialize operational graph" stage does
([01d Launch graph/verify](launch/01d-launch-graph-verify.md)), run standalone so a
developer can refresh the graph after editing docs by hand, after a `/dev document`
or `/design publish` run, or on any schedule — without re-running the full launch
sequence.

## Precondition

`project:docs/.og/cli.mjs` must already exist — this operation refreshes an
already-materialized graph, it does not install one. If it's missing, tell the
developer to run `/harness-bootstrap launch` first (its Materialize stage installs
the tool); do not copy canonical files here.

## Procedure

Run `node docs/.og/cli.mjs build --dir <project root>` directly, no copy step.
Report the real result — parse its JSON output (`{ skipped, pruned }`):

- Docs indexed/pruned and edges computed are implicit in the files `build()`
  touches; report counts from the command's own output, never assumed
- `skipped` — malformed HLD container names, if any, with the reason given
- `pruned` — doc IDs removed because their file no longer exists, if any

A non-zero exit means `build()` failed; show the diagnostic it printed and stop —
never retry silently, never partially apply.

## Completion evidence

`docs/.og/docs-operational-graph.sqlite` and `docs/.og/graph.mmd` have a newer
mtime than before the run, and the reported `skipped`/`pruned` counts (zero or
not) are shown to the developer, not swallowed — this is a standalone,
developer-invoked operation, not a silent background step like launch's own
Materialize stage.
