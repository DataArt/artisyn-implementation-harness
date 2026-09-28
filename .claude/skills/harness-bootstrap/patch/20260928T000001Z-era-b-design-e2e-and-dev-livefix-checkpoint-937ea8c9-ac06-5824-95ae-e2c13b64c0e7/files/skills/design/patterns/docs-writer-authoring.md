# Pattern: Docs-Writer Authoring (Design)

Applies whenever a design-lifecycle skill is about to write or update a design artifact on disk — `design/00 Frame.md`, `design/01 Research*.md`, `design/02 Evaluate*.md`, any `solution/*.md` file, or a content-bearing append to `design/Report.md` (e.g. `patterns/waf-review.md`'s WAF Assessment block). Does not apply to `design/Report.md`'s routine phase-tracker/Efforts-table bookkeeping in the do→report→commit pattern — that's mechanical state tracking, not authored documentation content.

## The rule

**Never write the artifact file directly.** Delegate the actual authoring to `@docs-writer`. The orchestrating skill still does all the thinking — framing the problem, running the OQ triage, building the tradeoff matrix, deciding the recommendation — but the act of rendering that content to disk as a `.md` file goes through `@docs-writer`, not a direct `Write`/`Edit` call from the orchestrator.

## Why delegate a file the orchestrator already knows how to write

`@docs-writer` enforces conventions the orchestrator does not reliably apply on every write: the certainty principle (resolved facts vs. open questions are never blurred), diagram-first format with correctly `classDef`-styled colored Mermaid (no default-grey diagrams), and DRY across sibling documents. Writing these files inline, phase after phase, drifts from those conventions over a long session. Routing every design-artifact write through one specialist keeps them consistent regardless of which phase or how many phases deep the session is.

## How to apply

1. Assemble the full content for the artifact yourself first — this pattern does not change _what_ goes in the file, only _who_ performs the write. Have the target path, the template to follow (e.g. `.claude/skills/design/templates/frame.md`), and the drafted content (problem statement, options, matrix, recommendation, etc.) ready.
2. Delegate to `@docs-writer` with: the target file path, the template file path, the drafted content/decisions to render, and an explicit instruction to apply the certainty principle and diagram-first Mermaid conventions.
   For sections destined for architecture documentation, also provide the relevant
   Engineering Guide intents and require them to be applied at the target tier:
   `docs/Engineering Guide/Documentation/03 HLD Intent.md` for HLD/container
   content, `04 LLD Intent.md` for LLD/component content, and `05 NFR Intent.md`
   for NFR requirements and acceptance evidence. Read the applicable intent before
   drafting; keep HLD, LLD and NFR responsibilities separate, link authoritative
   sources, and do not duplicate or weaken their required coverage.
3. Once `@docs-writer` confirms the file is written, proceed to the write-confirm pattern (`.claude/skills/design/patterns/write-confirm.md`) exactly as before — the developer still reviews and confirms in their IDE.

## Why

Design sessions produce many artifacts across many phases, each written by whichever phase skill happens to be running. Without a single authoring owner, doc quality and convention adherence (certainty principle, colored Mermaid, DRY) drift phase-to-phase and session-to-session. `@docs-writer` already owns this responsibility for published HLD/LLD content (`design-publish` Step 3) — extending that ownership to every design-lifecycle artifact, not just the final published output, closes the gap where working-draft docs were the one place conventions weren't enforced.
