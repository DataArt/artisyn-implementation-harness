---
id: 7914ab7f
purpose: The approved term registry for project concepts that have more than one plausible name
keywords: [terminology, registry, one term per concept, docs-writer]
---

# Terminology

_The approved term for each project concept that has more than one plausible name._

---

## Why

A concept named three different ways across three documents reads as three concepts until a reader checks. This registry fixes one approved term per concept so `docs-writer` and every design artifact use the same word every time.

See `01 Principles.md`'s "One term per concept" rule in Manner — this file is that rule's data.

---

## How this fills up

- **At launch**, if this file has no rows yet, the orchestrator scans existing code identifiers, README/doc nouns, and confirmed Q&A domain language for recurring project-specific terms and seeds an initial set. Skipped if rows already exist — launch never overwrites an established registry.
- **During `/design`**, Solution Step 2 proposes a row for any domain term the solution coins that isn't here yet; `docs-writer` appends it as part of writing `solution/Architecture.md`.
- **Anywhere else**, add a row by hand the moment two documents start using different words for the same thing.

A term stays out of this table if it's standard English, a well-known industry term (HTTP, Lambda, CDK), or used exactly once — the registry is for project-specific concepts at risk of drifting, not a full glossary.

---

## Registry

| Term            | Approved form   | Forbidden synonyms                                        | Definition                                                                                                                                                                                                                                                                              | Introduced in                                                 |
| --------------- | --------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Lifecycle strip | lifecycle strip | stage strip, stage bar, lifecycle tiles, stage row        | The static ordered list of four color-coded tiles (Design → Implement → Validate → Document) inside the Web Explorer hero's WORKFLOW PREVIEW card; `lifecycleStages` in `Landing.tsx`                                                                                                   | `docs/System Architecture (LLD)/Web Explorer/00. Overview.md` |
| Pillars         | pillars         | value cards, outcome cards, pillar cards, benefit cards   | The three cards under the Web Explorer hero (Solution design, Development / implementation, Consistent documentation) that state the harness's outcomes within the first viewport; `pillars` in `Landing.tsx`                                                                           | `docs/System Architecture (LLD)/Web Explorer/00. Overview.md` |
| Channel         | channel         | distribution method, install source, delivery route, feed | One of the five pinned ways a harness release reaches a project: plugin marketplace `dataart`, GitHub Packages npm, skills.sh, `gh skill`, GitHub Release ZIP                                                                                                                           | `docs/Harness/09 Distribution/index.md`                       |
| Install CLI     | install CLI     | installer, bootstrap CLI, setup script, harness CLI       | The `init` / `update` / `doctor` command line shipped in the npm package and the release ZIP; places the package and manages `.harness/state/`                                                                                                                                          | `docs/Harness/09 Distribution/01 Install.md`                  |
| Release lane    | release lane    | release track, release channel, release stream            | An automated release flow on push to `main`. The repository has one: the harness lane (version stamped in the PR with Nx Release, built on merge and tagged and published after approval by `deploy-harness.yml` in the Harness Release Pipeline container); not a distribution channel | `docs/Engineering Guide/07 Branching Strategy.md`             |
