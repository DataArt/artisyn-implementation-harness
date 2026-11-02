---
id: 1cca243f
---

# ADLC-000: Giscus Comments for VitePress — Report

| Field  | Value                                                      |
| ------ | ---------------------------------------------------------- |
| Ticket | ADLC-000                                                   |
| Branch | `feat/adlc-000-giscus-vitepress`                           |
| PR     | —                                                          |
| Author | Anton Merkulov                                             |
| Status | ✅ Complete                                                |
| Phase  | 📋 Plan ✅ · 🔨 Implement ✅ · 🧪 Test ✅ · 📝 Document ✅ |

## Progress

| #   | Step                                            | Status  | Notes                                                                                                                                                    | Test | Docs |
| --- | ----------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | External: GitHub Discussions & giscus App setup | ✅ Done | repo-id `R_kgDOTZmOiA`, category "ADLC Comments" (Announcements format) id `DIC_kwDOTZmOiM4DCdfZ`                                                        | —    | ✅   |
| 2   | Web: Mount a static giscus widget on doc pages  | ✅ Done | `@architect` satellite review: GO. Widget confirmed rendering on 45 doc pages, absent on 8 home/404 pages                                                | ✅   | ✅   |
| 3   | Web: SPA-navigation reactivity                  | ✅ Done | Route-watch + script/iframe teardown-reinject verified live: widget updates on client-side nav, confirmed via Network tab across repeated back-and-forth | ✅   | ✅   |

<!--
Status values : ⏳ Pending · 🔄 Active · ✅ Done · ⚠️ Blocked · ⏭️ Skipped
Test / Docs   : ✅ done · — not applicable · (empty) = not yet run
-->

## Architecture Deviations

| #   | Deviation | Justification |
| --- | --------- | ------------- |

<!--
Populated by /dev-plan Step 7b if any justified deviations were approved.
Leave empty if no deviations — do not remove the section.
Each deviation must be addressed in the Document phase: Target Architecture updated or a tech debt ticket created.
-->

## Deviation Audit

_Date: 2026-08-01_

`@architect` cross-checked `1-plan.md`/`2-report.md` against `docs/Target Architecture (HLD)/` and `docs/System Architecture (LLD)/`.

| #   | Doc section                                                                          | Divergence                                                                                                                | Change required                                                                                                            | Classification                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `HLD/v1/Containers/Web.md` — baseline diagram                                        | Only shows build/deploy flow, not the new browser→giscus.app→GitHub runtime flow (= TD-2)                                 | Add a second diagram/Data flow subsection for the runtime path                                                             | Must fix                                                                                                                                                   |
| 2   | `HLD/v1/Containers/Web.md` — Responsibilities                                        | No bullet reflects the new comments widget                                                                                | Add one responsibility bullet                                                                                              | Must fix                                                                                                                                                   |
| 3   | `HLD/v1/Containers/Web.md` — Technology table                                        | Missing a "Comments" row                                                                                                  | Add `Comments \| giscus (client-side, no npm dep)` row                                                                     | Must fix                                                                                                                                                   |
| 4   | `HLD/v1/System Overview.md` — design principle "no runtime compute beyond edge auth" | Now literally false — giscus executes third-party JS at runtime                                                           | Qualify: excludes third-party client-side widgets calling external services directly                                       | Must fix                                                                                                                                                   |
| 5   | `HLD/v1/Non-Functional Concerns/Requirements.md` (NFR-1) + `Containers/Auth.md`      | Neither doc mentions the new, second, GitHub-permission-based access boundary for comments (confirmed developer decision) | Add a qualifying NFR/note describing the second access boundary                                                            | Must fix (P1 — security-relevant, currently undocumented outside a Story that gets archived)                                                               |
| 6   | `docs/System Architecture (LLD)/`                                                    | Directory doesn't exist repo-wide (pre-existing gap); this ticket's implementation detail has no LLD home                 | Create `docs/System Architecture (LLD)/Web/00. Overview.md` documenting the giscus component structure as settled outcomes | Must fix (P1 — required by placement matrix for any MISS); the repo-wide empty-LLD gap itself is pre-existing, out of scope beyond this ticket's own entry |
| 7   | `HLD/v1/System Sizing.md` — Data storage row                                         | Doesn't mention comment data now living externally on GitHub                                                              | Add a one-line scope note                                                                                                  | Advisory — low materiality, GitHub-operated, not our cost/ops burden                                                                                       |

