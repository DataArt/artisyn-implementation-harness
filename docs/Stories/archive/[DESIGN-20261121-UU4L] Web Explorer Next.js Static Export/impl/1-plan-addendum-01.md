---
id: d1391f84
type: Implementation Plan Addendum
title: 'DESIGN-20261121-UU4L: Plan addendum 01 — agents page'
description: Adds a page that explains how AI agents can use the site (WebMCP tools, llms.txt, indexes), and adjusts the route counts in the approved plan's acceptance criteria
tags: [web-explorer, webmcp, agents, implementation-plan, addendum]
generated: { by: process:dev-implement, at: 2026-11-22T14:30:00Z }
updated: { by: process:dev-implement, at: 2026-11-22T14:30:00Z }
---

# DESIGN-20261121-UU4L: Plan addendum 01 — agents page

| Field     | Value                                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan      | [1-plan.md](1-plan.md) (approved, unchanged)                                                                                                        |
| Requested | Developer, 2026-11-22, during Implement: "think we may need to add one more step to add webmcp page and explain how this site can be interacted..." |
| Finding   | RF-032 (extension)                                                                                                                                  |

## Change

One new page, `/agents/`, explains to people and agents how to use the site with AI agents. It covers the WebMCP tools, how to try them, and the machine-readable resources.

The tool list on the page and the tools the browser registers come from one module, `src/agent/definitions.ts`, so the page cannot drift from what is registered. The page is a Server Component: it ships no JavaScript beyond the shared layout, and its code samples are text, not scripts (NFR-7, D11).

Live browser checks (Steps 21, 24 and 28) use Claude in Chrome on the developer's Chrome, at the developer's direction of 2026-11-22.

## Steps

### Step 28 — Web Explorer: agents page

Depends on Steps 13, 18, 21 and 22. Runs after Step 22, before Step 23.

**Changes:**

- `src/agent/definitions.ts` — plain data with erasable TypeScript only:
  - each tool's `name`, `description`, `inputSchema` and `annotations`
  - `tools.ts` and `AgentTools.tsx` register the tools from it
- `src/app/agents/page.tsx` and `src/views/agents/Agents.tsx` — a Server Component page titled "For AI agents". Sections:
  1. **What an agent can do here:** one row per tool from `definitions.ts`, with its name, what it does, its inputs (read from the schema) and "read-only".
  2. **How to try it:**
     - Chrome 150 or later with WebMCP enabled by flag (`chrome://flags`) or by the site's origin trial
     - a DevTools sample, shown as code: `await document.modelContext.getTools()`, then one `search_site` call
  3. **Machine-readable resources:** links to `llms.txt`, `agent-index.json`, `docs/agent-index.json` and `sitemap.xml`.
  4. **What the tools can and cannot do:**
     - read-only tools over public pages and docs
     - no data collected and no server
     - the page's CSP
- `src/routes.ts` — a `/agents/` entry, indexable, with title "For AI agents". `sitemap.xml`, `llms.txt` and `agent-index.json` pick it up from the registry.
- `src/components/Footer.tsx` — a "For AI agents" link on every page that renders the footer. The header nav is unchanged.
- `e2e/routes.ts` — adds `/agents/`, so every per-route browser check covers it. `webmcp.spec.ts` gains a case: the tool names listed on `/agents/` equal the names the stub records.

**Verification:**

> Run: `yarn nx run web-explorer:build`
> Expected: `out/agents/index.html` exists; the gates pass with 17 routes; `out/llms.txt`, `out/sitemap.xml` and `out/agent-index.json` include `/agents/`.
>
> Run: `yarn nx run web-explorer:e2e`
> Expected: the new case passes, and `/agents/` passes every per-route check: CSP, console, hydration, agent accessibility and WebMCP registration.
>
> Live check with Claude in Chrome: open `/agents/` in preview
> Expected: the tool table and the resource links render, and every resource link returns 200.

## Acceptance Criteria changes

The approved criteria stay. Where they count routes, the counts grow by one:

- `AC-1`, `AC-23`: 16 routes become **17** (with `/agents/`).
- `AC-3`, `AC-24`, `AC-25`: 15 indexable routes become **16**.

New:

- [ ] `AC-28` — `/agents/` is pre-rendered with its own metadata. It lists exactly the registered tools (`search_site`, `get_page`, `get_install_commands`) from `definitions.ts`, shows how to try them, and links `llms.txt`, both agent indexes and `sitemap.xml`. Every page that renders the footer links to it. It passes every per-route e2e check.
