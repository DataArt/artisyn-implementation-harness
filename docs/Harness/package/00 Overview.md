# Harness Bootstrap — Overview

_What this harness is, why it exists, and how the pieces fit together._

**Package version:** 0.3.0 — the overall `docs/Harness/package/` package version. Bumped whenever any skill's `metadata.version` is bumped (see `skills/skill-authoring.md`, "Bootstrap template versioning") or a package file (`00 Overview.md`, `01 Bootstrap.md`, `02 Update.md`) changes. Same patch/minor/major rules apply.

_0.3.0 — added the Two-track design lifecycle scope (Q10b), `pattern-context-resolution.md`, and `02 Update.md` Stage 0 (Q&A gap check for bootstrap questions added after a project was already bootstrapped). `design-frame`'s own template bump is major (2.0.0 — retired `{{DESIGN_TARGET_SUBFOLDERS}}`/`{{DESIGN_CONTEXT_SOURCES}}`); scored minor at the package level because Q1–Q11 are unchanged and existing single-track deployments are unaffected until they opt into a sync._

---

## What it is

The AI harness is a structured workflow system layered on top of an AI coding assistant. Instead of prompting the assistant ad-hoc, the team runs the assistant as a set of specialised, lifecycle-aware agents governed by encoded conventions (skills) and feedback loops (reflections → skill library).

The harness provides three things:

1. **Repeatability** — the same lifecycle steps run every ticket; quality does not depend on remembering the right prompts
2. **Convergence** — conventions discovered during one ticket are encoded as skills and inherited by future tickets
3. **Architecture coherence** — planning audits the Target Architecture before any code is written; deviations must be justified and tracked

---

## Why it matters

| Problem                                        | Harness response                          |
| ---------------------------------------------- | ----------------------------------------- |
| AI forgets conventions between sessions        | Encoded in persistent skill files         |
| AI makes architecture decisions without review | Audit step before implementation          |
| No feedback loop from bugs or surprises        | Reflect → Triage → Promote cycle          |
| Documentation lags implementation              | Document phase is mandatory, not optional |
| Architectural drift accumulates silently       | `/where-we-are` + `/war-*` audits         |

---

## Components

```
Harness
├── Root context file   ← AGENTS.md (canonical) + tool-specific symlink
├── Lifecycles          ← the workflows (dev / design / skill / architecture)
├── Skills              ← encoded conventions, slash commands, templates
├── Agents              ← specialised subagents with scoped tool access
├── Memory              ← cross-session persistent context
├── Reflections         ← post-task debriefs that feed the skill library
└── Docs                ← structured knowledge (HLD / LLD / Engineering Guide)
```

**AGENTS.md is the canonical root context file.** It is the file all major AI tools read first. Tool-specific files (CLAUDE.md for Claude Code, `.kiro/steering/project.md` for Kiro) are either symlinks to AGENTS.md or thin wrappers that point to it. → See `Engineering Guide/04 AI Workflow.md` for per-tool details.

→ See `Engineering Guide/03 Engineer Role.md` for how engineers and AI divide responsibility.  
→ See `Engineering Guide/Lifecycles/00 Overview.md` for the workflow overview and cross-lifecycle diagram.  
→ See `Engineering Guide/02 Doc Structure.md` for the documentation model.  
→ See `Engineering Guide/04 AI Workflow.md` for how this harness maps to each AI tool's primitives.

---

## How to run the bootstrap

1. Copy `docs/Harness/package/` into the new repo, at the same path (`docs/Harness/package/`).
2. Open a session with your AI assistant and say:

```
Initialise the harness for this project. Read and follow `docs/Harness/package/01 Bootstrap.md
```

3. The AI runs three stages:
   - **Stage 1 (Context)** — reads the package, repo, and existing docs
   - **Stage 2 (Q&A)** — asks Q1–Q11 one at a time, proposing answers from Stage 1 where possible
   - **Stage 3 (Generation)** — five blocks (skills → agents → AGENTS.md → docs payload → HLD scaffold), with a stop-and-validate after each block
4. After Stage 3, the AI runs a self-audit checklist before declaring complete.
5. Review and hand-edit AGENTS.md, then run `/where-we-are` as the first post-bootstrap command.

## How to update an existing harness

When `docs/Harness/package/` has evolved (new skills, updated flows, new agents) and the project was bootstrapped from an earlier version:

1. Pull the new `docs/Harness/package/` into the repo.
2. Open a session and say:

```
Update the harness for this project. Read and follow `docs/Harness/package/02 Update.md
```

3. The AI audits what is installed vs what the new bootstrap provides, then asks you to choose:
   - **Add** — install only components not yet present (safe, non-destructive)
   - **Sync** — add new components and bring drifted ones up to date, preserving project-specific values
4. Each updated file is shown as a diff before writing. Project customisations are always preserved.

---

## This folder as a portable package

`docs/Harness/package/` is designed to be copied as-is into any new project. It contains three kinds of content:

**Package files (stay here):** `00 Overview.md` and `01 Bootstrap.md`. The Overview is the package's reference doc — used when evaluating, copying, or evolving the package. `01 Bootstrap.md` is the executable entry point — point the AI at it to start the Q&A session.

**Skill source (each skill folder has two files):** every folder under `skills/` contains a `TEMPLATE.md` and an `INTENT.md`.

- `TEMPLATE.md` is the literal output target — what the runtime AI will read after substitution. It uses `{{PLACEHOLDER}}` slots for project-specific values.
- `INTENT.md` is a short sidecar describing how to materialise the TEMPLATE: a substitutions table mapping placeholders to Q&A answers, conditionals for whole-section omissions, and a verify checklist.

The bootstrap recipe applies substitutions and writes the result to the tool's skill folder (`.claude/skills/<name>/SKILL.md`, etc.). No prompt engineering — just substitute, verify, write.

**Migrated payload:** `Engineering Guide/` and the various `*.template.md` files inside skill folders. These are copied verbatim — `Engineering Guide/` lands in `docs/Engineering Guide/` (with light WAF/MCP substitutions); the user-facing templates land alongside their skills.

**Post-bootstrap.** The running project depends only on the migrated content's destination paths, not on `docs/Harness/package/` itself. Because the package now lives under `docs/`, it publishes as part of the project's own docs site by default — most projects will want to keep it there as a visible, browsable reference. It can still be deleted entirely if a project prefers not to carry it.

The `docs/Harness/package/` folder serves both initial bootstrap (`01 Bootstrap.md`) and future updates (`02 Update.md`). Keep it versioned in the repo so the update recipe always reflects the current state of the harness.

---

## Core principle

> **Reduce scaffolding over time.** Every ticket should be faster than the previous one because the conventions it discovers are encoded into skills and inherited by future tickets.

The harness improves because of the feedback loop, not despite it. Reflections are not optional ceremony — they are the mechanism by which the team's knowledge accumulates.
