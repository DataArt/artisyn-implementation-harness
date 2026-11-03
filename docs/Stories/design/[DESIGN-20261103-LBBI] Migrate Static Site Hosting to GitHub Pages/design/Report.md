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
current_stage: publish
completed_stages:
  [
    'context-gathering',
    'ceremony',
    'frame',
    'research',
    'evaluate',
    'solution',
    'review-gate',
    'address-feedback (skipped)',
  ]
selected_artifacts: ['architecture', 'design', 'stack', 'efforts']
next_action: 'Publish — commit'
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

| Field  | Value                                                                                                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticket | DESIGN-20261103-LBBI                                                                                                                                                                          |
| Branch | `docs/design-20261103-lbbi-github-pages-migration`                                                                                                                                            |
| Status | 🔄 In Progress                                                                                                                                                                                |
| Phase  | 🎯 Context Gathering ✅ · 🚀 Ceremony ✅ · 📋 Frame ✅ · 🔍 Research ✅ · 🏗 Evaluate ✅ · 📦 Solution ✅ · 🔎 Review ✅ · 💬 Address Feedback ⏭️ (skipped) · 📤 Publish ✅ · 🏁 Completion 🔄 |

---

## Stage Metrics

<!-- design-metrics:start -->

Source: [stat.json](stat.json). **Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as `Xh Ym Zs`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. Token subtotals have unavailable coverage; ticket usage is not allocated to individual units.

Observed work: 1h 26m 47s · Wait to date: 28m 17s (closed 28m 17s + current 0s) · Unclassified: 20m 16s

| Stage                         | Started (UTC)            | Completed (UTC)          | Elapsed     | Work    | Wait    | Input tokens | Output tokens | Coverage            | Attempts | Failed checks |
| ----------------------------- | ------------------------ | ------------------------ | ----------- | ------- | ------- | ------------ | ------------- | ------------------- | -------- | ------------- |
| context-gathering (completed) | 2026-11-03T13:06:20.993Z | 2026-11-03T13:21:14.252Z | 14m 53s     | 10s     | 14m 43s | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| ceremony (completed)          | 2026-11-03T13:21:14.302Z | 2026-11-03T13:23:32.117Z | 2m 18s      | 1m 6s   | 1m 12s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| frame (completed)             | 2026-11-03T13:23:32.158Z | 2026-11-03T13:31:55.870Z | 8m 24s      | 7m 10s  | 1m 13s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| research (completed)          | 2026-11-03T13:31:55.912Z | 2026-11-03T13:45:05.007Z | 13m 9s      | 11m 47s | 1m 22s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| evaluate (completed)          | 2026-11-03T13:45:05.047Z | 2026-11-03T13:57:29.981Z | 12m 25s     | 10m 23s | 2m 2s   | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| solution (completed)          | 2026-11-03T13:57:30.030Z | 2026-11-03T14:57:05.027Z | 59m 35s     | 51m 49s | 7m 46s  | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| review-gate (completed)       | 2026-11-03T14:57:05.077Z | 2026-11-03T15:01:25.928Z | 4m 21s      | 4m 21s  | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| address-feedback (skipped)    | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |
| publish (active)              | 2026-11-03T15:01:30.507Z | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 1        | 0             |
| completion (pending)          | unavailable              | unavailable              | unavailable | 0s      | 0s      | unavailable  | unavailable   | from_tracking_start | 0        | 0             |

<!-- design-metrics:end -->

## Assumptions

_From Research OQ triage (2026-11-03)._

