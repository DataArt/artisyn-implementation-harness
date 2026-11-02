---
id: 25c349bd
---

# Documentation Structure

_The three-tier model: what each tier is for and what lives where._

---

## Mental model

```
docs/
  Target Architecture (HLD)/   ← WHY and WHAT we are designing toward (the platform)
  System Architecture (LLD)/   ← WHAT is currently built and HOW it works
  Engineering Guide/           ← HOW to operate and develop
  Stories/                     ← Working folder (per-ticket, transient)
  Harness/                     ← The harness's own self-description — not a project-knowledge tier
```

| Tier                          | Nature                       | Answers                                                             | Length target                        |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| **Target Architecture (HLD)** | Aspirational — design intent | Why is the platform designed this way? What are we building toward? | < 80 lines per doc                   |
| **System Architecture (LLD)** | Descriptive — current state  | How does this actually work today? What are the component details?  | < 120 lines per doc                  |
| **Engineering Guide**         | Procedural — how to operate  | How do I set up, deploy, debug? What are the team conventions?      | < 150 lines per doc                  |
| **Stories**                   | Transient — delivery process | What did we decide, why, and what was built?                        | No limit — archived after completion |

→ For how docs are produced and graduate to their permanent tier, see `Lifecycles/05 Documents Flow.md`.
→ For the certainty principle (HLD/LLD contain only settled outcomes), see `01 Principles.md`.
→ For the required semantic coverage of each doc type, see `03 HLD Intent.md`, `04 LLD Intent.md` and `05 NFR Intent.md`.
→ For the harness itself — package, skills, agents — see `docs/Harness/`.

---

## Structure per tier

**Target Architecture (HLD):**

```
docs/Target Architecture (HLD)/
  README.md                          ← router: "Active version: <v>" (see format below)
  <Version>/
    System Overview.md               ← container list, data flows (Mermaid), tech stack
    System Sizing.md                 ← capacity targets, scale assumptions, growth envelope
    Containers/
      <Name>.md                      ← one file per container (no numeric prefix)
    Non-Functional Concerns/
      Requirements.md                ← NFR targets
      <Concern>.md                   ← one file per WAF pillar (optional but recommended)
  WAR/                               ← audit snapshots, shared across versions
    <Version>/
      <YYYY-MM-DD>-<audit>.md
```

`README.md` format — router only, no content:

```markdown
# Target Architecture

**Active version:** [<Version>](./<Version>/System Overview.md)

| Version | Status     | Notes                  |
| ------- | ---------- | ---------------------- |
| <v2>    | Active     | <one-line description> |
| <v1>    | Superseded | <one-line description> |
```

No numeric prefixes inside a version. The four entries have fixed names — prefixes add noise without value. `System Sizing.md` is required, not optional.

**System Architecture (LLD):**

```
docs/System Architecture (LLD)/
  README.md                          ← container folder index
  <container>/
    00. Overview.md                  ← responsibilities, key decisions
    01. Data Flow.md                 ← sequence diagrams, integration patterns
    ...
  where-we-are/                      ← dated gap report snapshots
```

**LLD mirrors HLD.** Container names in LLD folders match HLD container names exactly. A gap between HLD containers and LLD folders is a delivery gap — by design, not an error.

**Engineering Guide:** numbered articles (`NN Title Case.md`). Operational and procedural content only — no architecture.

**Stories:** per-ticket working folders, archived after `/dev document` completes. Not permanent reference docs.

---

## App README scope

A local dev quickstart only: what the app does, how to run it locally, links to HLD + LLD. If a README exceeds one page, something is in the wrong place — move it to `docs/`.