**Non-findings (checked, no gap):** NFR-2 (giscus IDs are non-secret, justified in plan), Infrastructure.md/CDK (no CSP exists to conflict with), Auth.md container boundary (untouched), System Overview's top-level diagram (established pattern pushes container-level runtime detail into the container doc, i.e. finding 1).

## Implementation Notes

### Step 1 — External: GitHub Discussions & giscus App setup

Discussions enabled, giscus App installed, "ADLC Comments" category created in Announcements format — all as planned. Getting the IDs required a deviation from the plan's documented method:

- Plan called for GitHub's GraphQL API Explorer at `docs.github.com/en/graphql/overview/explorer`. That page no longer hosts an embedded explorer — GitHub removed it on 2025-11-11 (redirects to a "Using GraphQL Clients" guide instead).
- First attempt (navigating to `api.github.com/graphql` directly in the browser) failed with a rate-limit error — that endpoint is POST-only and requires an auth token; anonymous GET requests don't execute queries and hit anonymous rate limits immediately.
- Resolved by installing GitHub CLI (`brew install gh`, not previously installed) and running the query via `gh api graphql -f query='...'`, authenticated as the developer's own GitHub account. Returned `repository.id = R_kgDOTZmOiA` and the "ADLC Comments" category id `DIC_kwDOTZmOiM4DCdfZ`.

No plan changes needed — this only affects the _how_ of Step 1, not its scope or outcome.

### Step 2 — Web: Mount a static giscus widget on doc pages

Delegated to `@web`: created `GiscusComments.vue`, `Layout.vue`, and wired `Layout` into `theme/index.ts` per plan. `@web` reported high confidence but could not run `yarn nx run site:build`/`site:serve` itself (no Bash access) or trigger the satellite review (no Agent access) — both were completed by the orchestrator afterward. Several issues surfaced during live verification, all fixed in this step:

- **Typecheck failure**: `tsc` couldn't resolve `import Layout from './Layout.vue'` in `index.ts` — no `*.vue` module shim existed in this project (no `vue-tsc` dependency). Fixed by adding `apps/docs-web/.vitepress/theme/shims-vue.d.ts`.
- **Lint failure on the new shim**: the standard Vue shim boilerplate (`DefineComponent<{}, {}, any>`) trips this repo's `@typescript-eslint/no-empty-object-type` and `no-explicit-any` rules. Fixed by using `DefineComponent<object, object, unknown>` instead — behaviorally identical for our purposes (no `vue-tsc` prop-level type-checking happens in this repo), just lint-clean.
- **`%20` in discussion titles**: `data-mapping="pathname"` makes giscus read the browser's raw, URL-encoded `location.pathname` directly (VitePress page paths with spaces, e.g. `01 Overview.md`, get percent-encoded). Switched to `data-mapping="specific"` with an explicit `data-term="{decodeURIComponent(window.location.pathname)}"` so the mapping string is fully under our control and human-readable. Covered by the plan's AC-3 ("`data-mapping=\"pathname\"` **or equivalent**").
- **UI expectation mismatch (no code change)**: developer initially expected giscus to embed GitHub's full native comment editor (rich toolbar, attachments) as seen on github.com directly. Confirmed giscus intentionally ships its own simpler custom editor (Write/Preview tabs, markdown supported by typing, no toolbar buttons) — this is a giscus platform characteristic, not configurable. No action taken; developer accepted as-is for this ticket.
- Developer live-tested the widget end-to-end on `localhost:5173` (not just build/typecheck): giscus auto-created a mapped discussion and accepted a real comment — confirms AC-2/AC-3 functionally, not just structurally.

