---
id: 7914ab7f
purpose: The approved term registry for project concepts that have more than one plausible name
keywords: [terminology, registry, one term per concept, docs-writer]
---

# Terminology

_The approved term for each project concept that has more than one plausible name._

---

## Why

A concept named three different ways across three documents reads as three concepts until a reader checks. This registry fixes one approved term per concept so `docs-writer` and every design artifact use the same word every time.

See `01 Principles.md`'s "One term per concept" rule in Manner — this file is that rule's data.

---

## How this fills up

- **At launch**, if this file has no rows yet, the orchestrator scans existing code identifiers, README/doc nouns, and confirmed Q&A domain language for recurring project-specific terms and seeds an initial set. Skipped if rows already exist — launch never overwrites an established registry.
- **During `/design`**, Solution Step 2 proposes a row for any domain term the solution coins that isn't here yet; `docs-writer` appends it as part of writing `solution/Architecture.md`.
- **Anywhere else**, add a row by hand the moment two documents start using different words for the same thing.

A term stays out of this table if it's standard English, a well-known industry term (HTTP, Lambda, CDK), or used exactly once — the registry is for project-specific concepts at risk of drifting, not a full glossary.

---

## Registry

| Term | Approved form | Forbidden synonyms | Definition | Introduced in |
| ---- | ------------- | ------------------ | ---------- | ------------- |