| #     | Open question                                                                                    | V/E | Answer / status                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------ | --- | --------------------------------------------------------------------------------------------------------------------- |
| OQ-1  | Is a custom domain available/desired for this site (Option B vs. C)?                             | (E) | Deferred to Evaluate/Solution.                                                                                        |
| OQ-2  | Is a meta-tag CSP acceptable for NFR-10 under GitHub Pages, or does full header CSP require D/E? | (V) | **Resolved: meta-tag CSP is acceptable.** Does not disqualify B/C.                                                    |
| OQ-3  | Is an NFR-9 access-log equivalent required, or is it retired as AWS-specific?                    | (V) | **Resolved: NFR-9 is retired.** No logging-equivalent requirement; does not disqualify B/C.                           |
| OQ-4  | Is `cdk destroy` sufficient given `RemovalPolicy.RETAIN` on S3/Secrets Manager?                  | (E) | Deferred to Solution/implementation (explicit manual deletion step needed for retained resources).                    |
| OQ-5  | Does the `docs-operational-graph.sqlite` WASM fetch path need a `base`-aware fix for Option B?   | (E) | Deferred to Solution/implementation.                                                                                  |
| OQ-6  | Does Option B's path prefix affect giscus's pathname-based discussion mapping?                   | (E) | Deferred to Solution/implementation.                                                                                  |
| OQ-7  | What's the tracked action/date for the repo going public?                                        | (E) | Deferred — tracked as a dependency, not yet scheduled.                                                                |
| OQ-8  | Who owns the pre-publish content/secrets review?                                                 | (E) | Deferred to Solution/Completion.                                                                                      |
| OQ-9  | Does CD replacement also mean deleting AWS-specific nx targets/actions?                          | (E) | Deferred to Solution (decommission plan).                                                                             |
| OQ-10 | Is a non-GitHub-native vendor (D/E) acceptable at all?                                           | (V) | **Resolved: GitHub-native only.** Options D (Cloudflare Pages) and E (Netlify) are excluded from the Evaluate matrix. |
| OQ-11 | Has build size/time been measured against GitHub Pages' limits?                                  | (E) | Deferred — unmeasured, low risk.                                                                                      |

---

## WAF Assessment

_Filled in during the Evaluate phase closing step and updated by any `patterns/waf-review.md` invocation._

<!-- Append dated blocks here. Each block added by Evaluate or the waf-review pattern. -->

### WAF — Evaluate — 2026-11-03

_Recommended option: Option B — GitHub Pages, project site._

| Pillar                 | Rating   | Headline                                                                                                                                                                                               |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operational Excellence | 🟢 Green | Deploy fully automated via existing GitHub Actions; no new AWS ops surface. Decommissioning the old AWS stacks is the one remaining one-time task.                                                     |
| Security               | 🟡 Amber | Basic-auth attack surface is gone by design, but CSP drops to a weaker meta-tag (accepted per Research OQ-2), and the pre-publish content/secrets review has no confirmed owner yet.                   |
| Reliability            | 🟢 Green | GitHub Pages is a mature platform; removing Lambda@Edge actually removes a moving part versus today. No new single point of failure.                                                                   |
| Performance Efficiency | 🟢 Green | Static-CDN performance comparable to CloudFront at this site's scale; build-size/queue limits unmeasured but low risk.                                                                                 |
| Cost Optimization      | 🟢 Green | Free for a public repo, zero billing surface — once the `RemovalPolicy.RETAIN` AWS resources (S3 bucket, Secrets Manager secret) are explicitly decommissioned, which `cdk destroy` alone will not do. |
| Sustainability         | 🟢 Green | No dedicated cloud resources to provision or retain; reuses infrastructure GitHub already runs for the repo.                                                                                           |

**P1 items (resolve before implementation):**

