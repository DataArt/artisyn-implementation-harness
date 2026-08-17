---
skill: design-frame
output: .claude/skills/design-frame/SKILL.md
---

## Purpose

Phase 1 of the design lifecycle. Frames the problem, proposes requirements (evaluation criteria) the developer didn't think of, confirms the problem/boundaries/constraints, and saves `design/00 Frame.md` as the single source of ticket context for all subsequent phases. Requirements become the evaluation criteria rows in the Requirements × Options matrix during Elaborate. Does **not** touch Jira — ticket context comes from `$ARGUMENTS` and the developer directly. If a deployment wants Frame to fetch and assign the Jira ticket automatically, add that as a `Step 1b` delegating to `{{JIRA_AGENT}}` before the branch check.

## Substitutions

| Placeholder               | Source                                          | Notes                                                                                                                                                      |
| ------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_KEY}}`         | Q5 — ticket prefix                              | Replaces the Jira project key in ticket references                                                                                                         |
| `{{DESIGN_DOCS_ROOT}}`    | Q10 — design lifecycle scope                    | Where Publish lands settled decisions. See Conditionals — resolves to a fixed path (single-track modes) or the runtime token `{dest docs}` (Two-track)     |
| `{{DESIGN_CONTEXT_STEP}}` | Q10 — design lifecycle scope (see Conditionals) | The full body of Frame Step 3 — how the design's destination is determined. Structurally different per mode, not just a value swap                         |
| `{{PRODUCT_CONTEXT_DIR}}` | Q10 — design lifecycle scope (see Conditionals) | Folder name under `docs/` for the shared product-context layer, only asked when Product-context-scoped or Two-track. Default suggestion: `Product Context` |

## Conditionals

- **Design lifecycle scope** — ask at bootstrap time (Q10 extension in `01 Bootstrap.md`) which of three modes `/design` runs in. This is **one decision, used consistently** across `design-frame`, `design-research`, `design-elaborate`, `design-solution`, `design-review`, `design-address-feedback`, `design-publish`, and the `design` orchestrator — not a per-skill choice. `/dev` is unaffected in every mode — it always stays scoped to this project's own implementation (apps/libs, HLD/LLD) and always uses `@architect`.

  - **Project-scoped** (default — most single-repo projects): `/design` always targets this project's own architecture.
    - `{{DESIGN_DOCS_ROOT}}` = `docs/Target Architecture (HLD)/`
    - `{{DESIGN_ARCHITECT_AGENT}}` = `@architect` — do not deploy `product-architect`
    - `{{DESIGN_CONTEXT_STEP}}` = a step reading `docs/Target Architecture (HLD)/README.md` to find the active version and selecting the relevant container(s); ends with "Context sources for Step 4 and all subsequent phases: read the relevant container doc(s) and NFR docs for the areas this ticket touches."
    - Do not deploy `pattern-context-resolution.md`. `{{PRODUCT_CONTEXT_DIR}}` is not asked.

  - **Product-context-scoped** (this repo's original mode, still valid for a repo whose entire purpose is a shared cross-project docs layer with no target architecture of its own): `/design` always targets the shared product-context layer.
    - `{{DESIGN_DOCS_ROOT}}` = `docs/{{PRODUCT_CONTEXT_DIR}}/`
    - `{{DESIGN_ARCHITECT_AGENT}}` = `@product-architect` — deploy `agents/product-architect/TEMPLATE.md` (see its own INTENT.md)
    - `{{DESIGN_CONTEXT_STEP}}` = a bullet list of the product-context subfolders (e.g. Architecture, Context Topology, Integration Context, System Quality Attributes — one line each naming what belongs there), followed by "Context sources for Step 4 and all subsequent phases: read relevant docs under each of those subfolders."
    - Do not deploy `pattern-context-resolution.md`.

  - **Two-track** (this repo's current mode — for a repo that needs both: its own target architecture _and_ a shared cross-project product-context layer, chosen per design session, not fixed at deploy time):
    - `{{DESIGN_DOCS_ROOT}}` and `{{DESIGN_ARCHITECT_AGENT}}` resolve, everywhere they appear in every `/design` skill, to the **literal runtime tokens** `{dest docs}` / `{source docs}` (context-dependent) and `{resolved architect agent}` respectively — these are not bootstrap-time substitutions but strings the deployed skill itself writes, to be resolved per design session by the running agent from `design/Report.md`'s `## Context` section. Do not resolve them to a fixed value at generation time.
    - `{{DESIGN_CONTEXT_STEP}}` = "Create `design/Report.md` now if it does not exist, using `.claude/skills/design/report-template.md`. Apply `.claude/skills/design/pattern-context-resolution.md` — ask the developer which track this is (Product or Project), then which subfolder within it, and write the resolved Track, Source docs, Dest docs, Subfolder, Architect agent, and Implementation note into the `## Context` section of `design/Report.md`. Context sources for Step 4 and all subsequent phases: read relevant docs under the resolved Source docs path (across its existing subfolders) for anything already established on this topic."
    - Deploy `pattern-context-resolution.md` (companion file in `design/`) — resolve its lookup table's Product row using `{{PRODUCT_CONTEXT_DIR}}`; its Project row is fixed (`docs/Target Architecture (HLD)/`, `@architect`).
    - Deploy `agents/product-architect/TEMPLATE.md` (used for the Product track only; `@architect` is used for the Project track — both agents exist side by side).
    - `design-publish`'s `{{DESIGN_HANDOFF_NOTE}}` (see `design-publish/INTENT.md`) resolves to the runtime instruction: "Read the Implementation note from `design/Report.md`'s `## Context` section. Offer option B only per that note's guidance." — not a fixed string, since the note varies by which track the session resolved to.
    - The `design` orchestrator's `{{DESIGN_LIFECYCLE_SCOPE_NOTE}}` resolves to: `> 🗂 **Two-track design** — Product (`docs/{{PRODUCT_CONTEXT_DIR}}/`) or Project (`docs/Target Architecture (HLD)/`). Resolved once in Frame Step 3 (`pattern-context-resolution.md`) and recorded in `Report.md`'s `## Context` section; every later phase reads it from there.`

- If Q5 is "none" (no issue tracker): drop the `{{PROJECT_KEY}}` prefix convention, use free-text ticket titles instead

## Verify checklist

- [ ] TEMPLATE.md starts with `---` frontmatter containing `name:` (skill name) and `description:` (trigger conditions for this skill)

- [ ] Story folder glob uses `*{TICKET}*/**` wildcard, not `[{TICKET}]*`
- [ ] Fresh-start note: glob returns nothing → create folder directly
- [ ] Step 2 branch check: `git checkout -b` is presented as an instruction, never executed by the agent, even after "yes"
- [ ] Step 4 writes file and applies write-confirm pattern before developer review
- [ ] Proposed requirements include GDPR, observability, rollback as example gap types
- [ ] Proposed requirements labelled `[proposed]` so developer can accept/reject
- [ ] Note present that requirements become evaluation criteria rows in Elaborate matrix
- [ ] Report.md created with 7-phase tracker on first run (Frame/Research/Elaborate/Solution/Review/Address Feedback/Publish)
- [ ] Step 6 (Do → Report → Commit) uses wait-for-confirmation pattern
- [ ] No literal ticket prefix used outside `{{PROJECT_KEY}}`
- [ ] No Jira fetch/assign/transition logic present unless the deployment explicitly opted into it (see Purpose)
- [ ] Step 3 body matches the resolved mode exactly (Project-scoped / Product-context-scoped / Two-track) — no leftover `{{DESIGN_TARGET_SUBFOLDERS}}` / `{{DESIGN_CONTEXT_SOURCES}}` (retired placeholders) and no unresolved `{{DESIGN_CONTEXT_STEP}}` or `{{PRODUCT_CONTEXT_DIR}}`
- [ ] Two-track mode only: `{{DESIGN_DOCS_ROOT}}` / `{{DESIGN_ARCHITECT_AGENT}}` were resolved to the literal runtime tokens (`{dest docs}`, `{source docs}`, `{resolved architect agent}`) everywhere they appear in every `/design` skill — not to a fixed path/agent name
