# DESIGN-20261102-Q5MU: Deterministic Docs Knowledge Graph — Stack

Scope: technologies added or changed by this design only. No other dependency in
the repo changes.

| Technology                         | Capability provided                                                                     | Owning component                                | Version/constraint                                                                                      | Compatibility                                                                                                                                                                                          | Licensing/cost                                                                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node:sqlite` (`DatabaseSync`)     | Node-side SQLite read/write for the relation store                                      | `DocsGraph` module (build/agent/CLI invocation) | Node built-in since 22.5; this repo's `package.json` already requires Node ≥24 — no version bump needed | Marked experimental upstream — API surface may change in future Node releases; scoped to one internal script, not a public contract                                                                    | Zero cost — no new npm dependency, no license to track                                                                                                  |
| `sql.js` (WASM SQLite build)       | Browser-side, client-side SQL querying of the same `.sqlite` file, no server round-trip | VitePress graph page (`apps/docs-web/`)         | Exact version pin: Efforts.md implementation detail                                                     | Reads the same file format `node:sqlite` writes, with no conversion step (confirmed assumption — verify in the browser-compatibility smoke test named in `solution/Design - Visualization surface.md`) | Open-source (MIT), adds one new frontend dependency to `apps/docs-web/`'s bundle — bundle-size impact to be measured per the sizing spike in Efforts.md |
| Graph-rendering library (name TBD) | Visual node/edge layout, pan/zoom/search for the VitePress graph page                   | VitePress graph page (`apps/docs-web/`)         | Not yet selected — Efforts.md spike                                                                     | N/A until selected                                                                                                                                                                                     | Not yet evaluated — Efforts.md spike must include a license/dependency-provenance check, not just bundle size                                           |

## Compatibility

No existing dependency is replaced, removed, or version-bumped by this design.
`node:sqlite` requires no `package.json` change at all — it's already satisfied
by the existing `engines.node >=24`.

`sql.js` and the graph-rendering library are the only two new entries this design
adds to `apps/docs-web/`'s own dependency list; neither affects `apps/lambda-auth/`
or `apps/infra/`.

No migration or rollback procedure is needed — these are additive dependencies
for new capability, not replacements for existing ones.

## Verification

- A CI check confirms `node:sqlite`'s `DatabaseSync` API surface still supports
  the operations this design relies on (schema creation, insert, uniqueness-
  constraint rejection) after any future Node version bump in this repo.
- A browser-compatibility smoke test confirms `sql.js` loads and queries the
  `.sqlite` file correctly in this repo's supported browser matrix, before the
  graph-rendering library is finalized.
