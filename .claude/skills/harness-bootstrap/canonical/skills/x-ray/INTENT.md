---
skill: x-ray
output: {{provider:skills_root}}/x-ray/SKILL.md
---

## Purpose

Review one resolved diff through independent correctness, component-convention and
architecture passes. Optional browser verification and local HTML output preserve
explicit opt-in and never imply consent to publish externally.

## Substitutions

| Placeholder                | Evidence                                 | Meaning                                                     |
| -------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `{{DEFAULT_BRANCH}}`       | Repository configuration                 | Actual fallback branch                                      |
| `{{LOCAL_BROWSER_ORIGIN}}` | Project run configuration                | Confirmed local origin for optional browser checks          |
| `{{LOCAL_SERVE_COMMANDS}}` | Actual component build/run configuration | Commands for the developer to start relevant local services |

## Adaptation

- Derive component specialist routing from the root instruction file's Agents table
  and installed role scopes. Each implementation specialist is an instance of the
  canonical layer template with its own evidence-backed component responsibilities.
  Do not introduce fixed backend/frontend/data agent slots, names or path rows.
- If there is no browser-observable behavior, remove the browser step and its unused
  configuration tokens. Otherwise retain explicit opt-in and the confirmed origin limit.
- Install the selected runtime/review.md, browser.md and delegation.md procedures.
  Native review availability is checked at runtime; never assume a named platform
  skill exists. A missing correctness pass requires human review or an explicit skip.
- If interactive-demo is absent, use the explicit local HTML fallback. Preserve the
  real findings and missing-pass status, and never publish without a separate request.

## Verify

- [ ] All component owners exist and agree with the root Agents table; unmatched scope is explicit.
- [ ] Correctness coverage is independent of conventions and architecture; unavailable is not clean.
- [ ] Reviewer identity, evidence and any skip attribution survive into the report.
- [ ] Architecture trigger and existing human gates remain intact.
- [ ] Browser origin/run commands are verified, or the optional branch is omitted.
- [ ] Runtime procedures resolve and no installation-only INTENT is referenced at runtime.
