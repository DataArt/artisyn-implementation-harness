---
id: 7914ab7f
type: Guide
title: Terminology
description: The approved term registry for project concepts that have more than one plausible name
tags: [terminology, registry, one term per concept, docs-writer]
generated: { by: process:okf-migration, at: 2026-10-07T11:21:02Z }
updated: { by: process:design-solution, at: 2026-11-22T12:00:00Z }
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

| Term                   | Approved form          | Forbidden synonyms                                                 | Definition                                                                                                                                                                                                                                                                              | Introduced in                                                                                            |
| ---------------------- | ---------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Lifecycle strip        | lifecycle strip        | stage strip, stage bar, lifecycle tiles, stage row                 | The static ordered list of four color-coded tiles (Design → Implement → Validate → Document) inside the Web Explorer hero's WORKFLOW PREVIEW card; `lifecycleStages` in `Landing.tsx`                                                                                                   | `docs/System Architecture (LLD)/Web Explorer/00. Overview.md`                                            |
| Pillars                | pillars                | value cards, outcome cards, pillar cards, benefit cards            | The three cards under the Web Explorer hero (Solution design, Development / implementation, Consistent documentation) that state the harness's outcomes within the first viewport; `pillars` in `Landing.tsx`                                                                           | `docs/System Architecture (LLD)/Web Explorer/00. Overview.md`                                            |
| Channel                | channel                | distribution method, install source, delivery route, feed          | One of the five pinned ways a harness release reaches a project: plugin marketplace `dataart`, GitHub Packages npm, skills.sh, `gh skill`, GitHub Release ZIP                                                                                                                           | `docs/Harness/09 Distribution/index.md`                                                                  |
| Install CLI            | install CLI            | installer, bootstrap CLI, setup script, harness CLI                | The `init` / `update` / `doctor` command line shipped in the npm package and the release ZIP; places the package and manages `.harness/state/`                                                                                                                                          | `docs/Harness/09 Distribution/01 Install.md`                                                             |
| Release lane           | release lane           | release track, release channel, release stream                     | An automated release flow on push to `main`. The repository has one: the harness lane (version stamped in the PR with Nx Release, built on merge and tagged and published after approval by `deploy-harness.yml` in the Harness Release Pipeline container); not a distribution channel | `docs/Engineering Guide/07 Branching Strategy.md`                                                        |
| OKF bundle             | OKF bundle             | doc bundle, knowledge bundle, KB folder                            | An OG tier root under `docs/`, treated as one OKF 0.2 bundle; a missing tier root is an absent bundle                                                                                                                                                                                   | `docs/Harness/07 Operational Graph/05 Knowledge Base Format.md`                                          |
| Bundle root `index.md` | bundle root `index.md` | bundle manifest, root index, bundle index                          | The `index.md` at a bundle root; only `okf_version: "0.2"` frontmatter; headings and link bullets; never a graph node                                                                                                                                                                   | `docs/Harness/07 Operational Graph/05 Knowledge Base Format.md`                                          |
| Scope guard            | scope guard            | path guard, write guard, OG filter                                 | The OG rule set (`outside-docs`, `og-internal`, `reserved-basename`, `ogignore`) that decides which paths OG may index or write                                                                                                                                                         | `docs/Harness/07 Operational Graph/01 Ops Model.md`                                                      |
| Frontmatter contract   | frontmatter contract   | B+ frontmatter, B+ format, OG frontmatter                          | The fixed key set and order `id, type, title, description, tags, generated, updated`, with per-key owners                                                                                                                                                                               | `docs/Harness/07 Operational Graph/05 Knowledge Base Format.md`                                          |
| Read-compat window     | read-compat window     | compat mode, legacy fallback, grace period                         | The period from the schema-v1 release to the following major in which `build`/`reindex` read `purpose`/`keywords` when `description`/`tags` are absent                                                                                                                                  | `docs/Harness/07 Operational Graph/02 Storage and Build Model.md`                                        |
| Canonical type map     | canonical type map     | type table, type mapping                                           | OG's per-bundle path-pattern list that gives a doc's default `type`; first match wins; per-bundle fallback                                                                                                                                                                              | `docs/Harness/07 Operational Graph/05 Knowledge Base Format.md`                                          |
| Product folder         | Product folder         | product dir, product tier root, Harness folder                     | The project's Product bundle root, named by `productDir` in `docs/.og/og.config.json`; set at launch, or on upgrade by `migrate` or `reindex-graph`                                                                                                                                     | `docs/Harness/07 Operational Graph/01 Ops Model.md`                                                      |
| Route registry         | route registry         | route table, route config, routes manifest, page registry          | The single Web Explorer module listing every route's path, title, description, social image and index flag; drives page metadata, the sitemap and the hub and nav lists                                                                                                                 | `docs/Stories/design/[DESIGN-20261121-UU4L] Web Explorer Next.js Static Export/solution/Architecture.md` |
| Post-export step       | post-export step       | post-build step, HTML rewrite step, CSP injector, postprocess step | The step in `web-explorer:build` that rewrites the exported HTML in `out/` after `next build`: injects the per-page CSP meta and the landing page's JSON-LD                                                                                                                             | `docs/Stories/design/[DESIGN-20261121-UU4L] Web Explorer Next.js Static Export/solution/Architecture.md` |
