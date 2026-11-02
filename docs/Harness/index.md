# Harness

_Known:_ the Artisyn Harness is a structured workflow system layered on an AI coding assistant. Instead of prompting the assistant ad-hoc, work runs through specialised, lifecycle-aware agents governed by encoded conventions (skills) and feedback loops (reflections → skill library). It gives three things: **repeatability** (the same lifecycle steps run every ticket), **convergence** (conventions discovered on one ticket become skills inherited by the next), and **architecture coherence** (planning is audited against target architecture before code is written).

This repo is the harness's canonical source — it runs its own development through the harness, and the harness itself is portable: `docs/Harness/package/` is the self-contained package that instantiates it in a new project (copy the folder, point an AI assistant at `01 Bootstrap.md`).

_Placeholder:_ a fuller narrative (why it exists, what problem it solves, how it compares to prompting ad-hoc) belongs here — see `docs/The Story/` for the longer-form version of that argument in the meantime.

## Sections

| Section                                               | Holds                                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| [01 Explore](<./01 Explore/index.md>)                 | A browsable tour of the harness's agents, skills, and lifecycles                  |
| [02 Quick Start](<./02 Quick Start/index.md>)         | How to bring the harness into a project                                           |
| [03 Lifecycles](<./03 Lifecycles/00 Overview.md>)     | The four lifecycles (Dev, Design, Skill, Architecture) that structure all work    |
| [04 Adoption](<./04 Adoption/00 Adoption Path.md>)    | Pre-Sales → Discovery → Development → Operate → Improve — the full adoption path  |
| [05 Principles](<./05 Principles/index.md>)           | The beliefs the harness is built on                                               |
| [06 Roadmap](<./06 Roadmap/index.md>)                 | Where the harness itself is headed                                                |
| [07 Knowledge Graph](<./07 Knowledge Graph/index.md>) | The deterministic doc-tier knowledge graph — node/edge model and lifecycle wiring |

## The package

`docs/Harness/package/` is not rendered in this site — its `{{PLACEHOLDER}}` template syntax collides with Vue's `{{ }}` interpolation, so it's excluded from the build (`srcExclude` in `apps/docs-web/.vitepress/config.ts`). Browse it on GitHub or in a checkout; [Explore](<./01 Explore/index.md>) is meant to eventually surface it here in a site-safe form.