`@architect` satellite review verdict: **GO**. Confirmed via built `dist/` output that giscus markup is present on all 45 doc-layout pages and absent from all 8 `layout: home`/404 pages (AC-2, AC-5, AC-6). No HLD container-boundary or NFR violations. One doc gap noted (Web.md's baseline diagram doesn't yet show the new browser→giscus.app→GitHub runtime flow) — not a Step 2 blocker, flagged for the Document phase.

### Step 3 — Web: SPA-navigation reactivity

Delegated to `@web`: added `watch(() => route.path, ...)` in `GiscusComments.vue` (same reactive pattern as the existing zoom logic in `index.ts`), which tears down the previously-injected `<script>`/iframe and re-injects a fresh script with a recomputed `data-term` on every route change. Went smoothly — no bugs found this time. `@web` did a static trace of VitePress's router internals to confirm `route.path` updates only after `window.location.pathname` is already current, so the recomputed `decodeURIComponent(window.location.pathname)` is never stale.

Orchestrator ran `yarn nx run site:typecheck`/`site:lint`/`site:build` — all clean. Developer live-verified in browser: clicked between two doc pages via sidebar nav (no full reload), confirmed the widget updated to the new page's discussion and a fresh `giscus` network request fired each time, repeated back-and-forth successfully.

## PR Review

_Date: 2026-08-01_

Reviewed by `@web`, cross-checked against `vitepress`'s actual router source. No XSS/injection vector — all `data-*` values are hardcoded constants or `decodeURIComponent(window.location.pathname)` assigned via `setAttribute`, never `innerHTML`.

| Code        | Finding                                                                                                                                                                                                 | File                             | Severity | Resolution                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| BUG-001     | `decodeURIComponent(window.location.pathname)` can throw `URIError` on a malformed percent-encoded path, aborting `injectGiscus()` uncaught                                                             | `GiscusComments.vue:31`          | Advisory | ✅ Fixed — wrapped in `decodedPathname()` helper with try/catch fallback to raw pathname              |
| DESIGN-001  | `data-mapping="specific"` paired with `data-strict="0"` — giscus recommends `data-strict="1"` with a custom `data-term` to avoid substring-match collisions with other discussion titles                | `GiscusComments.vue:30-32`       | Advisory | ✅ Fixed — set `data-strict="1"`, re-verified existing discussion still resolves by exact title match |
| DESIGN-002  | Edge case: if a nav target URL isn't already canonical, VitePress corrects `location.pathname` after `route.path` settles, with no further `watch` trigger — term could reflect the pre-correction path | `GiscusComments.vue:31`          | Advisory | Accepted — all current nav links are build-time canonical                                             |
| BUG-002     | Rapid back-to-back navigations could race: an in-flight `client.js` load callback firing after its `<script>` was already detached by the next `injectGiscus()` call                                    | `GiscusComments.vue:15-40,49-52` | Advisory | Accepted — self-corrects on next navigation, not a hard failure                                       |
| PERF-001    | Each `injectGiscus()` call re-attaches a giscus `message` listener that isn't explicitly torn down — minor listener accumulation over a long session                                                    | `GiscusComments.vue:22-39`       | Optional | Accepted — functionally harmless                                                                      |
| IMPROVE-001 | Manual `while (firstChild) removeChild(...)` loop can be simplified to `mount.value.replaceChildren()`                                                                                                  | `GiscusComments.vue:18-20`       | Optional | ✅ Fixed — replaced with `mount.value.replaceChildren()`                                              |

**Verdict:** LGTM — all findings are Advisory/Optional edge cases; none block merge or contradict AC-1 through AC-7.

