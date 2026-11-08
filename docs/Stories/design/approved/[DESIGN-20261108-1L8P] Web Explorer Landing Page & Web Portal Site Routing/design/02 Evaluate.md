---
name: Design Evaluate Template
description: Template for 02 Evaluate.md — Phase 3 output with Requirements × Options matrix, tradeoffs, and recommendation
type: reference
---

# DESIGN-20261108-1L8P: Web Explorer Landing Page & Web Portal Site Routing — Evaluate

_Produced by the 🏗 Evaluate phase. This is the judgment artifact. WAF assessment lives in `design/Report.md`._

This design bundles two independent decisions (per `design/00 Frame.md`), each evaluated in full below.

## Decision 1: Web Explorer

### Requirements × Options Matrix

Rows = evaluation criteria from `design/00 Frame.md`. Columns = options from `design/01 Research - Web Explorer.md` (A = no dedicated SPA/fold hero into docs, B = adopt scaffold as-is at `apps/web-explorer`, C = rebuild on root-aligned stack using scaffold as reference, D = isolated sub-workspace with own lockfile).
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement                                                                  | Option A            | Option B                                                                                              | Option C                                                                  | Option D                                                                                                                   |
| ---------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Delivers a dedicated, Trigger.dev-style promotional UI (Frame EC1)           | ❌ no dedicated SPA | ✅                                                                                                    | ✅                                                                        | ✅                                                                                                                         |
| Can be configured for GitHub Pages base path correctness (Frame proposed EC) | ✅ n/a, trivial     | ⚠️ Vite defaults to `/`, needs explicit `base` set                                                    | ✅ built in from the start                                                | ⚠️ same gap as B                                                                                                           |
| No NFR-5/NFR-7 regression                                                    | ✅                  | ✅ (static React, no raw HTML)                                                                        | ✅                                                                        | ✅                                                                                                                         |
| Fits this repo's single-root-lockfile/Nx convention                          | ✅                  | ⚠️ needs eslint config + own lockfile removed before registering                                      | ✅ built clean from day one                                               | ❌ explicitly keeps a second lockfile, violates the convention                                                             |
| TS/Vite major-version compatibility with root toolchain (OQ-1)               | ✅ no new deps      | ⚠️ conditional — needs scaffold's TS `^6.0`/Vite `^8` pinned down to root's TS `^5.7`, or root bumped | ✅ pinned to match root from the start                                    | ✅ isolated, no conflict by construction                                                                                   |
| NFR-11 dependency-audit coverage                                             | ✅                  | ✅ once folded into the root lockfile                                                                 | ✅                                                                        | ❌ disqualified — isolated lockfile falls outside the root-lockfile-scoped audit gate (OQ-6, already resolved in Research) |
| Implementation effort / time-to-ship                                         | ✅ lowest           | ✅ low — scaffold is already functionally complete                                                    | ⚠️ medium-high — non-trivial rebuild of an already-working component tree | ⚠️ medium — isolation plumbing (separate CI install step)                                                                  |

### Tradeoffs

| Dimension              | Option A                  | Option B                                                                        | Option C                                                                  | Option D                                                    |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Operational Excellence | ✅ nothing new to operate | ⚠️ new app to maintain, version-drift risk until OQ-1 resolved                  | ✅ built clean against root conventions from day one                      | ❌ a second toolchain to operate/patch outside the Nx graph |
| Security               | ✅                        | ✅ static, no backend                                                           | ✅                                                                        | ⚠️ NFR-11 audit gap                                         |
| Reliability            | ✅                        | ✅                                                                              | ✅                                                                        | ✅ isolated, doesn't destabilize other builds               |
| Performance Efficiency | ✅ lightest possible      | ⚠️ React+Motion+Tailwind bundle heavier than a single promo page strictly needs | ⚠️ same framework choices as B unless deliberately slimmed during rebuild | ✅                                                          |
| Cost Optimization      | ✅                        | ✅ static hosting                                                               | ✅                                                                        | ✅                                                          |
| Sustainability         | ✅                        | ✅ no added compute                                                             | ✅                                                                        | ⚠️ duplicate dependency installs/caches                     |
| Integration Complexity | ✅ none                   | ⚠️ version reconciliation + eslint conformance work                             | ⚠️ rebuild effort, non-trivial                                            | ❌ violates the established single-workspace convention     |
| Vendor Lock-in         | ✅ none                   | ✅ standard web stack, no proprietary dependency                                | ✅                                                                        | ✅                                                          |

