# Patch Registry

Bundles created in this repo by capture, apply, or launch. Applications of incoming
bundles belong in APPLIED.md. UUID identifies a bundle; histories are project-local.
Update payloads are diffs; added files are full content. See `../references/06-patch-state.md`.

On 2026-09-28 the 19 fine-grained bundles from 2026-09-12 through 2026-09-16 were
compacted into the 3 checkpoint bundles below. Compaction was needed because several
of the original bundles' stored diff payloads had already drifted from canonical
content (verified: 6 payload hash mismatches in the very first bundle alone), so a
byte-exact replay would only have propagated known-bad data. Each checkpoint bundle
instead re-derives its `add` entries directly from current, disk-verified canonical
content — every hash in the table below is real and reproducible from the file it
names, with no fabricated "before" state. Each bundle's `supersedes` field in its
`manifest.json` lists the original bundle UUIDs it replaces; the original bundles'
summaries are preserved there for provenance. See `06-patch-state.md`'s "Compacting
bundle history" section for the ground rules this followed.

| Bundle UUID                          | Folder                                                                                                 | Date       | Operation | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 196ea41c-54d8-5d74-ac2e-7aa5758eb1eb | `20260928T000000Z-era-a-initial-lifecycle-skills-checkpoint-196ea41c-54d8-5d74-ac2e-7aa5758eb1eb`      | 2026-09-28 | harvest   | Checkpoint (73 files): initial lifecycle build — dev collapsed into one 6-stage skill, full design lifecycle flow, war and evolve each collapsed into one skill, legacy per-stage helpers retired, portable patch-history contract, independent dev/design metrics CLIs. Supersedes 8 bundles: 1eec015b, e0691d4e, e9c4f190, a852e4b5, 7c1d8d0a, 1853ae79, 4b39f5ba, a7e5f673.                                                                    |
| 937ea8c9-ac06-5824-95ae-e2c13b64c0e7 | `20260928T000001Z-era-b-design-e2e-and-dev-livefix-checkpoint-937ea8c9-ac06-5824-95ae-e2c13b64c0e7`    | 2026-09-28 | harvest   | Checkpoint (56 files): design's Architecture.md as authoritative E2E record and single wrap-up Publish stop; dev lifecycle 7.4.0-7.23.0 live-fix iterations (stage metrics, consolidated Review Findings ledger, restored human gates, sign-off naming, plan/commit gate consistency, unconditional stage-task creation, anti-fabrication hardening). Supersedes 7 bundles: 9bed3e97, 8a673ab1, 9530dbaa, 1c2e170f, 05255e09, 4a442365, 3424be0c. |
| bb33b9d1-6a93-553b-9a53-ff708eb66a08 | `20260928T000002Z-era-c-approval-split-and-genericity-checkpoint-bb33b9d1-6a93-553b-9a53-ff708eb66a08` | 2026-09-28 | harvest   | Checkpoint (36 files): dev and design's approval-sign-off / intelligent-approval split, app README HLD/LLD seeding plus NX-genericity placeholders, separation-of-concerns pass on the approval patterns. Supersedes 4 bundles: 09e72961, 47f2bd3b, 8bc7fb00, 1f148d52.                                                                                                                                                                           |
