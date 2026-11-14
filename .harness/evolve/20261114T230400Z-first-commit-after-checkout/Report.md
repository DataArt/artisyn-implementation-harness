# Evolve candidate — first commit after branch checkout in dev and design

## Identity

- Candidate: `20261114T230400Z-first-commit-after-checkout`
- Requested outcome: the lifecycle's first commit lands on the feature branch: Context Gathering no longer commits, Ceremony's commit after the checkout covers the story folder plus its own rows.
- Scope: dev: `SKILL.md` approvals bullet, `references/01-context-gathering.md` (header, Step 7), `references/02-ceremony.md` (Step 4). design: `SKILL.md` (approvals bullet, Phase 1 text), `references/01-context-gathering.md` (header, Step 7), `references/02-ceremony.md` (Step 4).
- Non-goals: stage order is unchanged (the reflection's alternative of swapping Ceremony before Context is not taken: Context must exist to name the branch); Engineering Guide lifecycle articles untouched (their "sign-off → report → commit" summary stays true for every stage but Context; carry a one-line note via `@docs-writer` later if wanted).
- Source reflections:
  - `.harness/reflections/triaged/20261108T223258Z-context-commit-lands-before-branch-checkout.md`
- Evidence: DESIGN-20261108-1L8P: the Context Gathering commit was proposed while still on `main`; the user said "retire this commit and do a first commit after checkout... same for the dev flow". Verified now: both Context references end with a Step 7 commit-and-wait before Ceremony Step 2 checks out the branch; both Ceremony Step 4s already contain the fold-in mechanism ("If Context's commit is still pending, propose it again with these rows included"), so the change makes that path the only path. `timing.mjs` has no commit precondition for `stage complete`.

## Action

**Update** six owners. Context: one stop (sign-off) and a Close step that runs `stage complete` without a commit; direct entry says the folder stays uncommitted until Ceremony. Ceremony Step 4: always the lifecycle's first commit, covering the story folder, with the resumed-ticket exception. Routers: the "two stops per phase" bullet names Context as the exception; design Phase 1 text drops "Report → Commit". Callers: `/dev`, `/dev context`, `/dev ceremony`, `/design`, `/design context-gathering`, `/design ceremony`.

Canonical propagation: the matching `canonical/` templates are parametrised copies that differ from the installed files; carry this change with `/harness-bootstrap patch harvest` after adoption, not here.

Adoption order across this run's candidates (they share files; each ships a `candidate.patch` against the 2026-11-14 baseline that was verified to apply cleanly in sequence): plan-mode → task-mirroring → browser-fallback → og-dir-validation → first-commit. Adopt by applying the patch, not by copying whole files, once an earlier candidate has landed.

## Acceptance criteria

1. A full-chain run proposes no commit before the branch checkout; the first proposed commit is Ceremony's and includes the story folder.
2. `/dev context` or `/design context-gathering` alone ends after `stage complete` with an explicit statement that the folder is uncommitted on purpose.
3. A resumed ticket whose story folder is already committed gets only the "record branch and tracker state" commit.
4. Context's sign-off, report and metrics calls are unchanged; `stage complete --stage context` still runs.
5. Phase banners and `--stage` ids are unchanged.

## Proposed file mapping

| Source (candidate)                                                   | Destination                                                | Baseline hash                                                      | Candidate hash                                                     | Operation |
| -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.claude/skills/design/SKILL.md`                           | `.claude/skills/design/SKILL.md`                           | `46ebbe2792894611861f83f7d0356cafb14442bbd0345d83a2269b1d73060f9e` | `d109cc6a392cd9aa611b03d4aa2f2d7f86d7cb37e2a4b0bfb027d65d51505798` | update    |
| `candidate/.claude/skills/design/references/01-context-gathering.md` | `.claude/skills/design/references/01-context-gathering.md` | `b1a8ae6d521be9a34b2a40f3c438a80afc6cafdbe8fc1c23cbf950e64eae9bd7` | `6a6a1b8b22e303e9863517aa59e786f6f2a226938fe69db79e64c97d4422bc1f` | update    |
| `candidate/.claude/skills/design/references/02-ceremony.md`          | `.claude/skills/design/references/02-ceremony.md`          | `a2843a72d6f6b6c7a2c051cc7e4f8d64767497ef1de36a2e368563e524295904` | `e386c041fbc1da02c31ae737df098ca31cd98b999d501657f513cf302d1817c9` | update    |
| `candidate/.claude/skills/dev/SKILL.md`                              | `.claude/skills/dev/SKILL.md`                              | `aaeb40fba1c633563ff648dc6f7214417acbf12d1a894f9c0311fd6f9f4183a5` | `c38a873aaa99855b4ab6404edabc4ecbf29044968dc2a9604c89700db63e9466` | update    |
| `candidate/.claude/skills/dev/references/01-context-gathering.md`    | `.claude/skills/dev/references/01-context-gathering.md`    | `15dc97cde540ac68c12c12d8e9e751b413128ff164e2e6fd732d97896bf0d57e` | `dd3f8a9d838209cd64d02b1f2a0045c75be46a8ae0ab4a907054bcd80ba7a9d6` | update    |
| `candidate/.claude/skills/dev/references/02-ceremony.md`             | `.claude/skills/dev/references/02-ceremony.md`             | `3da7f3ee083b7617fb0b731135ae2a6605fbc04ce4491e8dd14e67c639a1b1aa` | `4b9480667267d2c380d29d75528c420361b308f9a0349307409291e5da1d25e5` | update    |

`candidate.patch` is the authoritative diff. No removals unless listed in the change summary. Rollback: `git checkout --` each destination.

## Change summary

- dev/design `01-context-gathering.md`: "Two stops" → "One stop" with the reason; Step 7 "Commit" → "Close".
- dev/design `02-ceremony.md` Step 4: first-commit wording with the folder scope and the resumed exception.
- dev `SKILL.md` approvals bullet: Context exception sentence. design `SKILL.md`: same, plus Phase 1 "Report → Commit" → "Report; no commit until Ceremony's checkout" and "Once commit is confirmed, emit" → "Then emit".

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Triage   | completed | This report; Triage · 2026-11-14 · tracker: Claude native tasks, run ID `EVOLVE-20261114-2`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Validate | completed | `Validation.md`, 2026-11-14: **Pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Adopt    | completed | 2026-11-14: `candidate.patch` applied in the recorded order; every installed file is byte-identical to the composed scratch result that Validate exercised (0 diffs). Installed hashes: `.claude/skills/design/SKILL.md` `d109cc6a392cd9aa`, `.claude/skills/design/references/01-context-gathering.md` `6a6a1b8b22e303e9`, `.claude/skills/design/references/02-ceremony.md` `e386c041fbc1da02`, `.claude/skills/dev/SKILL.md` `cb7a4d58aa333b12`, `.claude/skills/dev/references/01-context-gathering.md` `a811497fbdfb0d77`, `.claude/skills/dev/references/02-ceremony.md` `4f243ebd80f177c6`. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch harvest` for the canonical templates.

## Unresolved decisions

1. Direct `/dev context` entry now leaves untracked files on the starting branch until Ceremony runs. Accepted as the user's intent; the Close step says so explicitly.
2. Engineering Guide articles summarise every phase as sign-off → report → commit; decide at validate whether a one-line exception is worth a docs edit.

## Candidate acceptance record

Accepted by the developer on 2026-11-14, their words: "adopt all five and commit".
