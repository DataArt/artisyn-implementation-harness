# Content and demo storyboard

## Source-aligned product facts

The existing Artisyn README describes:

- an **AI-first engineering lifecycle system** layered on an AI coding assistant;
- specialized, lifecycle-aware agents, encoded engineering conventions (skills), and reflections that inform a skill library;
- a portable `.canonical-implementation-harness/` package;
- `/harness-bootstrap launch`, `/design TKT-XXX <topic>`, `/dev TKT-XXX <task>`;
- architectural coherence, repeatability, convergence, and documentation consistency as intended benefits.

All product positioning in this handoff was derived from those descriptions; it is not independent verification of product behavior.

## Copy used in the starter

**Hero:** AI engineering. Structured by design.

**Subheading:** A portable implementation harness that guides coding assistants through defined lifecycles, applies architectural conventions, and carries learning into the next task.

**CTA:** Explore the lifecycle / View on GitHub.

**Interactive section:** Explore the harness in action. Choose `/design` or `/dev`; click through phases and inspect representative activity and artifacts.

**Core concepts:** Structured lifecycles / Agents and skills / Architecture awareness / Continuous learning.

**Model:** Engineer → AI assistant → Harness lifecycle → Knowledge base.

**Start:** `/harness-bootstrap launch` (command demonstrated in the README).

## Illustration boundaries

The detailed 5-step `/design` and `/dev` storyboard included in `src/data/lifecycles.ts` is **an illustrative model**. It is not a specification of actual phase IDs, mandatory approval gates, guaranteed artifact outputs, exact context checks, or backend behavior. Do not represent it as a live execution. Actual canonical workflows may have more phases, different review rules, and different outputs. Resolve this against the repository's detailed `docs/Harness/` before making it an authoritative walkthrough.

## UX interactions

- `/design` and `/dev` mode selection resets to phase 1.
- Users can jump to any phase through the step list, go Back/Next, or Replay when finished.
- All progress is local state and deterministic. No simulated typing that could be mistaken for an active server.
- Status is explicitly **SIMULATED RUN** and **Preview**.
- Copy button copies a literal bootstrap command; GitHub/docs links require configuration before public launch.