Option A is excluded from contention regardless of its clean tradeoff profile — it fails the core requirement in the matrix above (EC1), not a weaker version of it.

### Recommendation

**Recommended option: Option B — adopt the existing `design/reference/web-explorer/` scaffold as-is, registered as `apps/web-explorer`.**

OQ-1 is resolved in this direction: pin the scaffold's `package.json` ranges down to the root's TS `^5.7` / a Vite major already proven in this repo, rather than bumping the root's TS version. A root-wide TS bump has a blast radius (`apps/docs-web`, every tooling script) Frame never scoped, while pinning one new app's declared ranges down is a contained, local change.

This satisfies Frame's EC1 fastest, since the scaffold is already functionally complete (hero, interactive demo, brand assets) and self-documented for monorepo integration (`TECH_STACK.md`). It beats Option C on time-to-ship with equivalent end-state quality once the version pin lands, and beats Option D outright since D is disqualified by the NFR-11 audit-coverage gap (matrix row above). Option A is excluded because it fails Frame's core EC1, not a weaker variant of it.

**Falsifiable condition:** if pinning the scaffold's declared TS/Vite ranges down to root-compatible majors turns out to break the scaffold (e.g. an API only available in TS 6 is load-bearing), this recommendation reverts to Option C (rebuild reference-only) rather than forcing a root-wide TS bump.

**Open questions to resolve before implementation:**

| #    | Question                                                                                                                        | Owner                                                            | Impact if unresolved                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| OQ-1 | Does pinning the scaffold's declared TS/Vite ranges down to root-compatible majors actually work without breaking the scaffold? | Implementer, as a first spike step                               | Reverts recommendation to Option C (falsifiable condition above)           |
| OQ-2 | CI budget fit (install/build time, bundle size) is unmeasured against the current lightweight VitePress-only pipeline           | Implementer, measure during first CI run                         | Cost/sizing detail only, does not block adoption                           |
| OQ-3 | Eslint/Prettier conformance effort for the scaffold's existing source against root's flat config                                | Implementer                                                      | Rework-cost detail, does not block adoption                                |
| OQ-4 | Keep, trim, or rewrite the simulated `/design`/`/dev` walkthrough content before publish?                                       | Content reviewer / developer, during Solution's content drafting | Content-accuracy risk against canonical `docs/Harness/` if left unresolved |
| OQ-7 | Is the scaffold's derived brand mark/wordmark approved as final visual identity?                                                | Developer, a publish-readiness gate                              | Does not block technical adoption                                          |

### WAF Assessment (Decision 1)

Assessment of the recommended option (Option B, with OQ-1 resolved as above):

| Pillar                 | Rating   | Headline                                                                                                                                                                                 |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟡 Amber | New app to operate; mitigated by mirroring `apps/docs-web/project.json`'s existing target shape (build/typecheck/lint). P2: add those targets as part of adoption.                       |
| Security               | 🟢 Green | Static, no backend, no secrets; React/JSX naturally avoids NFR-7's raw-HTML risk. P3: confirmed covered by this repo's existing Gitleaks/audit scans once folded into the root lockfile. |
| Reliability            | 🟢 Green | Static site, no runtime dependency; a build failure fails CI before it can reach production.                                                                                             |
| Performance Efficiency | 🟡 Amber | React 19 + Motion + Tailwind 4 is heavier than a single static promo page strictly needs. P2: set a bundle-size budget/check in CI once adopted.                                         |
| Cost Optimization      | 🟢 Green | Static hosting on GitHub Pages — zero marginal cost.                                                                                                                                     |
| Sustainability         | 🟢 Green | Build-time only, no added runtime compute.                                                                                                                                               |

