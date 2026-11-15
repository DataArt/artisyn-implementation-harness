# Implementation audit

This reference audits the **implementation** ({{CODE_SCAN_TARGET}}) against the Target Architecture. It delegates research to `@architect` (read-only), presents findings in the console for review, then saves a dated snapshot.

The subject is code and infrastructure — not design artifacts. For design artifact review, the WAF assessment runs inside the `/design` lifecycle itself (`patterns/waf-review.md`, applied from Solution's gate step) rather than as a standalone command. For version-level design review across all stories, use `/war design [VERSION]`.

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

## Step 1 — Determine scope

Apply `.claude/skills/war/patterns/scope-resolution.md` (fill the placeholder as "Code").

## Step 2 — Read Target Architecture

Read the following docs for the target version. Do not ask the developer — read them directly:

- `System Overview.md`
- `Non-Functional Concerns/Requirements.md`
- `System Sizing.md`
- All files in `Containers/`
- All files in `Non-Functional Concerns/`

Extract per container:

- Stated responsibilities and boundaries
- Integration points (inputs/outputs)
- Technology choices
- Non-functional expectations (latency, availability, security posture)

Do not summarise to the developer. Proceed to Step 3.

## Step 3 — Delegate code audit to @architect

Invoke `@architect` with the following research prompt (do not deviate from this pattern):

> "Read {{CODE_SCAN_TARGET}}. For each {{BUILD_UNIT_LABEL}}, identify:
>
> 1. What the app does (inferred from code and config)
> 2. What it connects to (dependencies, external calls, env vars)
> 3. Any patterns that appear to violate or diverge from the following architecture intent:
>
> <paste the relevant architecture context extracted in Step 2>
>
> Return your findings as a structured list. Do not write files. Do not make changes."

`@architect` returns findings as text. Do not let it write files autonomously.

## Step 4 — Assess each pillar

Using the architecture docs (Step 2) and the architect's findings (Step 3), assess each pillar in scope.

### Pillar definitions

{{WAF_PILLARS_TABLE}}

### RAG rating

| Rating   | Meaning                                                             |
| -------- | ------------------------------------------------------------------- |
| 🟢 Green | Implementation matches architecture intent — no material gaps       |
| 🟡 Amber | Partially implemented — gaps exist but risk is bounded or mitigated |
| 🔴 Red   | Not implemented or diverges materially from architecture intent     |

### Output per pillar

```
### <Pillar name> — <RAG emoji + colour>

**Strengths**
- What the implementation gets right

**Gaps**
- Specific gaps, referencing the app/file/config where the divergence was found

**Recommendations**
- P1: address before production
- P2: address in next iteration
- P3: backlog
```

## Step 5 — Present, then save

Apply `.claude/skills/war/patterns/present-and-save.md` (fill the placeholders as "" / "implementation"), using `.claude/skills/war/templates/implementation-report.md` as the file structure. Replace all `{{VERSION}}`, `{{YYYY-MM-DD}}`, and `{{all pillars | <pillar name>}}` placeholders with actual values, and fill in all audit content.

## Step 6 — Confirm and close

After saving:

> "Audit saved to `docs/Target Architecture (HLD)/WAR/{VERSION}/{date}-implementation-audit.md`.
>
> To re-run after implementation changes: `/war implementation`
> To scope to one pillar: `/war implementation {pillar}` (e.g. `/war implementation Security`)
> To review design artifacts for this version: `/war design {VERSION}`"
