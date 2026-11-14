# Evolve candidate — launch: accept an amended plan under the same run ID

## Identity

- Candidate: `20261115T000400Z-launch-plan-amend-same-run`
- Requested outcome: the launch guide and the materialization script agree: amending `plan.json` in place (derived outputs, corrected evidence) and re-running `--check`/`--write` under the same run ID is accepted, while a changed rendering of an already materialized file is still rejected.
- Scope: `.canonical-implementation-harness/scripts/materialize-launch.mjs` (`loadOrInitReceipt`) and `apps/harness-bootstrap-e2e/src/tests/unit/materialize-launch.spec.ts`.
- Non-goals: no change to the verified-run guard (`verification.json` present still refuses); no change to the guide.
- Source reflections:
  - `.harness/reflections/triaged/20261114T232720Z-launch-plan-rerun-not-accepted.md`
- Evidence: `01a-launch-plan.md` lines 110–113 say D.1–D.5 derived outputs "always amend this same `<run_id>/plan.json` in place (re-run `--check`/`--write` against this same path)". `loadOrInitReceipt` throws `Run ID already belongs to a different plan` whenever `plan_sha256` differs, and the unit spec pins that at line 148. The consumer hit the dead end the guide creates.

## Action

**Update** the script: a changed plan under the same run ID is accepted and the previous hash is appended to `plan_sha256_history`; `materializeFiles()`'s existing per-entry checks (source, materialized hash) still reject any entry whose rendering changed. **Update** the spec: the pinned rejection becomes an acceptance with history, plus a new assertion that a changed known value still fails with `conflicts with plan`. Callers: launch Blocks A–D, state grader (reads `plan_sha256` from the final receipt).

Canonical files touched here are edited in place; they must travel to consumers through `/harness-bootstrap patch prepare` (direct canonical edits) after adoption. Adoption order within this run: image filenames → entrypoint guards → og-ignore → plan amend → commit/branch format → Jira states; the two CLI candidates share `cli.mjs` and were verified to compose in that order (`candidate.patch` each).

## Acceptance criteria

1. Re-running with an amended plan (same run ID, same outputs) succeeds in `--check` and `--write`; the receipt records the prior plan hash in `plan_sha256_history`.
2. A plan whose rendering of an already materialized file differs still fails with `Existing receipt entry conflicts with plan`.
3. A verified run still refuses changes.
4. Unit suite green.

## Proposed file mapping

| Source (candidate)                                                               | Destination                                                            | Baseline hash                                                      | Candidate hash                                                     | Operation |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.canonical-implementation-harness/scripts/materialize-launch.mjs`     | `.canonical-implementation-harness/scripts/materialize-launch.mjs`     | `a7c3853f71214d3aea7a617af11fe656b48c1ff4bea23914d2ca7023f312e797` | `1e421daa48ca3edf7333c1dc80b6d6f5b89f4bdcf1fc74f3d0cc6704f63e1bbd` | update    |
| `candidate/apps/harness-bootstrap-e2e/src/tests/unit/materialize-launch.spec.ts` | `apps/harness-bootstrap-e2e/src/tests/unit/materialize-launch.spec.ts` | `7d2da3fd7b034178c4c7e7a35113e32475f4cbd74a9214be0589c1bae04aad70` | `ed4099b011b50b9c8a2258144ba9ba68e6a86a68957a7570de534ee0facb31a6` | update    |

`candidate.patch` is the authoritative diff. Rollback: `git checkout --` each destination.

## Change summary

Revised once during Validate: the spec's changed-rendering assertion now matches the preflight message (`Unexpected local content`), which is where the script catches it, and asserts the output file is untouched.

- `loadOrInitReceipt`: run-ID check instead of plan-hash equality; history bookkeeping; comment pointing at the guide.
- spec: three assertions replace one.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above (external consumer feedback, relayed 2026-11-15)                                                                                                                                                                                                                                                                                                                                                                                                             |
| Triage   | completed | This report; Triage · 2026-11-15 · tracker: Claude native tasks, run ID `EVOLVE-20261115`                                                                                                                                                                                                                                                                                                                                                                                             |
| Validate | completed | `Validation.md`, 2026-11-15: **Pass with a required follow-up                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Adopt    | completed | 2026-11-15: Patch applied; `node --check` ok. The vitest unit target was NOT run here (native binding missing in this environment); the developer must run `yarn nx run harness-bootstrap-e2e:unit` before relying on the spec change. Adopted on the developer's acceptance with that follow-up stated. Installed hashes: `materialize-launch.mjs` `1e421daa48ca3edf`, `materialize-launch.spec.ts` `ed4099b011b50b9c`. Uncommitted; canonical files need `patch prepare` to travel. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch prepare` for the canonical files.

## Unresolved decisions

1. The decision could also go the other way (keep the strict script, change the guide to require a new linked run ID per amendment). Draft follows the guide because state verification reconciles against one run's receipt, as the guide itself argues.
2. Whether the state grader should display `plan_sha256_history`; not needed for correctness.

## Candidate acceptance record

Accepted by the developer on 2026-11-15, their words: "adopt all six".