## Test Results

_Date: 2026-08-01_

| Project       | Build | Tests | Typecheck | Lint |
| ------------- | ----- | ----- | --------- | ---- |
| `site`        | ✅    | ✅    | ✅        | ✅   |
| `lambda-auth` | ✅    | ✅    | ✅        | ✅   |
| `infra`       | —     | ✅    | ✅        | ✅   |

### Notes

`yarn nx run-many -t typecheck/test/lint --all` covered every NX project (`site`, `lambda-auth`, `infra`) with no failures — confirms no regression outside the Web layer this ticket touched. `infra` has no `build` target (CDK synth is its equivalent, out of scope — untouched by this ticket).

Manual acceptance testing (see `## PR Review` and AC checklist above) additionally covered: access-denied behavior for a GitHub account without repo read access, and dark/light theme switching via `data-theme="preferred_color_scheme"` — both confirmed working by the developer.

## Documentation

_Date: 2026-08-01_

| Item                                                                   | Action                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Target Architecture (HLD)/v1/Containers/Web.md`                       | Updated, then revised — comments content extracted to a new dedicated container (see below); final Web.md just cross-references it (62 lines)                                                                                                                                                                      |
| `Target Architecture (HLD)/v1/Containers/Discuss.md`                   | **Created** — new HLD container for the giscus comments widget, split out of Web after initial review; giscus is entirely third-party/external (no infra of ours), warranting its own container rather than a Web "Technology" row. Uses the detailed runtime diagram from `impl/architecture-notes.md` (57 lines) |
| `Target Architecture (HLD)/v1/System Overview.md`                      | Updated — qualified "no runtime compute" design principle; added Discuss to the Containers table and system-diagram footnote                                                                                                                                                                                       |
| `Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md` | Updated — added NFR-6 (second, GitHub-permission-based access boundary)                                                                                                                                                                                                                                            |
| `Target Architecture (HLD)/v1/Containers/Auth.md`                      | Updated — cross-referenced NFR-6, clarified scope (references Discuss container)                                                                                                                                                                                                                                   |
| `System Architecture (LLD)/README.md`                                  | Created — first LLD index in the repo; points to `Discuss/`                                                                                                                                                                                                                                                        |
| `System Architecture (LLD)/Discuss/00. Overview.md`                    | Created (initially under `Web/`, moved to `Discuss/` to mirror the new HLD container name per the LLD-mirrors-HLD rule) — component structure, integration pattern, key decisions (37 lines)                                                                                                                       |
| `Target Architecture (HLD)/v1/System Sizing.md`                        | Updated — noted comment data lives externally on GitHub                                                                                                                                                                                                                                                            |
| `docs/README.md`                                                       | Updated — indexed the LLD entry (path updated to `Discuss/`)                                                                                                                                                                                                                                                       |
| `apps/docs-web/README.md`                                              | Updated — links to `Containers/Discuss.md` and `System Architecture (LLD)/Discuss/00. Overview.md`                                                                                                                                                                                                                 |

### Notes

All 7 findings from the `@architect` deviation audit were addressed (see `## Deviation Audit` above), plus required housekeeping (docs index entries). Mid-review, the developer decided giscus warranted its own HLD container (Discuss) rather than living inside Web's Technology table, since it's wholly third-party/external — this doc set was restructured accordingly after the initial pass. No App README env/build-target changes were needed — this was a purely client-side addition. No `docs/AI SDLC/` content — this is implementation detail about the docs site itself, not engagement content.

## Satellite Review

_Date: 2026-08-01_

`@architect` cross-checked all 9 docs touched in this Document phase for contradictions and stale references.

