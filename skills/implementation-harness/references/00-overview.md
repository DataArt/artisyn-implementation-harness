# Package overview

[README](../README.md) explains the process with diagrams. [SKILL](../SKILL.md) routes
commands. The launch contract is a router plus stage-scoped references, loaded
as each stage starts.

| Reference                                                | Responsibility                                                                      |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Launch](launch/01-launch.md)                            | Stage sequence, task tracking contract, and routing to the stage references         |
| [Launch plan](launch/01a-launch-plan.md)                 | Provider selection, storage, recovery, context inspection, permanent Q&A, JSON plan |
| [Launch install](launch/01b-launch-install.md)           | Blocks A–C and D.1: skills, agents, root context/MCP, Engineering Guide             |
| [Launch docs](launch/01c-launch-docs.md)                 | D.2–D.5 and E: layer/component agent contract, review, Mermaid gate                 |
| [Launch graph/verify](launch/01d-launch-graph-verify.md) | Operational graph materialization, cleanup, final audit, and close                  |
| [Provider launch](launch/08-provider-launch.md)          | Manifest-driven selection, plan generation, adaptation, and finalization            |
| [Reindex graph](reindex-graph.md)                        | Standalone operational-graph rebuild, outside the launch sequence                   |
| [Launch questions](launch/02-launch-questions.md)        | Editable question checklist loaded and resolved by launch task 3                    |
| [Patch router](patch/03-patch.md)                        | Choose harvest, prepare, or apply                                                   |
| [Harvest](patch/04-patch-harvest.md)                     | Promote permanent improvements into canonical sources                               |
| [Prepare](patch/07-patch-prepare.md)                     | Package direct canonical edits into a portable bundle                               |
| [Apply](patch/05-patch-apply.md)                         | Personalize canonical updates into permanent outputs                                |
| [Patch state](patch/06-patch-state.md)                   | Diff manifests, baselines, conflicts, and durable history                           |

The toolkit's deployable payload lives entirely under `canonical/` — its `skills/`
and `agents/` subfolders hold canonical templates and INTENT rules, its `docs/`
subfolder holds Engineering Guide intent contracts, its `adaptors/` subfolder holds
per-provider runtime procedures, and `manifest.json`, `settings.json` and `mcp.json`
are the adapter inputs. `canonical/` is the only folder
`patch harvest`/`prepare`/`apply` treat as portable content (with a narrow,
documented set of package-internal exceptions — see
[Patch state](patch/06-patch-state.md)). Everything
else at the package root — `references/`, `scripts/`, `patch/`, `patterns/`,
`reports/` — is the bootstrap's own process and tooling, not payload.

The package is disposable after a verified launch: a consumer project ignores it
rather than tracking it, and launch does not untrack files that are already in the
project's history. The harness's own canonical repository is the exception — there
the toolkit is the tracked source of truth. Installed project outputs are permanent
project artifacts and remain separate from the toolkit either way.

All bootstrap bookkeeping lives in `.harness/state/` in the project: launch answers,
plans, receipts, dated reports, deployment mappings, synchronization baselines and local
patch bundles. The package never holds state, so it can be replaced when the toolkit is
refreshed. The state root is resolved from the project root, never from the package path.
Records from older installs are copied over by `migrate`, which keeps the old copy.

Updates carry unified diffs; additions carry full canonical files. Applying updates
requires the expected canonical base or an explicit reconciliation. Never transfer
project answers, secrets, or personalized baselines as canonical payloads.

## Versioning

The package follows semver. `package.json` in the package folder is the one version source.
A release stamps it into `SKILL.md` (`metadata.version`), the plugin manifest and both
marketplace files, and a CI gate fails on any mismatch, so do not edit those versions by
hand. `CHANGELOG.md` is generated from conventional commits with scope `harness`, below its
curated-history line. A breaking change, such as a rename or a state move, raises the major
version. Commits that touch the package use scope `harness` so the repository's own release
ignores them.
