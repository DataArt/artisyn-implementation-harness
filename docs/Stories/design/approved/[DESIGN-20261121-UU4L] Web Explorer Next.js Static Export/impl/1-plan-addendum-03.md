---
id: 55b024f8
type: Implementation Plan Addendum
title: 'DESIGN-20261121-UU4L: Plan addendum 03 — WebMCP tool set'
description: Replaces the planned WebMCP tool set with the developer's list (search_documentation, get_install_instructions, open_workflow, get_harness_capabilities) plus get_page
tags: [web-explorer, webmcp, agents, implementation-plan, addendum]
generated: { by: process:dev-implement, at: 2026-11-22T18:10:00Z }
updated: { by: process:dev-implement, at: 2026-11-22T18:10:00Z }
---

# DESIGN-20261121-UU4L: Plan addendum 03 — WebMCP tool set

| Field     | Value                                                                                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan      | [1-plan.md](1-plan.md), [addendum 01](1-plan-addendum-01.md), [addendum 02](1-plan-addendum-02.md)                                                             |
| Requested | Developer, 2026-11-22, during Step 21: "lets extend agent tools with: search_documentation, get_install_instructions, open_workflow, get_harness_capabilities" |
| Finding   | RF-035 (extension)                                                                                                                                             |

## Change

The registered WebMCP tools become five. All are defined in `src/agent/definitions.ts`, and the agents page (Step 28) lists them from there.

| Tool                       | Replaces                         | Purpose                                                                                                                                                     | Annotations                          |
| -------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `search_documentation`     | `search_site` (Step 21)          | Search the Web Docs articles and the site pages; `source` is `all` (default), `docs` or `site`                                                              | `readOnlyHint: true`                 |
| `get_page`                 | — (Step 21)                      | Title, description, headings and text of one page from a search result                                                                                      | `readOnlyHint: true`                 |
| `get_install_instructions` | `get_install_commands` (Step 22) | Install, launch and update steps for one provider and channel, from `commands.ts`                                                                           | `readOnlyHint: true`                 |
| `open_workflow`            | new                              | Navigates the browser to a lifecycle's Web Docs article: `dev`, `design`, `evolve`, `architecture` or `documents-flow` (`docs/Harness/03 Lifecycles/01–05`) | `readOnlyHint: false` (it navigates) |
| `get_harness_capabilities` | new                              | The harness capabilities and pillars (the landing's own copy), the lifecycles with commands and docs links, providers, channels and demo scenarios          | `readOnlyHint: true`                 |

Return values follow Chrome's WebMCP docs: any JSON-serializable value, not an MCP `content` wrapper.

## Steps

- **Step 21** (in progress): `search_site` becomes `search_documentation`. Everything else in the step stands.
- **Step 22** is replaced by "WebMCP install, workflow and capability tools". It depends on Steps 8 and 21. Its changes:
  - `get_install_instructions` as Step 22 described `get_install_commands`, with the same `commands.ts` reuse and validation.
  - `src/agent/workflows.ts`: the lifecycle list (id, name, command, one-line purpose and docs path), used by `open_workflow` and `get_harness_capabilities`. A unit case asserts each docs path's source file exists under `docs/Harness/03 Lifecycles/`.
  - `open_workflow({ workflow })` returns `{ opened: url }` and then navigates with `location.assign` on the next tick, so the agent receives the answer before the page unloads.
  - `src/views/landing/capabilities.ts`: the landing's capability and pillar text, moved out of `Landing.tsx` (the icons stay in `Landing.tsx`), used by the landing and by `get_harness_capabilities`.
  - `get_harness_capabilities()` returns capabilities, pillars, lifecycles, providers, channels (with `soon` flags), the terminal demo scenarios (`views/landing/scenarios.ts`) and the docs-flow scenarios (`views/docs-flow/flow.ts`).
- **Verification:**
  - unit cases for each tool (input validation; data matches its source module)
  - e2e through the stub: all five tools registered once per route; `open_workflow` navigates to the expected docs URL; no CSP violation
  - **live check:** in a flag-enabled Chrome (`chrome://flags/#enable-webmcp-testing`), through Claude in Chrome, the five tools are listed and `search_documentation` and `get_harness_capabilities` answer. This also covers Step 21's required live check, done once for all tools after this step.

## Acceptance Criteria changes

- `AC-23`, `AC-26`, `AC-28`: the tool names become `search_documentation`, `get_page`, `get_install_instructions`, `open_workflow` and `get_harness_capabilities`.
- New `AC-31`: `open_workflow` accepts only the five lifecycle ids, returns the target URL, and navigates to the matching `docs/Harness/03 Lifecycles/` article. `get_harness_capabilities` returns data equal to its source modules, so the landing copy, `commands.ts` and the scenarios cannot drift from what agents are told.
