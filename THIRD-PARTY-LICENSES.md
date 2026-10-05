# Third-Party License Manifest

Audit of every third-party package license in this workspace, prepared for the
open-source release Compliance reviewed at the 5 Oct 2026 Legal Committee. This is a
point-in-time snapshot, not a continuously-enforced check — re-run it before each
future release, or whenever dependencies change meaningfully.

**Tool:** [`license-checker-rseidelsohn`](https://github.com/RSeidelsohn/license-checker-rseidelsohn)
(community-maintained fork of `license-checker`), run via `yarn dlx` — downloaded and
executed once, not installed as a project dependency.

**Command:**

```bash
yarn dlx license-checker-rseidelsohn --json --excludePrivatePackages
```

`--excludePrivatePackages` drops this workspace's own `apps/*` and `docs` packages
(correctly reported as `UNLICENSED` since they're private, unpublished, and not
third-party).

**Scanned:** 672 third-party packages across the whole Yarn workspace (all apps: `site`,
`lambda-auth`, `infra`, plus root tooling).
**Generated:** 2026-10-06.

## Result: no blocker for an MIT release

Every dependency carries a permissive license compatible with distributing this
project under MIT, with one weak-copyleft exception noted below that is also fine to
redistribute. No strong-copyleft license (GPL, AGPL, SSPL) appears as a required
dependency anywhere in the tree.

## License breakdown

| License                                | Package count |
| -------------------------------------- | ------------- |
| MIT                                    | 505           |
| Apache-2.0                             | 63            |
| ISC                                    | 59            |
| BSD-3-Clause                           | 15            |
| BSD-2-Clause                           | 11            |
| BlueOak-1.0.0                          | 7             |
| OFL-1.1                                | 2             |
| MPL-2.0 OR Apache-2.0 (dual)           | 2             |
| CC-BY-4.0 AND OFL-1.1 AND MIT (bundle) | 1             |
| CC0-1.0                                | 1             |
| Python-2.0                             | 1             |
| MIT OR GPL-3.0-or-later (dual)         | 1             |
| EPL-2.0                                | 1             |
| MIT* (unverified/inferred)             | 1             |
| Unlicense                              | 1             |
| 0BSD                                   | 1             |

## Items worth a human look

- **`elkjs@0.9.3` — EPL-2.0.** Weak (file-level) copyleft, used for Mermaid diagram
  layout in the docs site. Permissive enough to bundle/redistribute under MIT without
  relicensing our own code; EPL only requires preserving its own notice, which this
  manifest does. Flagging because it's the only non-permissive license in the tree.
- **`case@1.6.3` — MIT OR GPL-3.0-or-later (dual-licensed).** We rely on the MIT option;
  no action needed.
- _*`khroma@2.1.0` — MIT* (asterisk)._* `license-checker` marks a license "unofficial"
  when it's inferred from a license file rather than the package's own `license`
  field — `khroma`'s `package.json` has no `license` field at all. Opened its `license`
  file directly: it is the standard MIT text. The asterisk is a metadata gap in the
  package itself, not a licensing concern.
- **`@fortawesome/fontawesome-free@7.3.1` — CC-BY-4.0 AND OFL-1.1 AND MIT (bundle).**
  Transitive dependency of `@mermaid-js/mermaid-cli` (used to render/validate diagrams
  in `scripts/check-mermaid.mjs`), not something this project references directly.
  Icon font package with per-asset licensing (fonts vs. code vs. some icon sets
  require attribution) — relevant only if its font assets ship in a published
  artifact; mermaid-cli is a build-time tool, so they don't.

## Not a one-time artifact

Compliance's ask was for a license manifest before approving open-source release, not
an ongoing gate — this file is that one-time snapshot. If a future review wants this
enforced automatically (e.g., failing CI on a new copyleft dependency), that would be a
separate, explicit decision, not something this audit implies.
