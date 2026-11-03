---
id: bb22babb
purpose: Landing page for the Harness product-context docs area, orienting readers to what the Artisyn Implementation Harness is and where its sections live
keywords: [harness, overview, navigation, index]
---

# Harness

_Known:_ the Artisyn Implementation Harness is a structured workflow system layered on an AI coding assistant. Instead of prompting the assistant ad-hoc, work runs through specialised, lifecycle-aware agents governed by encoded conventions (skills) and feedback loops (reflections → skill library). It gives three things: **repeatability** (the same lifecycle steps run every ticket), **convergence** (conventions discovered on one ticket become skills inherited by the next), and **architecture coherence** (planning is audited against target architecture before code is written).

This repo is the harness's canonical source — it runs its own development through the harness, and the harness itself is portable: `.canonical-implementation-harness/` is the self-contained package that instantiates it in a new project, released as a versioned ZIP under `releases/harness-bootstrap/` and installed by pointing an AI assistant at `/harness-bootstrap launch`.

_Placeholder:_ a fuller narrative (why it exists, what problem it solves, how it compares to prompting ad-hoc) belongs here — see [00 The Story](<./00 The Story/index.md>) for the longer-form version of that argument in the meantime.

## Sections

| Section                                                   | Holds                                                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [00 The Story](<./00 The Story/index.md>)                 | The why behind the platform — the industry-wide story and the mindset shift adopting it requires  |
| [01 Explore](<./01 Explore/index.md>)                     | A browsable tour of the harness's agents, skills, and lifecycles                                  |
| [02 Quick Start](<./02 Quick Start/index.md>)             | How to bring the harness into a project                                                           |
| [03 Lifecycles](<./03 Lifecycles/00 Overview.md>)         | The four lifecycles (Dev, Design, Skill, Architecture) that structure all work                    |
| [04 Adoption](<./04 Adoption/00 Adoption Path.md>)        | Pre-Sales → Discovery → Development → Operate → Improve — the full adoption path                  |
| [05 Principles](<./05 Principles/index.md>)               | The beliefs the harness is built on                                                               |
| [06 Roadmap](<./06 Roadmap/index.md>)                     | Where the harness itself is headed                                                                |
| [07 Operational Graph](<./07 Operational Graph/index.md>) | The deterministic doc-tier operational graph — node/edge model and lifecycle wiring               |
| [08 Security Scan](<./08 Security Scan/index.md>)         | Dated InfoSec security-scan reports against this repo's own skills, agents, and MCP configuration |

## The package

`.canonical-implementation-harness/` lives outside `docs/`, so it's naturally not part of this VitePress site. Browse it on GitHub or in a checkout; [Explore](<./01 Explore/index.md>) is meant to eventually surface it here in a site-safe form.
