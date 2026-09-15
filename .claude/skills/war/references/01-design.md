# Design audit

This reference audits the **Target Architecture documents** for a given version against the AWS Well-Architected Framework pillars. It assesses whether the architecture _as designed and documented_ is sound — not whether the code implements it (use `references/02-implementation.md` for that).

The subject is `docs/Target Architecture (HLD)/{VERSION}/` — container docs, cross-cutting docs, NFRs, sizing. For implementation code audit, use `/war implementation [VERSION]`. For a single story's design review, the WAF assessment runs inside the `/design` lifecycle itself (`patterns/waf-review.md`, applied from Solution's gate step) rather than as a standalone command.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

## Step 1 — Determine scope

Apply `.claude/skills/war/patterns/scope-resolution.md` (fill the placeholder as "Design").

## Step 2 — Read Target Architecture documents

Read all of the following for the target version. Do not ask the developer — read them directly:

**Overview & NFRs:**

- `System Overview.md`
- `Non-Functional Concerns/Requirements.md`
- `System Sizing.md`

**Containers (`Containers/`):** read all files.

**Non-Functional Concerns (`Non-Functional Concerns/`):** read all files.

Do not summarise to the developer. Proceed to Step 3.

## Step 3 — Assess each pillar

Using the architecture documents read in Step 2, assess each pillar in scope. The question for each pillar is: **does the architecture design adequately address this concern?** Flag gaps in the design itself — missing decisions, under-specified failure modes, unresolved trade-offs, or internal contradictions between docs.

### Pillar definitions

| Pillar                 | Key questions                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Operational Excellence | Can operations be run, monitored, and improved without excessive manual effort? Is deployment automated and observable? |
| Security               | Is data protected in transit and at rest? Are credentials never hardcoded and access least-privilege?                   |
| Reliability            | Does the design recover from failure? Are there single points of failure or unhandled dependencies?                     |
| Performance Efficiency | Does the design meet expected latency/throughput needs efficiently?                                                     |
| Cost Optimization      | Is spend proportional to value, with no unnecessary over-provisioning?                                                  |
| Sustainability         | Does the design minimize wasted compute, storage, and network resources?                                                |

### RAG rating

| Rating   | Meaning                                                                                     |
| -------- | ------------------------------------------------------------------------------------------- |
| 🟢 Green | Design adequately addresses this pillar — decisions made, documented, internally consistent |
| 🟡 Amber | Partially addressed — some gaps, open questions, or under-specified areas remain            |
| 🔴 Red   | Not addressed — material gap in the design that must be resolved                            |

### Output per pillar

```
### <Pillar name> — <RAG emoji + colour>

**Strengths**
- What the design gets right for this pillar (reference specific doc/section)

**Gaps**
- Specific gaps or unresolved decisions (reference the doc where the gap was found)

**Recommendations**
- P1: resolve before implementation begins
- P2: address in next design iteration
- P3: backlog / nice-to-have
```

## Step 4 — Present, then save

Apply `.claude/skills/war/patterns/present-and-save.md` (fill the placeholders as "Design"/"design"), using `.claude/skills/war/templates/design-report.md` as the file structure. Replace all placeholders and fill in all audit content.

## Step 5 — Confirm and close

After saving:

> "Design audit saved to `docs/Target Architecture (HLD)/WAR/{VERSION}/{date}-design-audit.md`.
>
> To re-run: `/war design`
> To scope to one pillar: `/war design {pillar}` (e.g. `/war design Security`)
> To audit the implementation against this design: `/war implementation`"
