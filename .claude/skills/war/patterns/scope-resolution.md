---
name: Scope Resolution
description: Resolves the target version and pillar scope for a WAF audit, shared by both the design and implementation audit references. Never hardcode a version.
type: pattern
---

Read `docs/Target Architecture (HLD)/README.md` to find the **current active version**. Use that version for all paths — do not hardcode a version.

Parse `$ARGUMENTS`:

- If a version is given (e.g. `MVP`, `V1`): use that version instead of the active version
- If a pillar is specified (e.g. `MVP Security`, `RE`): scope the audit to that pillar only
- If no argument: use the active version, all pillars

Present to the developer:

> "Running Well-Architected {Design | Code} Audit for **\<VERSION\>** — \<pillar scope or 'all pillars'\>. Confirm? (**yes** / **no**)"

**Stop and wait** for confirmation.
