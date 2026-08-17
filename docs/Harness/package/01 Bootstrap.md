# Bootstrap recipe

This file is the entry point. Run it whenever a project needs the harness installed or refreshed. After bootstrap completes, the running project depends on the migrated content under `docs/`, `.claude/`, and `AGENTS.md` — not on this folder.

The flow has three stages:

1. **Context** — read everything that informs generation
2. **Q&A** — clarify and gather project-specific values
3. **Generation** — iterative copy-and-substitute, with a stop after each block

Do every stage in order. Do not improvise. The whole point of this recipe is that generation is mechanical, not creative — substitute placeholders, apply conditionals, verify. Nothing else.

---

## Stage 1 — Context

Read every input below before asking any question. Weights indicate priority when context is large and selective reading is needed; under normal conditions, read everything.

### 1a — The package itself (weight 0.8)

Read every file in `docs/Harness/package/Engineering Guide/` in full. This gives the principles being shipped and the principles to follow during bootstrap (Documentation Principles, Doc Structure, Documents Flow, Lifecycle definitions, etc.).

### 1b — Existing repository code (weight 0.9)

Scan the repo to understand what already exists:

- Tech stack (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, etc.)
- Build/test tooling (NX, Bazel, Turbo, plain `npm scripts`, etc.)
- Project structure (monorepo with `apps/`+`libs/`, single app, mixed)
- Conventions visible from existing files (commit history, branch naming, lockfile choice)

This informs Q2, Q3, Q7 — the AI should propose answers from what it found, not ask cold.

### 1c — Existing documentation

Read in this order:

