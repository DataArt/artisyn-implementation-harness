# Evolve candidate — Windows-safe image filenames

## Identity

- Candidate: `20261115T000100Z-windows-safe-image-filenames`
- Requested outcome: this repository checks out on Windows: no tracked filename contains a character Windows forbids.
- Scope: two image renames under `docs/public/images/context/` (git mv at adopt) and the two Markdown references to them.
- Non-goals: no repo-wide filename policy check yet (see decisions); no other renames.
- Source reflections:
  - `.harness/reflections/triaged/20261114T232716Z-windows-checkout-fails-colon-filenames.md`
- Evidence: `git ls-files | grep ':'` lists exactly the two files; both are referenced once each, URL-encoded (`%3A`), from `docs/Harness/00 The Story/01 …` line 47 and `03 Challenges.md` line 343.

## Action

**Update** the two docs and **rename** the two assets: `AI Factory: From Intent to Confuse.png` → `AI Factory - From Intent to Confuse.png`; `Context Foundation: Stable Tools vs. Broken Migration.png` → `Context Foundation - Stable Tools vs. Broken Migration.png`. Callers: the two docs pages; the VitePress site serves `docs/public/` as-is.

Canonical files touched here are edited in place; they must travel to consumers through `/harness-bootstrap patch prepare` (direct canonical edits) after adoption. Adoption order within this run: image filenames → entrypoint guards → og-ignore → plan amend → commit/branch format → Jira states; the two CLI candidates share `cli.mjs` and were verified to compose in that order (`candidate.patch` each).

## Acceptance criteria

1. `git ls-files` contains no path with `: * ? " < > |`.
2. Both docs still render the images (links resolve to the renamed files).
3. No other reference to the old names remains in the repo.

## Proposed file mapping

| Source (candidate)                                                                         | Destination                                                                             | Baseline hash                                                      | Candidate hash                                                     | Operation |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/docs/Harness/00 The Story/01 From Broken Handoffs to Governed AI.md`            | `docs/Harness/00 The Story/01 From Broken Handoffs to Governed AI.md`                   | `0be1b4b8f5d749d074d2c3de3a1d5657579fce1553c6b01b1439e69376271287` | `fb0a61ba982eb26bc0b06f2fc1889912f719012032dc058fc6accbfd48790bc8` | update    |
| `candidate/docs/Harness/00 The Story/03 Challenges.md`                                     | `docs/Harness/00 The Story/03 Challenges.md`                                            | `17d77c6c20257e91cea1aa57acc6afda7a245cbb1356642156d06cf2234b8940` | `0316cc4f3055c964acffc5e6e437943ddae95689e9d0a61ecf0345f08ca0c007` | update    |
| (rename at adopt)                                                                          | `docs/public/images/context/AI Factory - From Intent to Confuse.png`                    | —                                                                  | —                                                                  | rename    |
| (rename at adopt)                                                                          | `docs/public/images/context/Context Foundation - Stable Tools vs. Broken Migration.png` | —                                                                  | —                                                                  | rename    |
| `candidate.patch` is the authoritative diff. Rollback: `git checkout --` each destination. |

## Change summary

- Two `![…](/images/context/…)` links updated from `%3A` to `%20-%20`.
- Renames performed at adopt with `git mv` so history follows.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Source reflections above (external consumer feedback, relayed 2026-11-15)                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Triage   | completed | This report; Triage · 2026-11-15 · tracker: Claude native tasks, run ID `EVOLVE-20261115`                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Validate | completed | `Validation.md`, 2026-11-15: **Pass** for the content change; the two renames and the build check are adoption-time verifications                                                                                                                                                                                                                                                                                                                                                                                 |
| Adopt    | completed | 2026-11-15: Docs installed by exact file copy (`patch` cannot parse the spaces in these paths; baselines matched). Renames done with `git mv`; `git ls-files` has no path with a Windows-invalid character (the one remaining grep hit is a git-quoted non-ASCII PDF name, not a violation). Old URL-encoded references: 0. Installed hashes: `01 From Broken Handoffs to Governed AI.md` `fb0a61ba982eb26b`, `03 Challenges.md` `0316cc4f3055c964`. Uncommitted; canonical files need `patch prepare` to travel. |

Draft readiness: inspectable content, patch and criteria present. Current stage: closed. Next action: none; lifecycle complete. Follow-up outside it: `/harness-bootstrap patch prepare` for the canonical files.

## Unresolved decisions

1. Add a guard so this cannot recur: a pre-commit or CI check rejecting Windows-invalid characters in added paths. Out of this candidate; worth a follow-up reflection if accepted.

## Candidate acceptance record

Accepted by the developer on 2026-11-15, their words: "adopt all six".
