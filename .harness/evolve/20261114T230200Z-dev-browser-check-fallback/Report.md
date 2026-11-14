# Evolve candidate — dev Implement and Test: browser-check fallback

## Identity

- Candidate: `20261114T230200Z-dev-browser-check-fallback`
- Requested outcome: when a plan step or an acceptance criterion needs a live browser and the Chrome tools report not connected, the assistant runs the installed browser procedure's setup walkthrough once and says what is missing, instead of silently handing the check to the developer.
- Scope: `.claude/skills/dev/references/04-implement.md` (step checkpoint failure branch) and `05-test.md` (AC checkpoint condition).
- Non-goals: no new agent (the reflection's "web agent needed" was read as the browser tool being unavailable, unconfirmed); no change to `runtime/browser.md` itself, which already has the full "When the tools are not exposed" section; no change to `/x-ray`, which already applies it.
- Source reflections:
  - `.harness/reflections/triaged/20261108T211207Z-chrome-extension-unavailable-mid-verification.md`
- Evidence: DEV-20261108-K7XQ Implement Step 3: `tabs_context_mcp` returned "Browser extension is not connected" twice; the check was improvised onto the developer, who then found two real bugs. Verified now: `.claude/skills/dev/runtime/browser.md` exists and documents install, connect, reconnect and permission steps, but no dev stage reference points at it (grep over `references/` finds no `browser` mention), while `x-ray/SKILL.md` Step 4b does.

## Action

**Update** two owners with one pointer each. Callers: `/dev implement`, `/dev test`.

Canonical propagation: the matching `canonical/` templates are parametrised copies that differ from the installed files; carry this change with `/harness-bootstrap patch harvest` after adoption, not here.

Adoption order across this run's candidates (they share files; each ships a `candidate.patch` against the 2026-11-14 baseline that was verified to apply cleanly in sequence): plan-mode → task-mirroring → browser-fallback → og-dir-validation → first-commit. Adopt by applying the patch, not by copying whole files, once an earlier candidate has landed.

## Acceptance criteria

1. A live-browser verification item in Implement applies `runtime/browser.md`; not-connected tools trigger its walkthrough once before the item goes to the developer.
2. The same for a browser-dependent AC in Test.
3. The developer-verified result is recorded with their words as evidence, as today.
4. Non-browser steps and ACs are unaffected.

## Proposed file mapping

| Source (candidate)                                        | Destination                                     | Baseline hash                                                      | Candidate hash                                                     | Operation |
| --------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.claude/skills/dev/references/04-implement.md` | `.claude/skills/dev/references/04-implement.md` | `f0989c5da7087c857127b953d7a3f81c507c10117e3120703c6fc767163e243e` | `537eab4510a099ca51d7ed53655f437c676436405f9fd579841d2f8141f7a1d6` | update    |
| `candidate/.claude/skills/dev/references/05-test.md`      | `.claude/skills/dev/references/05-test.md`      | `55f39e4936dfbfb0ec99507acec22b468ae0dfb310c12faeca8b4928cdb50a4f` | `ade63ce7f20167603570fee742252c70b195925c605e153bad42c4321f89287c` | update    |

`candidate.patch` is the authoritative diff. No removals unless listed in the change summary. Rollback: `git checkout --` each destination.

## Change summary

- `04-implement.md`: five lines added inside the "Any condition fails" paragraph of the step checkpoint.
- `05-test.md`: two lines added to the first AC auto-approval condition.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                          |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above                                                                                                                                                                                                                                                                                                   |
| Triage   | completed | This report; Triage · 2026-11-14 · tracker: Claude native tasks, run ID `EVOLVE-20261114-2`                                                                                                                                                                                                                                |
| Validate | completed | `Validation.md`, 2026-11-14: **Pass                                                                                                                                                                                                                                                                                        |
| Adopt    | completed | 2026-11-14: `candidate.patch` applied in the recorded order; every installed file is byte-identical to the composed scratch result that Validate exercised (0 diffs). Installed hashes: `.claude/skills/dev/references/04-implement.md` `30c674f0fa75c735`, `.claude/skills/dev/references/05-test.md` `316bb944c55b5f24`. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch harvest` for the canonical templates.

## Unresolved decisions

1. The reflection's "web agent neeeded" could instead mean a browser-driving specialist agent. Draft takes the smaller reading; if the user meant an agent, that is a new reflection.

## Candidate acceptance record

Accepted by the developer on 2026-11-14, their words: "adopt all five and commit".
