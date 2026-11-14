# Evolve candidate — automatic doc alignment for code written outside a ticket

## Identity

- Candidate: `20261114T220500Z-doc-catch-up-outside-ticket`
- Requested outcome: when code lands in plain chat with no `/dev` story, the
  assistant spawns `@docs-writer` on its own once a logical change is done, so the
  permanent docs and the operational graph move in the same diff as the code. No
  question to the developer; they review docs and code together in Git.
- Scope: `CLAUDE.md` only, one new section under `## How`.
- Non-goals: no change to `/dev` or its Document stage; no change to the Dev
  Lifecycle article (user decision 2026-11-14: keep this out of the dev lifecycle);
  no change to `@docs-writer`; canonical propagation is the sibling candidate
  `20261114T223000Z-root-instructions-interface`.
- Source reflections:
  - `.harness/reflections/triaged/20261109T221049Z-vibecoding-bypasses-dev-governance.md`
  - `.harness/reflections/triaged/20261114T215914Z-auto-dev-document-after-vibecoding.md`
- Evidence: 2026-11-09 session, after `/dev complete DEV-20261109-J5LS`, a new
  `TerminalScenarios` component, `data/scenarios.ts`, a `SectionLink` extraction and
  several fixes were built in chat; the Web Explorer LLD overview was never updated
  and the graph was never re-indexed. Raised again on 2026-11-14 with three remedy
  options. Verified: `CLAUDE.md` and `.claude/agents/*.md` contain no rule for this
  case.

## Triage decisions on the user's three options

| Option                                                      | Decision                                                                         | Reason                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Detect the session and run `/dev document` automatically | **Detection and automatic doc update adopted; `/dev document` itself deferred.** | `/dev document` Step 1 refuses unless the story passed Test; its audit and graph edges read `1-plan.md` and `2-report.md`, which chat work never has. Reconsider if the `@docs-writer` path misses things the Document stage would catch in two or more real uses. |
| 2. Pull terminology and docs principles from the dev flow   | **Covered, no change.**                                                          | `@docs-writer` reads Principles, Structure and Terminology before every write.                                                                                                                                                                                     |
| 3. Invoke `@docs-writer` to align docs with what was coded  | **Adopted** as the whole mechanism, automatic.                                   | Existing owner; smallest change.                                                                                                                                                                                                                                   |

User decisions recorded 2026-11-14 after the first draft: no ask before writing
(developer sees doc changes in the same git diff); keep the rule out of the Dev
Lifecycle article; give the canonical package an interface document for root
instructions (sibling candidate).

## Action

**Update** one existing owner: `CLAUDE.md` → new `### Work outside a ticket` under
`## How`, before `### Agents`. Affected callers: every session in this repo. No skill
or agent references the section.

## Acceptance criteria

1. After a logical chat-driven code change with no active `/dev` story, the
   assistant spawns `@docs-writer` with the changed files and the session's
   reasoning, without asking first.
2. Each doc `@docs-writer` writes is indexed with `node docs/.og/cli.mjs index
--dir . --doc <path>`; a failure is one reported line and does not block.
3. Typo, formatting and comment-only edits do not trigger it.
4. Work inside an active `/dev` story is unaffected.
5. `/dev document` is never invoked for story-less work; the text says so.
6. `CLAUDE.md` stays within the 60–130 prose-line budget.

## Proposed file mapping

| Source (candidate)    | Destination | Baseline hash                                                      | Candidate hash                                                     | Operation |
| --------------------- | ----------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/CLAUDE.md` | `CLAUDE.md` | `23af1f038509d58ef4a9bb816f8a15c46db196112de7dc1e423271c1c8848f51` | `82587ac24d1af6cdbe604d11e84584d8b631946d4ce41e7f13d9f403e391e066` | update    |

No removals. Rollback: `git checkout -- CLAUDE.md` (restores the baseline hash).
First-draft artifacts removed from this candidate: the Dev Lifecycle article copy
(hash `55cb7671…`) is gone; the earlier `CLAUDE.md` candidate hash `ba451002…` is
superseded.

## Change summary

- `CLAUDE.md`: +4 lines (heading, one paragraph). 87 → 91 lines. The paragraph
  names the trigger (logical change done, no lifecycle run active), the action (spawn
  `@docs-writer` without asking, what to give it, which docs), the graph index
  call, the exemption (typos, formatting, comments) and the prohibition on
  `/dev document`.

## Stage table

| Stage    | Status    | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                             |
| -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | completed | Two source reflections, 2026-11-09 and 2026-11-14                                                                                                                                                                                                                                                                                                                                             |
| Triage   | completed | This report, revised once on user feedback 2026-11-14; tracker: Claude native tasks, run ID `EVOLVE-20261114`                                                                                                                                                                                                                                                                                 |
| Validate | completed | `Validation.md`: pass, 9/9 scenarios, after one in-pass revision (trigger now excludes any active lifecycle run, not only `/dev`)                                                                                                                                                                                                                                                             |
| Adopt    | completed | 2026-11-14: installed `candidate/CLAUDE.md` over `CLAUDE.md`; installed sha256 `82587ac24d1af6cdbe604d11e84584d8b631946d4ce41e7f13d9f403e391e066` equals the validated candidate hash. Integration: `docs/.og/cli.mjs` referenced by the new section exists; `@docs-writer` present in the Agents table; no caller or discovery table needed a change. Uncommitted; commit is the developer's |

Draft readiness: validated, pass, adopted. Current stage: closed. Next action: none;
lifecycle complete. Suggested commit: `chore(harness): auto-align docs for code written outside a ticket`.

## Unresolved decisions

None blocking. Earlier questions (ask vs. no ask, article placement, canonical) were
answered by the user on 2026-11-14 and are reflected above.

## Candidate acceptance record

Accepted by the developer on 2026-11-14, their words: "adopt both, tests passes".
Earlier direction, 2026-11-14: "no needs to ask... lets just simply instruct CLAUDE/Agents.md
to spawn docs-writer ... vibe-codder will seee changes in docs together with code in git diff".
