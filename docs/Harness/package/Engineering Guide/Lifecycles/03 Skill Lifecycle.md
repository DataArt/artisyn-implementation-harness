# Skill Lifecycle — Reflect → Triage → New → Promote

_Grows the shared convention library from real development experience._

---

## Intent

The Skill lifecycle is the harness's improvement mechanism. Each surprise during a ticket is a potential skill. Reflect captures it as a raw note; Triage clusters notes into draft skills; Promote graduates validated drafts into the active library.

Without this loop, the same conventions get re-discovered every ticket. With it, conventions accumulate.

---

## When to use it

- **Reflect** — after any task where something surprised you: an approach that didn't work, a pattern you had to figure out, a convention you had to invent. Run it immediately; the memory fades quickly.
- **Triage** — after 2–4 pending reflections. Patterns need surface area to emerge from; triaging a single reflection produces weak drafts.
- **New** — when you know exactly what convention to encode without the reflect → triage path.
- **Promote** — after a draft has been live and applied for ~1 week without issues.

## When NOT to use it

Do not reflect on outcomes that are obvious from reading the code. A skill encodes what a future developer would need to re-discover — if it is self-evident, it does not belong.

---

## Phases

| Step        | Command                       | What it produces                                                    |
| ----------- | ----------------------------- | ------------------------------------------------------------------- |
| **Reflect** | `/skill-reflect <brain-dump>` | Structured reflection in `.claude/reflections/` (or equivalent)     |
| **Triage**  | `/skill-triage`               | Draft skills in `skills/drafts/` clustered from pending reflections |
| **New**     | `/skill-new <description>`    | Single draft skill directly (bypasses reflect → triage)             |
| **Promote** | `/skill-promote [draft-name]` | Draft graduated to active skill location; registered in AGENTS.md   |

---

## Invariants

**Reflect:** A one-sentence brain-dump is enough — the skill structures it. Flag `skill_candidate: yes` if the insight is repeatable and non-obvious. Never discard a reflection without saving.

**Triage:** Cluster reflections by theme. A draft emerges from a cluster, not a single data point. Report how many pending reflections remain after triage.

**New:** Same structure as a reflected + triaged skill: Rule → Why → How to apply. Under 40 lines.

**Promote:** Register the promoted skill in AGENTS.md and any skill index. Remove the draft once promoted — do not leave stale copies.

---

## What makes a good skill

A repeatable convention that cannot be inferred from the code alone — especially one discovered by getting it wrong first. If a future developer would need to re-discover it, it belongs in a skill. If it is obvious from reading the code, it does not.

---

## Cadence

```
/skill-reflect (×2–4) → /skill-triage → live for ~1 week → /skill-promote
```