| #    | Finding                                                                                                                                                                                                                    | Classification                                                                                                                   | Resolution                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| SR-1 | `Web.md` still 82 lines, 2 over the <80 HLD container-doc budget                                                                                                                                                           | Introduced by this change — minor                                                                                                | Skipped — negligible overage |
| SR-2 | `Web.md` Navigation section claims "five fixed items, one per top-level `docs/` section" — actual `config.ts` nav has 4 active items mapping to `AI SDLC/` sub-sections + Engineering Guide, not one per top-level section | Pre-existing drift, not introduced by this ticket                                                                                | Tracked as TD-3              |
| SR-3 | `System Overview.md`'s Web container summary row doesn't mention comments (Web.md's detailed Responsibilities does)                                                                                                        | Ruled out — container summary rows are intentionally terse one-liners across all containers, not exhaustive; not a contradiction | Skipped — not a real gap     |
| SR-4 | `Auth.md`'s sequence diagram has no `classDef` styling (predates this ticket — only a text line was added to this file)                                                                                                    | Pre-existing gap, not introduced by this ticket (same gap exists elsewhere, e.g. Deploy Lifecycle doc)                           | Tracked as TD-4              |
| SR-5 | `apps/docs-web/README.md` describes `HLD_VERSION` as active, but the nav block that consumes it is commented out in `config.ts` (predates this ticket — only a link line was added)                                        | Pre-existing stale reference, not introduced by this ticket                                                                      | Tracked as TD-5              |

## Delivery Summary

The VitePress docs site now has a working comments widget on every documentation page, backed by GitHub Discussions on the private `[[GITHUB_ORG]]/[[GITHUB_REPO]]` repo via giscus. Readers with GitHub access to the repo can discuss any page inline; the widget correctly excludes the homepage, stays in sync as readers navigate client-side between pages, and uses human-readable (non-percent-encoded) discussion titles. No new npm dependency and no backend/infrastructure changes were needed — it's a pure client-side addition to the existing VitePress theme.

## Tech Debt

| #    | Description                                                                                                                                                                                                | Type       | Ticket |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| TD-1 | Migrate `theme/index.ts`'s deprecated `Theme.setup()` (mermaid/image zoom) into `Layout.vue`'s own `setup()` — now that a custom Layout exists, VitePress recommends this pattern over the deprecated hook | cleanup    | —      |
| TD-2 | ~~Web.md's Web container baseline diagram doesn't yet depict the new runtime flow~~ — ✅ Resolved in Document phase, see `## Documentation`                                                                | dependency | —      |
| TD-3 | `Web.md` Navigation section's "five fixed items, one per top-level `docs/` section" claim is stale — actual `config.ts` nav has 4 active items, doesn't map 1:1 to top-level `docs/` sections              | cleanup    | —      |
| TD-4 | `Auth.md`'s sequence diagram has no `classDef` styling — same gap likely exists in other sequence diagrams repo-wide (e.g. Deploy Lifecycle doc), worth a consistency pass                                 | cleanup    | —      |
| TD-5 | `apps/docs-web/README.md` describes `HLD_VERSION` as an active nav-driving variable, but the `config.ts` block that consumes it is commented out — either reinstate the HLD nav block or update the README | cleanup    | —      |

<!--
Type values: blocker · dependency · cleanup · security · performance · ux
Ticket: fill in internal ticket number (e.g. ADLC-XX), otherwise —
Rows are added here by /dev-implement (Step 3b) as debt is discovered.
-->

## Efforts Spent

| Date       | Phase     | Human time | AI tokens | Notes                                                                                      |
| ---------- | --------- | ---------- | --------- | ------------------------------------------------------------------------------------------ |
| 2026-08-01 | Implement |            |           | Step 1 — GitHub Discussions & giscus App setup                                             |
| 2026-08-01 | Implement |            |           | Step 2 — Mount static giscus widget (incl. typecheck/lint/mapping fixes, architect review) |
| 2026-08-01 | Implement |            |           | Step 3 — SPA-navigation reactivity, live-verified                                          |
| 2026-08-01 | Implement |            |           | Implement phase complete — all 3 steps done, 2 TD items logged                             |
