---
name: harness-bootstrap
description: Deprecated name of the Artisyn Implementation Harness. Prints the migration steps and stops.
metadata:
  version: '4.0.0'
  deprecated: 'true'
  removed-in: '5.0.0'
---

# harness-bootstrap (deprecated)

This skill was renamed to `implementation-harness` (package `@dataart/artisyn-implementation-harness`).
Do not run launch or patch from here. Do not read or write any file.

Tell the developer these steps, then stop:

1. Install the new package. Any channel works. For the plugin marketplace:
   `claude plugin marketplace add DataArt/artisyn-implementation-harness`, then
   `claude plugin install artisyn@dataart`. The other channels (skills.sh, the npm install CLI,
   the release ZIP) are in the harness distribution guide.
2. Move the old state: run `npx @dataart/artisyn-implementation-harness migrate`, or run
   `/implementation-harness launch` (plugin: `/artisyn:implementation-harness launch`), which
   migrates old state first. The old state folder is kept until the developer deletes it.
3. From then on use `/implementation-harness launch` and `/implementation-harness patch apply`
   (plugin: `/artisyn:implementation-harness …`; Codex: `$implementation-harness …`).

This skill is removed in 5.0.0.
