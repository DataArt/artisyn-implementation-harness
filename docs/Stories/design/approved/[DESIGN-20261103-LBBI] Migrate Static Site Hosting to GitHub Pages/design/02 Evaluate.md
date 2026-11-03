---
id: 7c435590
purpose: 'Scores Options A/B/C against the Known ECs and tradeoff dimensions, and recommends Option B (GitHub Pages, project site) for the GitHub Pages migration'
keywords: [github-pages, hosting-migration, evaluate, recommendation, tradeoffs]
---

# DESIGN-20261103-LBBI: Migrate Static Site Hosting to GitHub Pages — Evaluate

_Produced by the 🏗 Evaluate phase. This is the judgment artifact. WAF assessment lives in `design/Report.md`._

Options D (Cloudflare Pages) and E (Netlify) from `design/01 Research.md` are excluded from this matrix — resolved at Research sign-off (OQ-10): a non-GitHub-native hosting vendor was ruled unacceptable. Only Options A, B, and C are evaluated below.

## Requirements × Options Matrix

Rows = evaluation criteria from `design/00 Frame.md` (functional requirements, NFRs, constraints). Columns = options from `design/01 Research.md`.
✅ satisfies · ⚠️ partially (see note) · ❌ does not satisfy

| Requirement                                          | Option A                                                                           | Option B                                                                                                        | Option C                                                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| EC1: Hosting moves off AWS to GitHub Pages           | ❌ stays on AWS/CloudFront+S3                                                      | ✅                                                                                                              | ✅                                                                                          |
| EC2: Basic-auth gate removed entirely                | ✅ (Auth container deleted in this option too)                                     | ✅                                                                                                              | ✅                                                                                          |
| EC3: AWS infra no longer provisioned/maintained      | ❌ DocsStack/CiStack still operated                                                | ✅                                                                                                              | ✅                                                                                          |
| Preserves NFR-10 (CSP) intent                        | ✅ real HTTP header via CloudFront ResponseHeadersPolicy, strongest option         | ⚠️ meta-tag only — no frame-ancestors/reporting; accepted as sufficient per Research OQ-2                       | ⚠️ same meta-tag limitation as B                                                            |
| No base-path/link-breakage risk                      | ✅ no change to serving path                                                       | ❌ requires `base: '/{repo}/'` fix + full asset/link audit (incl. the operational-graph SQLite WASM fetch path) | ✅ root-served, no `base` change needed                                                     |
| No new domain dependency                             | ✅ uses existing setup                                                             | ✅ no domain required                                                                                           | ❌ requires a domain to be owned/available and DNS configured                               |
| CD reuses the existing GitHub Actions build natively | ⚠️ keeps `nx affected --target=deploy` behind an AWS OIDC role — no simplification | ✅ native `configure-pages`/`deploy-pages` from the same workflow already building the site                     | ✅ same deploy mechanism as B, plus a one-time DNS/domain-verification step                 |
| Zero/near-zero hosting cost & billing surface        | ❌ keeps AWS CloudFront/S3 billing                                                 | ✅ free for a public repo                                                                                       | ⚠️ hosting itself is free; a domain carries its own recurring cost, external to this design |
| Migration/operational cutover risk                   | ✅ lowest — minimal change                                                         | ⚠️ `base`-path/link audit is the main risk surface                                                              | ⚠️ DNS cutover + domain-ownership dependency is the main risk surface                       |

## Tradeoffs

