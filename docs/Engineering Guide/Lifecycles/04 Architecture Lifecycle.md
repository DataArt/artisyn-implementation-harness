---
id: ec3e9fe7
---

# Architecture Lifecycle — Audit Commands

_Periodic health checks that surface gaps between design, implementation, and documentation._

---

## Intent

The architecture lifecycle runs outside individual tickets. Its job is to keep the team's view of the system accurate: Is the Target Architecture sound? Is the codebase aligned with it? Are the gaps documented?

The output is a dated snapshot that becomes the project's health record over time.

---

## When to use it

| Command               | When                                                                       |
| --------------------- | -------------------------------------------------------------------------- |
| `/where-we-are`       | After a sprint; before a planning session; when "where are we?" is unclear |
| `/war design`         | After major HLD updates; before a design gate for a large feature          |
| `/war implementation` | Quarterly; before a major release; when architectural drift is suspected   |

---

## Commands

| Command                         | What it does                                                                      | Output                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `/where-we-are [VERSION]`       | Delivery gap report: designed vs implemented vs documented, per container         | `docs/System Architecture (LLD)/where-we-are/<YYYY-MM-DD>-gap-report.md`                   |
| `/war design [VERSION]`         | WAF assessment of the Target Architecture documents — is the design itself sound? | `docs/Target Architecture (HLD)/WAR/<active version>/<YYYY-MM-DD>-design-audit.md`         |
| `/war implementation [VERSION]` | WAF code audit — does the implementation match the Target Architecture?           | `docs/Target Architecture (HLD)/WAR/<active version>/<YYYY-MM-DD>-implementation-audit.md` |

---

## Invariants

**`/where-we-are`:**

- Read `docs/Target Architecture (HLD)/README.md` first to find the active version. Do not hardcode a version name.
- Assess three dimensions per container: Designed (exists in HLD), Implemented (code exists), Documented (LLD folder populated). All three checked independently.
- Do not judge LLD quality — only presence. A folder with one file counts as "present".
- Delegate the code scan to the Architect agent — do not scan inline.
- Present the full gap matrix before asking to save. Never auto-save.

**`/war design`:**

- Assess HLD documents only — not the codebase.
- All WAF pillars must be addressed. Present findings before saving.
- Save to `WAR/<active version>/` — create the folder if it does not exist. Never overwrite a previous report.

**`/war implementation`:**

- Delegate code scan to the Architect agent.
- All WAF pillars must be addressed. Flag any implementation patterns that deviate from HLD without a recorded justification.
- Present findings before saving. Save to `WAR/<active version>/` — create the folder if it does not exist. Never overwrite a previous report.

---

## The audit loop

```
/where-we-are → gap tickets → /dev (fill gaps) → /war implementation → verify alignment
```

Gap tickets produced by audit commands feed back into the Dev lifecycle as regular tickets.
