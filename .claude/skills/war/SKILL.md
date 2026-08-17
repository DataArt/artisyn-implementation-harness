---
name: war
metadata:
  version: 0.3.1
description: Well-Architected Review router (/war). Prompts design vs implementation, delegates to /war-design or /war-implementation.
---

The developer wants to run a Well-Architected Review. Here is their input:

---

## $ARGUMENTS

---

## Route

Parse `$ARGUMENTS`:

- If it contains `design` or `d`: run `/war-design $ARGUMENTS`
- If it contains `impl` or `i` or `code`: run `/war-implementation $ARGUMENTS`
- If it contains a version only (e.g. `MVP`, `V1`): present the options below and ask which audit to run
- If no argument: present the options below and ask which audit to run

Present:

> "Which audit would you like to run?
>
> - **A — Design audit** (`/war-design`): reviews Target Architecture documents against WAF pillars. Use this to validate the design before implementation begins, or to assess an existing design version.
>
> - **B — Implementation audit** (`/war-implementation`): reviews the codebase against the Target Architecture. Use this to find gaps between design intent and what was built.
>
> (**A** / **B** / **both**)"

Wait for confirmation. Then follow the selected skill exactly.

---

## Companion

For a delivery gap view across all three dimensions (designed / implemented / documented):

```
/where-we-are
```