| Dimension              | Option A                                                                                                                                           | Option B                                                                                                            | Option C                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Operational Excellence | ⚠️ still requires CDK stack maintenance and AWS ops knowledge, even with auth complexity removed                                                   | ✅ deploy fully automated via the existing GitHub Actions workflow, zero AWS ops surface                            | ✅ same automation as B                                                                |
| Security               | ✅ CSP ships as a real HTTP header (strongest of the three); basic-auth attack surface already gone since the gate is removed regardless of option | ⚠️ CSP via meta-tag only — weaker (no `frame-ancestors`/reporting), though accepted as sufficient per Research OQ-2 | ⚠️ same meta-tag limitation as B                                                       |
| Reliability            | ✅ CloudFront/S3 proven, actually fewer moving parts than today (no Lambda@Edge)                                                                   | ✅ GitHub Pages is a mature, heavily used static-hosting platform                                                   | ✅ same as B, plus GitHub-managed Let's Encrypt TLS for the custom domain              |
| Performance Efficiency | ✅ CloudFront CDN, comparable latency to GitHub Pages at this site's scale                                                                         | ✅ comparable static-CDN performance for a docs site at this scale                                                  | ✅ same as B                                                                           |
| Cost Optimization      | ❌ does not eliminate the AWS billing/ops surface this design exists to shed — directly contradicts EC3                                            | ✅ free for a public repo, zero billing surface                                                                     | ⚠️ hosting is free; a domain's recurring cost is external to this design               |
| Sustainability         | ⚠️ running dedicated cloud infra for a job a free static host can do is not a minimal footprint, though CloudFront/S3 itself is efficient          | ✅ no dedicated cloud resources to provision or retain; reuses infra GitHub already runs                            | ✅ same as B                                                                           |
| Integration Complexity | ✅ least change, lowest integration risk                                                                                                           | ⚠️ requires the `base`-path fix and a link/asset audit before cutover                                               | ⚠️ avoids the `base`-path fix but adds a one-time DNS/domain-verification cutover step |
| Vendor Lock-in         | ❌ stays fully on AWS/CDK — the exact lock-in this design exists to reduce                                                                         | ✅ stays within the GitHub ecosystem already hosting the repo; no new vendor                                        | ✅ same as B; a domain is portable, not GitHub-specific lock-in                        |

## Recommendation

**Recommended option: Option B — GitHub Pages, project site**

Option A is disqualified outright: it fails EC1 and EC3, the two requirements the ticket states most directly (move off AWS, stop maintaining AWS infra) — it is retained in the matrix only as the baseline comparator Research required, not as a real candidate.

Between B and C, B is recommended because it has no unconfirmed external dependency: it satisfies every Known EC immediately, at the cost of one bounded, well-documented engineering task (the VitePress `base` path fix — this is a standard, officially-documented pattern for GitHub Pages project sites, not an open technical risk). Option C's only real advantage — avoiding that `base` fix and serving from a cleaner root URL — depends on a custom domain being available and wanted, which Research's OQ-1 left open and deferred; recommending C now would mean recommending a dependency this design cannot confirm. The tradeoffs table shows B and C are otherwise identical on every other dimension (security, reliability, performance, sustainability, vendor lock-in) — the only material difference between them is exactly this domain dependency.

This recommendation is falsifiable: if OQ-1 resolves with a domain confirmed available and desired before Solution/implementation begins, the recommendation should flip to Option C, since C then dominates B (same benefits, strictly less integration risk) with no remaining downside.

The accepted security tradeoff (meta-tag CSP, OQ-2) and the accepted retirement of NFR-9 access logging (OQ-3) apply equally to B and C and were resolved as acceptable at Research sign-off — they are not differentiators between B and C, and do not change this recommendation.

**Open questions to resolve before implementation:**

| #    | Question                                                                                                                                                       | Owner           | Impact if unresolved                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| OQ-1 | Is a custom domain available/desired for this site?                                                                                                            | Developer / org | Blocks flipping the recommendation from B to C; does not block implementing B itself                |
| OQ-4 | Is `cdk destroy` sufficient given `RemovalPolicy.RETAIN` on the S3 bucket and Secrets Manager secret, or is an explicit manual deletion/archive step required? | @infra          | Retained AWS resources keep running (and costing) silently after the CDK code is deleted            |
| OQ-5 | Does the `docs-operational-graph.sqlite` WASM fetch path (and any other hardcoded absolute URL) need a `base`-aware fix for Option B?                          | @web            | Blocks implementation — the Graph Explorer could break under the `/{repo}/` path if unresolved      |
| OQ-8 | Who owns the pre-publish content/secrets review, and does it block or run parallel to the hosting migration?                                                   | Developer       | Blocks safely flipping the repo to public — the precondition every option in this design depends on |
