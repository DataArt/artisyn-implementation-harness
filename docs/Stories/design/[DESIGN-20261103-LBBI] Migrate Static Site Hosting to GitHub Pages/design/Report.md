---
id: 1d9f2b6c
purpose: Design-lifecycle run record (state, evidence, metrics, WAF, gate) for the GitHub Pages migration ticket
keywords: [design-report, github-pages, aws-migration, lifecycle-tracking]
---

# Design Report — DESIGN-20261103-LBBI: Migrate Static Site Hosting to GitHub Pages

## Context

_Resolved once in Context Gathering. Every later phase reads these values instead of re-resolving them._

| Field               | Value                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Track               | Project                                                                                                                                                                  |
| Source docs         | `docs/Target Architecture (HLD)/`                                                                                                                                        |
| Dest docs           | `docs/Target Architecture (HLD)/v1`                                                                                                                                      |
| Subfolder           | `v1` (spans `System Overview.md`, `Containers/Infrastructure.md`, `Containers/Auth.md`, `Non-Functional Concerns/Requirements.md` — too cross-cutting for one container) |
| Architect agent     | `@architect`                                                                                                                                                             |
| Implementation note | Project design covering this repo's own containers — `/dev` in this repo is the expected next step.                                                                      |

## State

```yaml
current_stage: ceremony
completed_stages: ['context-gathering']
selected_artifacts: []
next_action: 'Ceremony — commit'
context_fingerprint: ''
```

## Evidence

| Source                                                                      | Read at stage     | Relevant decision or constraint                                                                                                                                                                                                                                                                                                                                                                                                             | Reference/version |
| --------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `docs/Target Architecture (HLD)/v1/System Overview.md`                      | context-gathering | Purpose line calls this a "password-protected" site; design principle states "all infrastructure is code (AWS CDK)". Both must change once the site is open-sourced and hosted on GitHub Pages — no AWS, no password gate.                                                                                                                                                                                                                  | current           |
| `docs/Target Architecture (HLD)/v1/Containers/Infrastructure.md`            | context-gathering | Entire container is AWS CDK (CloudFront, S3 OAC, Lambda@Edge association, GitHub OIDC `CiStack`). GitHub Pages removes the need for CDK-managed CDN/origin/IAM entirely — container likely retired, not just edited.                                                                                                                                                                                                                        | current           |
| `docs/Target Architecture (HLD)/v1/Containers/Auth.md`                      | context-gathering | Lambda@Edge basic-auth handler gating every route (NFR-1). Developer explicitly said auth flow no longer needs maintaining for an open-source site — this container is removed.                                                                                                                                                                                                                                                             | current           |
| `docs/Target Architecture (HLD)/v1/Non-Functional Concerns/Requirements.md` | context-gathering | NFR-1/NFR-2 (basic auth + secret handling), NFR-4 (CDK-only infra), NFR-8 (OIDC deploy roles), NFR-9 (CloudFront/S3 access logging) are all AWS/auth-specific and become moot or need GitHub-Pages-native replacements. NFR-3 (region) is moot — GitHub Pages has no region concept.                                                                                                                                                        | current           |
| `docs/Target Architecture (HLD)/v1/Containers/Discuss.md`                   | context-gathering | Comments widget (giscus) is explicitly "no infra of its own" and works client-side against GitHub Discussions — confirms it is hosting-agnostic and unaffected by this migration.                                                                                                                                                                                                                                                           | current           |
| `apps/infra/lib/docs-stack.ts` (git status: uncommitted)                    | context-gathering | Unrelated in-flight change (CSP `ResponseHeadersPolicy`, NFR-10) already modified but uncommitted on this branch. Not part of this ticket's scope — must not be clobbered or swept into this design's commits.                                                                                                                                                                                                                              | working tree      |
| `gh repo view` (current repo state, not a doc)                              | context-gathering | Repo is currently **private** (`DataArt/artisyn-implementation-harness`). "Open-sourcing" is a prerequisite dependency of this migration, not a side effect of it — GitHub Pages' free/native deploy path and public visibility go together; Research must treat repo-visibility change as in scope, not assume it already happened.                                                                                                        | current (private) |
| `apps/docs-web/.vitepress/config.ts` (current code, not a doc)              | context-gathering | No `base` path is currently configured (defaults to `/`), consistent with today's root-domain CloudFront serving. A GitHub Pages **project site** without a custom domain serves under `/{repo}/`, which would break every absolute asset/link unless `base` is set or a custom domain is kept — a real current-state gap, not a future one, that Research must resolve explicitly (custom domain vs. `base` path).                         | current (unset)   |
| `.github/workflows/cd.yml` + `apps/infra/project.json`                      | context-gathering | Current CD actually deploys via `yarn nx affected --target=deploy` behind an AWS OIDC role (`DEPLOY_ROLE_ARN`), driven by CDK's `synth`/`diff`/`output` nx targets. This whole pipeline — not just the Infrastructure container's docs — is the thing being replaced; Research must cover the GitHub Pages–native deploy workflow (`actions/configure-pages` + `actions/deploy-pages`) as a CD change, not only an architecture-doc change. | current           |

## Status

| Field  | Value                                                                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261103-LBBI                                                                                                                                                                |
| Branch | `docs/design-20261103-lbbi-github-pages-migration`                                                                                                                                  |
| Status | 🔄 In Progress                                                                                                                                                                      |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame 🔄 · 🔍 Research ⏳ · 🏗 Evaluate ⏳ · 📦 Solution ⏳ · 🔎 Review ⏳ · 💬 Address Feedback ⏳ · 📤 Publish ⏳ · 🏁 Completion ⏳ |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 10s · Wait to date: 14m 43s (closed 14m 43s + current 0s) · Unclassified: 1m 6s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ---- | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-03T13:06:20.993Z | 2026-11-03T13:21:14.252Z | 14m 53s     | 10s  | 14m 43s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (active)             | 2026-11-03T13:21:14.302Z | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (pending)               | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| research (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| evaluate (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| solution (pending)            | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| review-gate (pending)         | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| address-feedback (pending)    | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (pending)             | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s   | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_Filled in during Research OQ triage. One row per open question answered or classified._

| #   | Open question | V/E | Answer / status |
| --- | ------------- | --- | --------------- |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

---

## Gate

- Approver: —
- Draft MR: —
- Approved: — _(a date once approved, or `declined`)_
- Decline reason: — _(filled in by Address Feedback only if declined)_

---

## Efforts

| Date | Phase | Notes |
| ---- | ----- | ----- |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