- The pre-publish content/secrets review (Frame's proposed EC, Research OQ-8) must have a confirmed owner and must complete before the repo's visibility changes to public — this action is irreversible once taken.
- AWS resources carrying `RemovalPolicy.RETAIN` (the S3 bucket and the Secrets Manager secret) are not destroyed by `cdk destroy` alone (Research OQ-4) — an explicit manual deletion/archive step must be planned in Solution, or they keep running (and costing) silently.

Full elaboration: `design/02 Evaluate.md`

### WAF — Solution — 2026-11-03

_Chosen approach: GitHub Pages, project site (`solution/Architecture.md`)._

| Pillar                 | Rating   | Headline                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operational Excellence | 🟢 Green | Deploy fully automated, concurrency-protected (`group: "pages"`); explicit, ordered decommission plan.                                                                                                                                                                                                                                                                                                                                           |
| Security               | 🟢 Green | Both Evaluate-stage P1s are now concretely scheduled and owned: the pre-publish content/secrets review gates the visibility flip (Efforts #1), and `RemovalPolicy.RETAIN` resources get an explicit forced delete (Efforts #10). The meta-tag CSP limitation and the NFR-6 (Discuss read-gating) consequence are both accepted and documented, not open gaps.                                                                                    |
| Reliability            | 🟡 Amber | The AWS rollback fallback this rating originally credited no longer exists — the developer confirmed decommissioning AWS before the public cutover (`solution/Architecture.md` Sequencing, corrected 2026-11-03), accepting that tradeoff. If GitHub Pages has a problem after cutover, recovery means fixing the build and re-running `deploy-pages`, or re-provisioning AWS from scratch — not falling back to a still-running AWS deployment. |
| Performance Efficiency | 🟢 Green | Unchanged from the Evaluate assessment — no new concern surfaced at Solution detail level.                                                                                                                                                                                                                                                                                                                                                       |
| Cost Optimization      | 🟢 Green | Decommission is now concrete (forced secret deletion, explicit bucket teardown) — no silent AWS cost leakage after cutover.                                                                                                                                                                                                                                                                                                                      |
| Sustainability         | 🟢 Green | Unchanged from the Evaluate assessment.                                                                                                                                                                                                                                                                                                                                                                                                          |

_Reliability was corrected from 🟢 to 🟡 on 2026-11-03 after the developer requested AWS decommission be sequenced before (not after) the public cutover, removing the rollback fallback this assessment originally credited — see `solution/Architecture.md`'s Sequencing section._

**P1 items:** none. Both P1s carried from the Evaluate-stage WAF assessment are resolved in this solution — see Security above.

**Quality gate (`patterns/design-quality-gate.md`): PASS.**

- Every framed EC/NFR constraint maps to a decision in `solution/Architecture.md`'s Decision Register or is explicitly unaffected (NFR-3, NFR-5, NFR-7 unchanged by this migration).
- Every material concern from the Solution-stage preliminary scan resolves into a selected artifact (`Architecture.md`/`Design.md`/`Stack.md`/`Efforts.md`) — none left unaddressed.
- Solution artifacts contain settled decisions only — verified by direct read of `solution/Architecture.md`; no rationale, rejected options, or open-question placeholders found (rationale correctly stays in `design/02 Evaluate.md`).
- `solution/Architecture.md` confirmed as the canonical E2E record; `Design.md`/`Stack.md`/`Efforts.md` add detail only, introduce no conflicting decision.
- All 6 Mermaid diagrams across the four solution artifacts were extracted and manually syntax-checked (the repo's `mmdc` CLI is non-functional in this environment — missing `puppeteer` dependency — so this was a syntax-oriented inspection per the quality gate's own fallback instruction, not a rendered check). All 6 passed: balanced brackets/quotes, valid flowchart/subgraph/classDef syntax.
- No relative markdown links found in the four solution artifacts (file references use inline code spans, not link syntax) — nothing to validate.

Full elaboration: `solution/Architecture.md`, `solution/Design.md`, `solution/Stack.md`, `solution/Efforts.md`

---

## Gate

- Approver: Anton Merkulov
- Draft MR: — _(skipped — self-approved directly, no PR opened, per developer request)_
- Approved: 2026-11-03
- Decline reason: — _(not declined)_

---

## Efforts

| Date       | Phase    | Notes                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-03 | Frame    | 3 known requirements, 5 proposed requirements accepted                                                                                                                                                                                                                                                                                                                                                        |
| 2026-11-03 | Research | @architect returned 5 options (Minimal AWS, GitHub Pages project site, GitHub Pages custom domain, Cloudflare Pages, Netlify); developer confirmed set complete; resolved 3 of 3 Viability OQs (meta-tag CSP OK, NFR-9 retired, GitHub-native only — D/E excluded)                                                                                                                                            |
| 2026-11-03 | Evaluate | Recommended Option B — GitHub Pages, project site; WAF: 5 Green, 1 Amber (Security); 2 P1 items (pre-publish content/secrets review owner, RETAIN-resource decommission)                                                                                                                                                                                                                                      |
| 2026-11-03 | Solution | Selected artifacts written (Architecture/Design/Stack/Efforts); architect review found 5 mechanical gaps, all auto-applied; WAF: 6/6 Green, 0 P1 items; quality gate: pass; WBS consolidated to 6 items (infra retirement split out as its own step) with developer estimates, total 8h                                                                                                                       |
| 2026-11-03 | Publish  | MR approved by Anton Merkulov (self-approved, no MR opened); 8 HLD docs updated + 2 deleted (Infrastructure.md, Auth.md) under `docs/Target Architecture (HLD)/v1/`; architect review clean after 1 fix round (3 stale cross-references); mid-flight correction: AWS decommission now sequenced before (not after) public cutover per developer request, Solution WAF Reliability corrected 🟢→🟡 accordingly |

---

## Implementation Tickets

_Filled in during Completion after implementation tickets are created._

| Ticket | Summary | Tracker |
| ------ | ------- | ------- |