No P1 items. The TS/Vite version question is tracked as OQ-1 with a stated resolution direction and a falsifiable fallback, not as an unaddressed architectural gap — so it does not count as a P1 here.

---

## Decision 2: Web Portal Site Composition

### Requirements × Options Matrix

Rows = evaluation criteria from `design/00 Frame.md`. Columns = options from `design/01 Research - Web Portal Site Composition.md` (A = no real composition/defer elsewhere, B = Nx "assemble" shell-script target, C = first-class typed `apps/web-portal` Nx project, D = invert via VitePress `public/` passthrough, E = sequencing variant layered on top of whichever of B/C is chosen).
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement                                                                                               | Option A                                                  | Option B                                                       | Option C                                                                     | Option D                                                                                  | Option E (layered on B or C)                                                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Root serves web-explorer AND subpath serves web-docs from one GitHub Pages deploy (Frame EC3/EC4)         | ❌ defers web-explorer to a separate host entirely        | ✅                                                             | ✅                                                                           | ⚠️ inverts the stated direction unless explicitly mirrored                                | ✅ inherits parent topology's answer                                                                |
| Stays build-time static composition, no server runtime (Frame constraint, confirmed at Context Gathering) | ✅                                                        | ✅                                                             | ✅                                                                           | ✅                                                                                        | ✅                                                                                                  |
| `docs-web`→`web-docs` rename stays mechanical (Frame proposed EC)                                         | ⚠️ rename is optional/decoupled from the actual goal here | ✅                                                             | ✅                                                                           | ✅                                                                                        | ✅ explicitly decoupled by design — lowest coupling of all options                                  |
| Composed output is verifiable in CI before reaching production (Frame proposed EC)                        | ✅ nothing to verify                                      | ⚠️ needs an added bash assertion step                          | ✅ typed asserts built into the merge script itself                          | ⚠️ composition hidden inside one app's `public/` dir, harder to audit from `cd.yml` alone | same as whichever parent (B or C) it's layered on                                                   |
| Fits this repo's existing Nx/CI conventions with minimal new surface                                      | ✅ no change at all                                       | ✅ close to the existing single-artifact pipeline shape        | ✅ idiomatic Nx composite-project pattern, reuses `inputs`/`outputs`/caching | ⚠️ works but hides the real mechanism inside an app directory                             | same as parent                                                                                      |
| Deployment risk, given this repo's CD has no staging environment                                          | ✅ no change = no new risk                                | ⚠️ new pipeline step ships straight to production on first use | ⚠️ same exposure as B                                                        | ⚠️ same exposure as B/C                                                                   | ✅ reduces this specific risk by splitting composition and rename into independently revertible PRs |

### Tradeoffs

| Dimension              | Option A                                                                          | Option B                                                           | Option C                                                                         | Option D                                                                                                            | Option E                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Operational Excellence | ✅                                                                                | ⚠️ manual bash merge script, no framework guardrails               | ✅ typed, idiomatic Nx project reusing existing conventions                      | ⚠️ composition logic hidden inside an app directory, harder to audit from the CI workflow file alone                | ✅ reduces per-deploy blast radius                                                          |
| Security               | ✅                                                                                | ✅                                                                 | ✅                                                                               | ✅                                                                                                                  | ✅                                                                                          |
| Reliability            | ✅                                                                                | ⚠️ a copy bug could fail silently without the added assertion step | ✅ explicit asserts with stack traces built in                                   | ⚠️ order-dependent build (one app must finish before the other starts) without that order being visible in `cd.yml` | ✅ each change is independently bisectable/revertible, valuable with no staging environment |
| Performance Efficiency | ✅                                                                                | ✅                                                                 | ✅                                                                               | ✅                                                                                                                  | n/a — sequencing-only, not a build-time concern                                             |
| Cost Optimization      | ⚠️ a second hosting mechanism is itself an added operational surface even if free | ✅                                                                 | ✅                                                                               | ✅                                                                                                                  | ✅                                                                                          |
| Sustainability         | ✅                                                                                | ✅                                                                 | ✅                                                                               | ✅                                                                                                                  | ✅                                                                                          |
| Integration Complexity | ✅ none                                                                           | ⚠️ one new CI step                                                 | ⚠️ a new Nx project adds some ceremony for what is conceptually a copy operation | ⚠️                                                                                                                  | ✅ adds no technical complexity, only reorders existing work                                |
| Vendor Lock-in         | ⚠️ introduces a dependency on a second host                                       | ✅                                                                 | ✅                                                                               | ✅                                                                                                                  | ✅                                                                                          |

