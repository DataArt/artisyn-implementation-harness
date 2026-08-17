---
name: war-implementation
metadata:
  version: 0.3.1
description: WAR code audit (/war-implementation). @architect finds gaps between NX implementation and Target Architecture. Does NOT audit design docs — use /war-design.
---

The developer wants to run a Well-Architected Review (code audit) of the platform implementation. Here is their input:

---

## $ARGUMENTS

---

> ⚠️ Follow every step in order. Do not skip, summarize, or improvise. If you are unsure, ask before deviating.

---

## Overview

This skill audits the **NX monorepo implementation** against the Target Architecture. It delegates research to `@architect` (read-only), presents findings in the console for review, then saves a dated snapshot.

The subject is code and infrastructure — not design artifacts. For design artifact review use `/design-review {TICKET}`. For version-level design review across all stories, use `/war-design [VERSION]`.

---

## Step 1 — Determine scope

Read `docs/Target Architecture (HLD)/README.md` to find the **current active version**. Use that version for all architecture doc paths — do not hardcode a version.

Parse `$ARGUMENTS`:

- If a version is given (e.g. `MVP`, `V1`): use that version instead of the active version
- If a pillar is specified (e.g. `MVP Security`, `RE`): scope the audit to that pillar only
- If no argument: use the active version, all pillars

Present to the developer:

> "Running Well-Architected Code Audit for **\<VERSION\>** — \<pillar scope or 'all pillars'\>. Confirm? (**yes** / **no**)"

Wait for confirmation.

---

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

---

## Step 3 — Delegate code audit to @architect

Invoke `@architect` with the following research prompt (do not deviate from this pattern):

> "Read the NX monorepo under `apps/` and `libs/`. For each app, identify:
>
> 1. What the app does (inferred from code and config)
> 2. What it connects to (dependencies, external calls, env vars)
> 3. Any patterns that appear to violate or diverge from the following architecture intent:
>
> <paste the relevant architecture context extracted in Step 2>
>
> Return your findings as a structured list. Do not write files. Do not make changes."

`@architect` returns findings as text. Do not let it write files autonomously.

---

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

---

## Step 5 — Present findings in console

Present the full audit in the console. Do NOT write to file yet.

After presenting, say:

> "Audit complete. Any corrections before I save? (**yes** to save as-is / **no** to discuss changes)"

Wait for confirmation. If the developer requests changes, apply them and re-present the affected sections. Repeat until approved.

---

## Step 6 — Save the audit

Output path:

```
docs/Target Architecture (HLD)/WAR/{VERSION}/{YYYY-MM-DD}-implementation-audit.md
```

Create the `WAR/{VERSION}/` directory if it does not exist.

Use `.claude/skills/war-implementation/report-template.md` as the file structure. Replace all `{{VERSION}}`, `{{YYYY-MM-DD}}`, and `{{all pillars | <pillar name>}}` placeholders with actual values, and fill in all audit content.

---

## Step 7 — Confirm and close

After saving:

> "Audit saved to `docs/Target Architecture (HLD)/WAR/{VERSION}/{date}-implementation-audit.md`.
>
> To re-run after implementation changes: `/war-implementation`
> To scope to one pillar: `/war-implementation {pillar}` (e.g. `/war-implementation Security`)
> To review design artifacts for this version: `/war-design {VERSION}`"
