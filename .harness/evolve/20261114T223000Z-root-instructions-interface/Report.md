# Evolve candidate — canonical root-instructions interface

## Identity

- Candidate: `20261114T223000Z-root-instructions-interface`
- Requested outcome: the bootstrap package states what every generated root
  instruction file (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`) must
  contain and why, including the "work outside a ticket" rule, so projects
  bootstrapped with `/harness-bootstrap launch` get the rule and `patch apply` can
  check it later.
- Scope: `.canonical-implementation-harness/` only: one new interface article, one
  registry row, one pointer sentence in launch Block C.
- Non-goals: no change to this repo's `CLAUDE.md` (sibling candidate
  `20261114T220500Z-doc-catch-up-outside-ticket`); no template rendering logic; no
  change to `manifest.json`; no patch bundle (that is `/harness-bootstrap patch
prepare` after adoption).
- Source: user decision 2026-11-14, "for canonical we might need to have
  AGENTS-INTERFACE document with this section and overall intent", on the two
  triaged vibe-coding reflections.
- Evidence: Block C of `references/launch/01b-launch-install.md` lists the root
  file's content in one sentence and nothing checks the generated file afterwards.
  The package already has the concept needed: an "Interface article" is the
  required-categories contract that `structure` registry rows check against (see
  the comment block in `registry.md`). No such article exists for root instructions.

## Action

**Create** `canonical/root-instructions/INTERFACE.md` (no existing owner: searched
`canonical/`, `references/`, `patterns/` for root-instruction guidance; only Block C's
one sentence exists). **Update** `registry.md` (new `structure` row) and
`references/launch/01b-launch-install.md` (Block C pointer). Affected callers:
`/harness-bootstrap launch` Block C; `patch harvest`/`patch apply` via the registry
row; this repo's `CLAUDE.md` as the first deployed file the row checks.

Naming: the user said "AGENTS-INTERFACE". The package distinguishes `INTENT.md`
(authoring-only, per skill/agent) from interface articles (permanent contracts checked
by `structure` rows). This document is a contract, so it is `INTERFACE.md` under a
`root-instructions/` folder that covers all three providers' root files, not only
`AGENTS.md`.

## Acceptance criteria

1. The interface article lists every category Block C already names (Why;
   conventions; architecture; NFRs; lifecycles; agents; tracker and integrations)
   plus "work outside a ticket", each with its intent, under the root-context
   length budget.
2. The "work outside a ticket" category matches the sibling candidate's `CLAUDE.md`
   section in meaning: automatic docs-writer spawn after a logical change, graph
   index, exemptions, no Document stage.
3. Block C tells launch to read the article and render categories in the provider's
   invocation syntax.
4. The registry has a `structure` row mapping the article to `CLAUDE.md`, and the
   current `CLAUDE.md` (after the sibling candidate is adopted) satisfies every
   category.
5. Nothing in the article names a provider-specific path or a deployment value.

## Proposed file mapping

| Source (candidate)                                                                     | Destination                                                                  | Baseline hash                                                      | Candidate hash                                                     | Operation |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | --------- |
| `candidate/.canonical-implementation-harness/canonical/root-instructions/INTERFACE.md` | `.canonical-implementation-harness/canonical/root-instructions/INTERFACE.md` | absent                                                             | `71f15c0d9c29af3d8df7d9eed61ac5ae369dff9489dbdd5eb7f4bd9e5eff8bb7` | create    |
| `candidate/.canonical-implementation-harness/registry.md`                              | `.canonical-implementation-harness/registry.md`                              | `151b4b502c381a931a85dfdf4c88b20ae51daee77315f07e5db002a8aac81125` | `a180ce376d349f38ecfcba35fdef6ed88262a4a8495a37ab5f8274084f8746fb` | update    |
| `candidate/.canonical-implementation-harness/references/launch/01b-launch-install.md`  | `.canonical-implementation-harness/references/launch/01b-launch-install.md`  | `5230dc5ccf93aeb1002c90ece3632a1d9bb9ba445519e1f8290c8f6e9e6e3f98` | `11202e3e4666353ea983ea1f9e97ba8ea177320a4eb5841ff29da9a00d19dfc5` | update    |

No removals. Rollback: delete the new file; `git checkout --` the two updated files.

## Change summary

- `INTERFACE.md` (61 lines): purpose of the root file, "interface not template"
  note, eight required categories with intent, a "must not contain" list.
- `registry.md`: one `structure` row, `root-instructions`, inserted before the
  Engineering Guide doc rows.
- `01b-launch-install.md` Block C: three added lines pointing at the article.

## Stage table

| Stage    | Status         | Evidence / reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflect  | not_applicable | Entered from a user decision during Triage of the vibe-coding reflections; no separate reflection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Triage   | completed      | This report; tracker: Claude native tasks, run ID `EVOLVE-20261114`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Validate | completed      | `Validation.md`: pass, 8/9 scenarios; unit-suite scenario blocked by local toolchain (missing `@rolldown/binding-darwin-x64`), not required since nothing under test reads the changed files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Adopt    | completed      | 2026-11-14, after the sibling: created `canonical/root-instructions/INTERFACE.md` (sha256 `71f15c0d9c29af3d8df7d9eed61ac5ae369dff9489dbdd5eb7f4bd9e5eff8bb7`), updated `registry.md` (`a180ce376d349f38ecfcba35fdef6ed88262a4a8495a37ab5f8274084f8746fb`) and `references/launch/01b-launch-install.md` (`11202e3e4666353ea983ea1f9e97ba8ea177320a4eb5841ff29da9a00d19dfc5`); all equal the validated hashes. Integration: Block C and the registry row both name the exact installed path, which exists. Unit suite: the developer reports it passes; the assistant's own rerun in this shell is still blocked by the missing `@rolldown/binding-darwin-x64` native module, so that evidence is the developer's attribution. Uncommitted |

Draft readiness: validated, pass, adopted. Current stage: closed. Follow-ups outside
this lifecycle: `/harness-bootstrap patch prepare` to bundle the canonical change for
other projects; bump the package CHANGELOG when that release is cut. Suggested commit:
`feat(harness-bootstrap): add root-instructions interface article`.

## Unresolved decisions

1. Whether `canonical/manifest.json` should also point at the article (it already
   names each provider's `instructions` path, so launch can find the article from
   Block C alone). Draft leaves the manifest untouched.
2. Whether the article's "work outside a ticket" wording should also be carried into
   the canonical dev-skill `INTENT.md` as a non-goal. Draft leaves it out: the user
   asked to keep this out of the dev lifecycle.

## Candidate acceptance record

Accepted by the developer on 2026-11-14, their words: "adopt both, tests passes".
