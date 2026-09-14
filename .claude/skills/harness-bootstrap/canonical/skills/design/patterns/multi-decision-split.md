---
name: Multi-Decision Split Pattern
description: Default file-splitting policy when a design's Frame implies more than one independent decision
type: reference
---

# Multi-Decision Split Pattern

Some design tickets bundle more than one independent decision under a single epic (e.g. a security epic that bundles a triage framework, a tooling stack, and a timing decision). Treating these as a single option set produces an unwieldy EC × Options matrix and blurs which open questions and assumptions belong to which decision.

## Detecting a multi-decision Frame

While drafting `design/00 Frame.md`, check whether the Problem/Requirements imply two or more decisions that could each stand alone — each has its own option set, its own tradeoffs, and could in principle be approved or reiterated independently of the others. If so, apply this pattern from Research onward. Confirm the decision breakdown with the developer before starting Research.

## Default policy

| Artifact                                   | Multi-decision handling                                                                                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design/01 Research.md`                    | One file per decision — `design/01 Research - {Decision}.md`                                                                                                                 |
| `design/02 Evaluate.md`                    | One file per decision — `design/02 Evaluate - {Decision}.md`, each with its own matrix, tradeoffs, and recommendation                                                        |
| `solution/Design.md`                       | One file per decision — `solution/Design - {Decision}.md`                                                                                                                    |
| `solution/Architecture.md`                 | **Single, integrated file** — the converged system view, one System Context / Component Design / Flow set per decision (only where it adds value), not one file per decision |
| `solution/Stack.md`, `solution/Efforts.md` | Single file — Efforts already spans all decisions as one WBS                                                                                                                 |

Loop the Research → Evaluate → Design steps once per decision, using the same skill steps each time. Track each decision's OQs and assumptions separately in `design/Report.md`'s Assumptions table (note which decision each row belongs to).

## Why

Architecture.md is the converged deliverable — a reader needs one picture of how the decisions fit together as a system, so it stays single. Research, Evaluate, and Design are option-evaluation and per-decision-detail artifacts — bundling them blurs scope and produces an unreadable matrix. This pattern tends to get rediscovered reactively, mid-session, on the first multi-decision epic a project runs — encoding it here means it doesn't need rediscovering every time.