| Path                                                                                                                                                                                                                                         | Weight | Why                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `docs/Target Architecture (HLD)/`                                                                                                                                                                                                            | 1.0    | If exists, defines containers and NFRs — must not be overwritten                                                              |
| `docs/Engineering Guide/`                                                                                                                                                                                                                    | 0.9    | If exists, may already have conventions, principles, lifecycle docs                                                           |
| `docs/System Architecture (LLD)/`                                                                                                                                                                                                            | 0.7    | If exists, indicates the project is already partially harnessed                                                               |
| `docs/Stories/` (latest 5)                                                                                                                                                                                                                   | 0.5    | Sample of existing story format if any                                                                                        |
| `AGENTS.md` / `CLAUDE.md` (root)                                                                                                                                                                                                             | 0.9    | If exists, must not be silently overwritten — confirm with developer                                                          |
| Any other top-level `docs/<Name>/` folder that reads as cross-project/governance rather than this-repo-specific (README mentions "platform", "product", multiple repos, or governance/principles rather than this repo's own implementation) | 0.8    | If found, informs Q10b/Q10c — propose Product-context-scoped or Two-track and the detected folder name instead of asking cold |

If a doc tree already exists with content, this is an **adoption scenario** — see the section "Adopting the harness in an existing project" at the end of this file.

### 1d — Confirm context understood

Before moving to Q&A, present a short summary to the developer:

- "Detected stack: <…>"
- "Detected build tool: <…>"
- "Detected existing docs: <…>"
- "Detected existing harness: <none / partial / full>"

Ask: "Does this match your understanding? Anything to correct?"
⚠️ Stop and wait. Adjust if corrected.

---

## Stage 2 — Q&A

> ⚠️ **One question at a time. Always.** Ask Q1, then stop. Wait for the answer. Then ask Q2, then stop. Never batch questions, never list "remaining questions", never show proposed answers for multiple questions at once. Even when Stage 1 gave confident proposals for every question — ask them one at a time and wait. Speed is not the goal here; precision is.

Where Stage 1 produced a confident answer, **propose it and confirm** rather than asking cold. But still: one at a time, stop after each.

---

**Q1.** One paragraph: what does this project do, and why does it exist?
⚠️ Stop and wait.

---

**Q2.** Tech stack — languages, frameworks, runtime, datastore, cloud (propose from 1b, confirm).
⚠️ Stop and wait.

---

**Q3.** Container list — name each top-level container in the system (e.g. `Web, BFF, Data, Infrastructure`). One per layer. This drives `{{CONTAINER_LIST}}` everywhere.
⚠️ Stop and wait.

---

**Q4.** Primary data flow — describe in one sentence (e.g. "Web → BFF → Postgres; BFF emits events to SQS").
⚠️ Stop and wait.

---

**Q5.** Issue tracker — which one (Jira / Linear / GitHub Issues / none)? If Jira: **ticket prefix** (the string before the dash in ticket numbers — e.g. `PROJ` in `PROJ-123`), Jira URL, Confluence URL, board name. This drives `{{PROJECT_KEY}}`.

The ticket prefix and the board's `projectKey=` URL param are often different. If the detected values conflict, ask the developer to confirm which prefix appears in actual ticket numbers before recording the answer.
⚠️ Stop and wait. Do not advance to Q6 until the ticket prefix is unambiguously confirmed.

---

**Q6.** AI tool — Claude Code / Codex CLI / Cursor / Kiro / Windsurf / multiple. Drives wrapper file generation and skill install paths.
⚠️ Stop and wait.

---

**Q7.** Conventions — commit format (Conventional Commits / Custom / none), branch naming, guarded commands (commands the AI must never run directly, e.g. `cdk`, `git commit`, `git push`, `yarn nx`).
⚠️ Stop and wait.

---

**Q8.** NFRs — what are the non-functional requirements? Latency targets, availability, data residency, accessibility (e.g. WCAG 2.1 AA), cost ceiling.
⚠️ Stop and wait.

---

**Q9.** Anything else worth knowing — team size, delivery pace, known risks or constraints.
⚠️ Stop and wait.

---

**Q10.** Which lifecycles to enable? Default: all four (Dev, Design, Skill, Architecture). Solo or small projects often skip Design. Solo projects often skip Architecture.
⚠️ Stop and wait.

---

**Q10b.** _(only if Design is enabled)_ Design lifecycle scope — three modes:

- **Project-scoped** (default) — `/design` always targets this project's own architecture (`docs/Target Architecture (HLD)/`), agent `@architect`. Pick this unless the project is explicitly part of a multi-repo platform with a shared cross-project docs layer.
- **Product-context-scoped** — `/design` always targets a shared product-context layer instead of this project's own architecture (this project _is_ that shared layer — e.g. a dedicated docs/governance repo). Agent `@product-architect`.
- **Two-track** — `/design` supports both, chosen per design session (Product or Project), resolved once in Frame and recorded in `Report.md`. Deploys both agents side by side.

If Stage 1c detected an existing shared product-context-style folder (see Stage 1c), propose Product-context-scoped or Two-track and name the detected folder; otherwise ask cold. This one decision governs `{{DESIGN_DOCS_ROOT}}`, `{{DESIGN_ARCHITECT_AGENT}}`, and related placeholders consistently across every `/design` skill — see the shared conditional in `docs/Harness/package/skills/design-frame/INTENT.md`.
⚠️ Stop and wait.

---

**Q10c.** _(only if Q10b is Product-context-scoped or Two-track)_ What's the folder name under `docs/` for the shared product-context layer? Propose the folder Stage 1c detected, if any; otherwise default `Product Context`. This drives `{{PRODUCT_CONTEXT_DIR}}` everywhere.
⚠️ Stop and wait.

---

**Q11.** Well-Architected Framework for the Architecture lifecycle:

- Azure WAF (5 pillars: Reliability, Security, Cost, Operational Excellence, Performance Efficiency)
- AWS WAF (6 pillars — adds Sustainability)
- GCP
- Custom — list pillars
- None — skip the WAF assessment skills

Drives `/war-design`, `/war-implementation`, and the `design-review` phase if Design lifecycle is enabled.
⚠️ Stop and wait.

---

After all questions are answered (Q1–Q11, plus Q10b/Q10c if Design is enabled, plus any question added since this file was last touched): present a summary table of all answers. Ask: "Confirm to proceed with generation? (yes / edit answer N)"
⚠️ Stop and wait for explicit "yes".

**Persist the answers ledger.** Write `.harness-bootstrap-answers.md` at the repo root (create if missing) — one row per question key (`Q1`…`Q11`, `Q10b`, `Q10c`, and any future additions) with its resolved value. This is what `02 Update.md` Stage 0 diffs against to detect newly-added bootstrap questions on a future update, without which every future harness evolution that adds a question would have no way to know this project was never asked it. Example:

```markdown
# Bootstrap Answers

| Question | Answer                              |
| -------- | ----------------------------------- |
| Q1       | <one-paragraph project purpose>     |
| Q5       | PROJECT_KEY=PROJ, Jira, ...         |
| Q10b     | Two-track                           |
| Q10c     | PRODUCT_CONTEXT_DIR=Product Context |
| …        | …                                   |
```

---

## Stage 3 — Generation

Each block below follows the same pattern:

> **Adopt** — copy `TEMPLATE.md` files, apply substitutions per `INTENT.md`, apply conditionals
> **Self-check** — run the verify checklist from each `INTENT.md` > **Stop and validate** — present what was generated, get developer confirmation before moving to the next block

### The substitution algorithm (used in every block)

1. Read the skill folder's `INTENT.md` — it lists Source path, Substitutions table, Conditionals, Verify checklist
2. Read the skill folder's `TEMPLATE.md`
3. For each row in Substitutions table — replace placeholder with the resolved value from Q&A or detected context
4. For each Conditionals bullet — if the condition is true, omit the named section/file
5. Run Verify checklist — if any check fails, stop and report
6. Write result to the Output path declared in INTENT.md

If a substitution value is unclear, ask the developer rather than guess.

---

### Block A — Generate flow skills

Generate one sub-block at a time. After each sub-block: run the verify checklist, present a summary table, and stop. Do not start the next sub-block until the developer confirms.

Output paths per Q6 (apply to every sub-block):

| Tool        | Output path                                        | Notes                                  |
| ----------- | -------------------------------------------------- | -------------------------------------- |
| Claude Code | `.claude/skills/<name>/SKILL.md`                   | TEMPLATE.md format works as-is         |
| Codex CLI   | `skills/<name>/SKILL.md`                           | Same format                            |
| Cursor      | `.cursor/rules/<name>.mdc`                         | Add `globs` and `alwaysApply` per type |
| Kiro        | `.kiro/steering/<name>.md`                         | Always-loaded                          |
| Windsurf    | append to `.windsurfrules` with `## <Name>` header | Single flat file                       |

Copy alongside each skill (verbatim, no substitution): every `*.template.md` file in the same skill folder.

---

**A.1 — Dev lifecycle** (always enabled)

Skills: `dev/`, `dev-plan/`, `dev-implement/`, `dev-test/`, `dev-document/`

Agents (in addition to the layer-specific specialist agents from Block B): `docs-writer/`

For each: run substitution algorithm → write output → run INTENT.md Verify checklist.

Present summary table:

| Skill    | File written | Lines | Verify ✅/❌ |
| -------- | ------------ | ----- | ------------ |
| dev      |              |       |              |
| dev-plan |              |       |              |
| …        |              |       |              |

Ask: "A.1 complete. Spot-check any skill (name it) or confirm to continue to A.2?"
⚠️ Stop and wait. If developer names a file — show it. Re-generate if corrections needed. Repeat until confirmed.

---

**A.2 — Design lifecycle** (skip entire sub-block if Design not in Q10)

Skills: `design/`, `design-frame/`, `design-research/`, `design-elaborate/`, `design-solution/`, `design-review/`, `design-review-gate/`, `design-address-feedback/`, `design-publish/`

If Q11 is "None": omit `design-review/`.

Per Q10b: deploy `pattern-context-resolution.md` (companion file under `design/`) only for **Two-track** mode — omit it entirely for Project-scoped or Product-context-scoped. Deploy the `product-architect` agent (Block B) for **Product-context-scoped or Two-track**; deploy/keep `architect` for **Project-scoped or Two-track** — in Two-track mode both agents are deployed side by side.

For each: run substitution algorithm → write output → run INTENT.md Verify checklist.

Present summary table (same format as A.1).

Ask: "A.2 complete. Spot-check any skill or confirm to continue to A.3?"
⚠️ Stop and wait.

---

**A.3 — Skill lifecycle** (skip if Skill not in Q10)

Skills: `skill-lifecycle/`, `skill-reflect/`, `skill-triage/`, `skill-new/`, `skill-promote/`, `skill-harvest/`

For each: run substitution algorithm → write output → run INTENT.md Verify checklist.

Present summary table.

Ask: "A.3 complete. Spot-check any skill or confirm to continue to A.4?"
⚠️ Stop and wait.

---

**A.4 — Architecture lifecycle** (skip if Architecture not in Q10 or Q11 = None)

Skills: `war/`, `where-we-are/`, `war-design/`, `war-implementation/`

For each: run substitution algorithm → write output → run INTENT.md Verify checklist.

Present summary table.

Ask: "A.4 complete. Spot-check any skill or confirm to continue to Block B?"
⚠️ Stop and wait.

---

### Block B — Generate specialist agent scaffolds

From Q2 (tech stack) and Q3 (containers), suggest specialist agents. There are two agent types:

**Layer specialists** — one per application container from Q3 (e.g. `web`, `auth`, `bff`, `data`). Each uses `docs/Harness/package/agents/layer/TEMPLATE.md` as its source; run the substitution algorithm per `layer/INTENT.md`. Examples:

- TypeScript frontend → layer agent named `web`
- Node.js API / BFF → layer agent named `bff`
- Lambda handler → layer agent named `auth`

**Cross-cutting agents** — use their own pre-built templates (do not generate from scratch):

- Terraform / CDK infrastructure → `agents/infra/` template
- Multi-container project (>1 in Q3) → `agents/architect/` template (read-only reviewer)
- Q10b is Product-context-scoped or Two-track → `agents/product-architect/` template (see its own INTENT.md; deployed alongside `architect` in Two-track mode, not instead of it)
- `agents/onboarding/`, `agents/docs-writer/`, `agents/scrum-master/` — always include

Present the suggested list. ⚠️ Stop and wait — let the developer add, remove, or rename.

**Adopt:**

- For each **layer specialist**: run substitution algorithm on `agents/layer/TEMPLATE.md` → resolve all `{{LAYER_*}}` and `{{NX_APP_NAME}}` placeholders per `layer/INTENT.md` Substitutions table → write to output path
- For each **cross-cutting agent**: run substitution algorithm on that agent's `TEMPLATE.md` → write to output path

Layer agents are 20–40 lines. Every layer agent must have all five sections from `layer/TEMPLATE.md`: Role, Layer scope, What to enforce, Satellite review, What never to do.

Output paths per Q6:

- Claude Code → `.claude/agents/<name>.md`
- Codex CLI → per-folder `<dir>/AGENTS.md` (directory-cascade — Codex has no native agents)
- Cursor → `.cursor/rules/agent-<name>.mdc` (alwaysApply: false)
- Kiro → `.kiro/hooks/<name>.md`
- Windsurf → appended to `.windsurfrules` under `## Agent: <Name>`

**Self-check:** verify each generated layer agent file has all five sections (Role, Layer scope, What to enforce, Satellite review, What never to do) and no unresolved `{{LAYER_*}}` placeholders. No persona prose.

**Stop and validate:** present the agent files. Ask: "Block B complete. Spot-check any before continuing?"
⚠️ Stop and wait.

---

### Block C — Generate AGENTS.md (root context file)

AGENTS.md is the canonical root context file. Every other tool's wrapper points to it.

**Adopt:** generate AGENTS.md with WHY/WHAT/HOW structure. Total length 60–130 lines.

```
# <Project name from Q1>

## Why
<2–3 sentences from Q1 — what this project does and why the harness exists>

## What

### Conventions
See docs/Engineering Guide/01 Conventions.md.
<Inline only the most critical project-specific rules — the one or two an AI would
most likely violate without being told. From Q7.>

### Architecture
| Container | Role | Stack |
|-----------|------|-------|
<one row per Q3 container, role and stack from Q2/Q3>

See docs/Target Architecture (HLD)/README.md for the active version's full design.

<If Q10b is Product-context-scoped or Two-track, add:>
### Design Track
`/design` is <Product-context-scoped: "scoped to docs/<PRODUCT_CONTEXT_DIR>/ only" / Two-track: "two-track: Product (docs/<PRODUCT_CONTEXT_DIR>/) or Project (docs/Target Architecture (HLD)/), resolved once in Frame and recorded in the session's Report.md ## Context section">.

### NFRs
See docs/Target Architecture (HLD)/<active version>/Non-Functional Concerns/Requirements.md.

### Skills
| Skill | Purpose |
|-------|---------|
<one row per skill generated in Block A — use the description from each TEMPLATE's frontmatter>

## How

### Slash commands
<orchestrator commands first (/dev, /design, /war, /where-we-are), then phase commands.
Filtered by Q10.>

### Agents
| Agent | Layer | Tools |
|-------|-------|-------|
<one row per agent generated in Block B>

### Issue tracker
<from Q5: URL, project key, board URL>
```

**Tool-specific wrapper (branch on Q6):**

For **Claude Code**: CLAUDE.md must be a **symlink** to AGENTS.md. Not a file. Not a stub. Not a one-line "see AGENTS.md" pointer.

⛔ Do not use the Write tool to create CLAUDE.md. Writing a file named CLAUDE.md is a generation defect, even if the body says "see AGENTS.md". A symlink and a file are not interchangeable: a symlink means edits to AGENTS.md propagate; a stub file means two divergent sources of truth.

Procedure (do all three):

1. Run the symlink command yourself using the Bash tool from the repo root:
   ```bash
   ln -s AGENTS.md CLAUDE.md
   ```
   On Windows use: `mklink CLAUDE.md AGENTS.md`
2. Immediately verify with the Bash tool:
   ```bash
   ls -la CLAUDE.md
   ```
   Output must show `CLAUDE.md -> AGENTS.md`. If it shows a regular file with a size, the symlink failed — delete and retry.
3. Report the `ls -la` output to the developer so they can confirm.

Self-check: "Did I use the Write tool to create CLAUDE.md?" If yes — stop, delete the file, restart this procedure.

For other tools:

- **Codex CLI** — AGENTS.md is the root; no wrapper needed. Per-layer specialist agents already generated in Block B as `<dir>/AGENTS.md`.
- **Cursor** — generate `.cursor/rules/project.mdc` (alwaysApply: true) → `See AGENTS.md.`
- **Kiro** — generate `.kiro/steering/project.md` mirroring AGENTS.md's `## What` section.
- **Windsurf** — first line of `.windsurfrules`: `See AGENTS.md for project conventions.`

For Claude Code only — generate `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["Bash(yarn:*)", "Bash(git mv:*)"],
    "deny": ["<guarded commands from Q7 as Bash(<cmd>:*)>"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "input=$(cat); if echo \"$input\" | jq -r '.tool_input.command // \"\"' | grep -q 'Stories/archive'; then printf '{\"systemMessage\": \"Story archived.\\nIf anything surprised you this ticket, capture it now:\\n\\n  /skill-reflect <your brain-dump>\\n\\nEven one sentence is enough.\"}'; fi",
            "statusMessage": "Checking for reflection prompt..."
          }
        ]
      }
    ]
  }
}
```

Also create `.claude/` folder structure:

- `skills/` (already populated by Block A)
- `skills/drafts/`
- `agents/` (already populated by Block B)
- `memory/`
- `reflections/`

**Self-check:**

- [ ] AGENTS.md is 60–130 lines
- [ ] All `## What` and `## How` subsections present
- [ ] Skills table has one row per generated skill
- [ ] Agents table has one row per generated agent
- [ ] CLAUDE.md (Claude Code only) is a symlink — `ls -la` shows `→ AGENTS.md`
- [ ] settings.json deny list matches Q7 guarded commands

**Stop and validate:** present AGENTS.md and the symlink verification. Ask: "Block C complete. Symlink verified? Continue?"
⚠️ Stop and wait.

---

### Block D — Install docs payload

Copy from `docs/Harness/package/Engineering Guide/` → `docs/Engineering Guide/` with conditional transformations:

| Source                                    | Destination                                                      | Condition           |
| ----------------------------------------- | ---------------------------------------------------------------- | ------------------- |
| `01 Conventions.md`                       | `docs/Engineering Guide/01 Conventions.md`                       | always              |
| `02 Doc Structure.md`                     | `docs/Engineering Guide/02 Doc Structure.md`                     | always              |
| `03 Engineer Role.md`                     | `docs/Engineering Guide/03 Engineer Role.md`                     | always              |
| `04 AI Workflow.md`                       | `docs/Engineering Guide/04 AI Workflow.md`                       | always              |
| `05 MCP Setup.md`                         | `docs/Engineering Guide/05 MCP Setup.md`                         | Q5 = Jira           |
| `09 Documentation Principles.md`          | `docs/Engineering Guide/09 Documentation Principles.md`          | always              |
| `Lifecycles/00 Overview.md`               | `docs/Engineering Guide/Lifecycles/00 Overview.md`               | always              |
| `Lifecycles/01 Dev Lifecycle.md`          | `docs/Engineering Guide/Lifecycles/01 Dev Lifecycle.md`          | always              |
| `Lifecycles/02 Design Lifecycle.md`       | `docs/Engineering Guide/Lifecycles/02 Design Lifecycle.md`       | Design in Q10       |
| `Lifecycles/03 Skill Lifecycle.md`        | `docs/Engineering Guide/Lifecycles/03 Skill Lifecycle.md`        | Skill in Q10        |
| `Lifecycles/04 Architecture Lifecycle.md` | `docs/Engineering Guide/Lifecycles/04 Architecture Lifecycle.md` | Architecture in Q10 |
| `Lifecycles/05 Documents Flow.md`         | `docs/Engineering Guide/Lifecycles/05 Documents Flow.md`         | always              |

**Substitutions in installed docs:**

- `Lifecycles/04 Architecture Lifecycle.md`: substitute WAF pillar list from Q11
- `05 MCP Setup.md`: substitute Jira URL, Confluence URL from Q5
- `Lifecycles/02 Design Lifecycle.md` and `Lifecycles/05 Documents Flow.md`: **checked in as their Two-track form** — see below for what to remove for the other two modes
- `Lifecycles/00 Overview.md`: `{{DESIGN_ARCHITECT_AGENT}}` per Q10b

**Q10b — `Lifecycles/02 Design Lifecycle.md` and `Lifecycles/05 Documents Flow.md` are written as Two-track by default.** These two files ship in this package already describing this repo's own Two-track deployment — full prose, full Mermaid diagram, no `{{}}` placeholders standing in for content, so the file is always valid and complete on its own (no broken diagram if someone opens the raw file without running substitution). **Two-track deployments: copy both files verbatim** (only `{{PRODUCT_CONTEXT_DIR}}`, `{{DESIGN_ARCHITECT_AGENT}}`, `{{DESIGN_DOCS_ROOT}}` need resolving — all three already used the normal way, safely inside quoted labels/table cells). For the other two modes, **remove** the content below — do not leave anything blank or commented out in the output.

_Remove for **Project-scoped**:_

- `02 Design Lifecycle.md`: the "Two tracks, one flow" paragraph; "Resolve Context (track/subfolder) → " prefix on the Frame node label; the Frame invariant's opening sentence about track resolution; the `context-resolution` pattern-table row
- `05 Documents Flow.md`: the `PCTX[...]:::pctx` node and its `classDef pctx` line; the `SOL -->|"/design-publish (Product)"| PCTX` edge; simplify the remaining `SOL -->|"/design-publish (Project)"| HLD` edge to `SOL -->|"/design-publish\nsuggests updates"| HLD` (no qualifier — only one track exists); the `> _Context sources..._` blockquote below the diagram; the `` `/design-publish` (Product track) `` graduation row; simplify the remaining `` `/design-publish` (Project track) `` row's label back to plain `` `/design-publish` ``; the "Design graduation is track-routed..." sentence at the end of **Graduation**

_Remove for **Product-context-scoped**:_ same list as Project-scoped, but mirrored — keep the `PCTX` node/classDef and the `SOL -->|...| PCTX` edge (simplified to drop the "(Product)" qualifier, same reasoning), remove the `SOL -->|...| HLD` edge and the `(Project track)` graduation row instead, keep the `(Product track)` row simplified to plain `` `/design-publish` ``. The `HLD` node itself and its `/dev-document` edges stay in both cases — those are independent of Q10b.

**Adopt:** copy each file, apply per-file substitutions where listed.

**Self-check:**

- [ ] All `always` files copied
- [ ] Conditional files included or omitted per Q10/Q11/Q5
- [ ] WAF pillars resolved in Architecture Lifecycle if installed
- [ ] MCP Setup placeholders resolved if installed

**Stop and validate:** list installed docs. Ask: "Block D complete. Continue?"
⚠️ Stop and wait.

---

### Block E — Generate Target Architecture (HLD) scaffold and docs/README.md

**E.1 — Target Architecture scaffold**

Skip this block entirely if `docs/Target Architecture (HLD)/README.md` already exists with non-trivial content (Stage 1 detected this).

Otherwise, scaffold:

```
docs/Target Architecture (HLD)/
  README.md                            ← router with active version table; "Active version: v1"
  v1/
    System Overview.md                 ← from Q1, Q2, Q3, Q4
    System Sizing.md                   ← from Q8 capacity targets (stub if not provided)
    Containers/
      <Name>.md                        ← one stub per container from Q3
    Non-Functional Concerns/
      Requirements.md                  ← NFR table from Q8
```

No numeric prefixes inside the version. The four entries have fixed names. WAR/ is not generated here — created on first `/war-*` run.

**E.1b — Product context scaffold** _(only if Q10b is Product-context-scoped or Two-track)_

Scaffold a minimal `docs/{{PRODUCT_CONTEXT_DIR}}/README.md` (router/index, one paragraph on what this layer governs) plus one empty subfolder as a starting point (ask the developer for its name, or default to `Architecture/`). Do not invent subfolder structure beyond that — subsequent `/design` sessions create subfolders as needed (Two-track: see `pattern-context-resolution.md`; Product-context-scoped: see `design-frame`'s Step 3).

**E.2 — docs/README.md**

If `docs/README.md` already exists with meaningful content: validate and suggest changes only.

If not, generate ~15 lines:

```markdown
# Documentation

This repository organises documentation in four tiers:

- **Target Architecture (HLD)** — design intent (what we are building toward)
- **System Architecture (LLD)** — current state (what is built today)
- **Engineering Guide** — operational and procedural knowledge
- **Stories** — per-ticket working folders (transient)

→ See `Engineering Guide/02 Doc Structure.md` for the full model.
→ See `Engineering Guide/Lifecycles/05 Documents Flow.md` for how docs are produced and graduate.
→ See `Engineering Guide/Lifecycles/00 Overview.md` for the workflow lifecycles.
```

**Self-check:**

- [ ] HLD README has "Active version: v1" pointer
- [ ] All four entries inside `v1/` exist (System Overview, System Sizing, Containers/, Non-Functional Concerns/)
- [ ] One container stub per Q3 entry, named exactly per Q3
- [ ] docs/README.md is the thin index, not the full doc structure

**Stop and validate:** present scaffolded files. Ask: "Block E complete. Ready for the final audit?"
⚠️ Stop and wait.

---

## Self-audit — before declaring complete

Before announcing completion, run this checklist. Fix every failing item.

**CLAUDE.md is a symlink, not a file** (Claude Code only):

- [ ] Run `ls -la CLAUDE.md` with the Bash tool — output must show `CLAUDE.md -> AGENTS.md`
- [ ] If output shows a regular file with a size: defect — delete it with `rm CLAUDE.md`, then re-run `ln -s AGENTS.md CLAUDE.md` with the Bash tool

**No unresolved placeholders anywhere:**

- [ ] Grep all generated files in `.claude/skills/`, `.claude/agents/`, `AGENTS.md`, `docs/Engineering Guide/`, `docs/Target Architecture (HLD)/` for `{{`, `}}`, `LAYER_NAME`, `LAYER_PATH`, `NX_APP_NAME`, `<PROJECT_KEY>`, `<TICKET>`, `<WAF`, `<guarded` — none should remain (note: `@architect` legitimately appears in satellite-review blocks — do not flag it)
- [ ] Project key is the actual Q5 value everywhere
- [ ] WAF pillars are the actual Q11 values everywhere

**Hard stop blocks are intact:**

- [ ] `dev-implement/SKILL.md` Step 3 contains the ⛔ HARD STOP block ("do not edit any file, do not update 2-report.md, do not start the next step until the developer explicitly confirms verification passed") — not compressed to a single line

**Decision logic is explicit:**

- [ ] `dev-plan/SKILL.md` Step 10 architecture audit asks specific questions about container boundaries, data-flow direction, and NFRs
- [ ] `dev-document/SKILL.md` Step 1 classification uses the HLD/LLD placement matrix (HIT/MISS × HIT/MISS) — not a shortcut lookup

**Orchestrators delegate, don't describe:**

- [ ] `dev/SKILL.md` and `design/SKILL.md` (if generated) say "Invoke the X skill" — never "Follow /X exactly"
- [ ] Each phase entry has a verify-by-artifact check

**Agents and skills registered:**

- [ ] Every generated agent appears in AGENTS.md `## Agents` table
- [ ] Every generated skill appears in AGENTS.md `## Skills` table

**Harness bootstrap sync** (Claude Code only):

- [ ] `skill-harvest/SKILL.md` is present in `.claude/skills/`
- [ ] `skill-triage/SKILL.md` and `skill-promote/SKILL.md` end with a "Harness bootstrap sync" reminder block

**Answers ledger:**

- [ ] `.harness-bootstrap-answers.md` exists at the repo root with one row per question actually asked (Q1–Q11, plus Q10b/Q10c if Design was enabled) — this is what `02 Update.md` Stage 0 depends on for every future harness update

**Tool wrapper is correct for Q6:**

- [ ] Claude Code: CLAUDE.md is a symlink; `.claude/settings.json` exists with hooks
- [ ] Codex CLI: per-layer AGENTS.md exists; no `.claude/agents/` files
- [ ] Cursor: `.cursor/rules/project.mdc` exists with `alwaysApply: true`
- [ ] Kiro: `.kiro/steering/project.md` exists
- [ ] Windsurf: `.windsurfrules` first line points to AGENTS.md

If all items pass — proceed to summary. If any fail — fix and re-audit.

---

## After bootstrap

1. Hand-edit AGENTS.md — the scaffold is a starting point, not a finished doc. Tighten the WHY paragraph; trim the inline conventions to only what matters most.
2. Review generated skills — they are project-specific but may need refinement after first use.
3. Run `/where-we-are` (if Architecture lifecycle enabled) — first gap report. Everything "designed, not implemented" is expected for a fresh greenfield.
4. Start the first ticket: `/dev <PROJECT_KEY>-001 <problem statement>`.

The `docs/Harness/package/` folder stays in the repo as the package source. It is not required for the running project — the running project depends only on what was migrated into `docs/`, `.claude/`, and `AGENTS.md`. Because it lives under `docs/`, it publishes as part of the project's own docs site by default; most projects will want to keep it there as a visible, browsable reference, though it can still be deleted entirely if preferred.

---

## Adopting the harness in an existing project

Different from re-running bootstrap. Use this when the project already has docs, possibly skills, possibly an AGENTS.md, and you want to introduce or align with this harness.

1. Read all existing skill files, agent files, and the root context file
2. Read `docs/` end-to-end to understand the current documentation shape
3. Run `/where-we-are` to assess the delivery gap
4. Run `/war-design` to check Target Architecture soundness against the WAF
5. Use `/skill-new` to encode conventions that exist in practice but are not yet captured as skills
6. Where existing docs map to this harness's structure (Engineering Guide articles, Lifecycles), align numbering and naming over time — do not bulk-rename

The package is incremental. Adopt only what helps; leave the rest alone.
