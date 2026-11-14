---
status: triaged
triaged: 2026-11-15T00:10:00Z
candidate: .harness/evolve/20261115T000400Z-launch-plan-amend-same-run/
timestamp: 2026-11-14T23:27:16Z
source: external-consumer-feedback (Windows users of the bootstrapped harness, relayed by the developer 2026-11-15)
---

## Observation

Reported by consumers: the install guide says to change the plan and run the materialization script again, but the script does not accept a changed plan. Not reproduced here; `scripts/materialize-launch.mjs` throws "review and update the plan" on unexpected local content and "Run ID already belongs to a different plan; use a new run ID" on a plan change, which suggests the guide and the script disagree about the recovery path.

## Impact

A consumer who follows the guide hits a dead end during launch and has to guess (new run ID? edit receipts?).

## Suggested direction (not committed)

Reconcile `references/launch/01a-launch-plan.md` and `01b-launch-install.md` with the script's actual contract: either support amending a plan under the same run ID, or make the guide say to start a new run ID and how receipts carry over. Cover it with an integration test.