Option A is excluded from contention — it fails the core requirement in the matrix above (EC3/EC4).

### Recommendation

**Recommended option: Option C — a first-class `apps/web-portal` Nx project with a typed TypeScript merge script, sequenced per Option E.**

Sequencing: ship the composition mechanism first against the existing `apps/docs-web` path unchanged, verify root→web-explorer/subpath→web-docs works in production, then land the `docs-web`→`web-docs` rename as a second, purely mechanical follow-up PR.

Option A is excluded outright — it fails Frame's core EC3/EC4. Option D is excluded — it either contradicts Frame's explicit root→web-explorer direction or, if mirrored to comply, loses its own main selling point (no new CI step) while gaining the same unknowns as B/C, so it has no advantage once compliant. Between B and C: C wins on Reliability and Operational Excellence (typed asserts vs. a brittle bash chain) at a small, justified cost in setup ceremony — and since this repo's CD workflow has no staging environment, every deploy is production, which makes C's stronger built-in verification worth that small added ceremony. Layering E on top matters for the same reason: splitting the composition mechanism and the mechanical rename into two independently revertible PRs materially reduces the blast radius of the one deploy pipeline this repo has, at zero added technical complexity.

**Falsifiable condition:** if VitePress's nested-subpath `base` support (confirmed viable in Research's OQ-1, but not yet exercised live in this repo) turns out to misbehave in practice once implemented, this recommendation would need revisiting — but that is a Solution-stage spike, not a reason to prefer a different Research option today.

**Open questions to resolve before implementation:**

| #    | Question                                                                                                                          | Owner                                                              | Impact if unresolved                                                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| OQ-2 | Does `configure-pages` auto-detection still work against the merged artifact root, or does `cd.yml` need explicit Pages settings? | Implementer, verify during first CI run of the new assemble target | Worst case needs an explicit Pages settings override; config detail, not a blocker |
| OQ-4 | How deep should CI verification go — file-existence assert vs. a smoke-test serve+curl?                                           | Implementer, decide during Solution's scope drafting               | File-existence assertion is the minimum bar already assumed by this recommendation |
| OQ-6 | Exact subpath string for web-docs — `/docs/`, `/web-docs/`, etc.                                                                  | Developer, confirm during Solution                                 | Naming/config detail, deferred to Solution                                         |

### WAF Assessment (Decision 2)

Assessment of the recommended option (Option C + Option E sequencing):

| Pillar                 | Rating   | Headline                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | 🟢 Green | Typed assemble script with explicit asserts, idiomatic Nx target, sequenced rollout reduces per-deploy blast radius.                                                                                                                                                                                                                                     |
| Security               | 🟢 Green | No new secrets or auth surface; NFR-5/NFR-7 scope unchanged.                                                                                                                                                                                                                                                                                             |
| Reliability            | 🟡 Amber | No staging environment exists, so the first-ever composed deploy is validated only by CI assertions, not a live smoke test before going to production. P2: add a lightweight post-deploy check (e.g. a scheduled Action hitting both the root and subpath URLs) as a follow-up — introducing a full staging environment is out of scope for this design. |
| Performance Efficiency | 🟢 Green | The merge step adds negligible build time; Nx caching limits unnecessary rebuilds when only one app changes.                                                                                                                                                                                                                                             |
| Cost Optimization      | 🟢 Green | No new infrastructure — still GitHub Pages.                                                                                                                                                                                                                                                                                                              |
| Sustainability         | 🟢 Green | No added runtime compute, build-time composition only.                                                                                                                                                                                                                                                                                                   |

No P1 items.
