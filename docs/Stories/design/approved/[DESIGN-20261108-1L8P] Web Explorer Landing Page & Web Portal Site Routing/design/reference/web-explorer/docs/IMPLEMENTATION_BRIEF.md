# Implementation brief — `apps/web-explorer`

## Objective

Create a polished public-facing interactive **SPA** to explain the Artisyn Implementation Harness. Prioritize technical credibility and a memorable, coherent first impression, not marketing-page volume or dashboard complexity.

## UX direction

Use https://trigger.dev/ as **a reference for quality and principles**: dark developer aesthetic, strong headline, real-looking code/terminal previews, restrained lime accent, generous spacing, subtle borders, and interactive explanations. Do **not** copy their brand, imagery, code, wordmark, page composition, or screenshots.

The user explicitly preferred the minimal Trigger.dev direction. Avoid full-height multicolor swimlane fills, heavy glassmorphism, distracting particle fields, giant 3D blobs, stock art, and decorative motion that obscures explanatory content.

## Target site (one page)

1. **Navigation:** Artisyn identity, anchors to How it works and Capabilities, Docs and GitHub links.
2. **Hero:** “AI engineering. Structured by design.” Short value statement, primary demo CTA, secondary GitHub CTA, terminal-style preview.
3. **How it works:** selectable `/design` and `/dev` client-side simulations. Clickable numbered phases, concise activity line, clear produced artifact label, Next, Back, Replay. Always show **SIMULATED RUN**.
4. **Core concepts:** four concise cards—Structured lifecycles, Agents and skills, Architecture awareness, Continuous learning.
5. **Operating model:** low-density visual connection of Engineer → AI assistant → Harness lifecycle → Knowledge base. Clarify that authority remains with humans where required.
6. **Get started:** prominent `/harness-bootstrap launch` command and copy action, links to docs and GitHub.
7. **Footer:** no forms, login, pricing, or other unnecessary entry points.

## Quality bar

- Desktop: fit hero headline plus partial terminal card above fold on a 1440×900 viewport; clearly differentiated sections; no huge empty decorative canvases.
- Responsive: mobile 360 px and up; step list horizontally scrollable or collapsible; no horizontal page overflow; minimum 44px tap targets where feasible.
- Accessibility: semantic headings; contrast-conscious colors; keyboard-focus outline; focusable steps; reduced-motion support; avoid relying on color only for state.
- Performance: static first paint, no 3D or charts, no unnecessary backend. Keep critical interactions in local React state.
- Accuracy: steps are a **storyboard**, not authoritative implementation internals. Do not claim a live agent run or infer undocumented lifecycle behavior.
- Content: clear short sentences, no inflated promises (e.g., "eliminates all bugs" or "fully autonomous without review").
- Branding: use supplied original Artisyn logo on light surfaces; use simplified SVG mark on dark surfaces; favicon must work at 16–32 px.

## Out of scope for v1

Real Claude Code integration, live task execution, dynamic skills catalog, authentication, telemetry, CMS, admin configuration, user-generated workflow definitions, visual graph editors.

## Suggested future increments (not prerequisites)

- Guided "ticket-to-reflection" story with artifacts and governance gates.
- Searchable skill/agent catalog generated from repository metadata.
- Context topology explorer (React Flow) as a separate section after initial UX stabilizes.
- Content sourcing from a published, versioned manifest rather than hardcoded demo objects.

## Ready-to-use coding-agent brief

> Build and refine `apps/web-explorer` as an accessible, responsive React 19 + Vite 8 + TypeScript SPA. Keep the existing minimal sections and the dark developer-platform visual system. Use Tailwind v4 for utility styling, Motion for meaningful transitions, and Lucide for icons. Respect the provided Artisyn brand assets. The interactive `/design` and `/dev` lifecycle must be deterministic and explicitly labeled as simulated; no backend. Keep all user-facing claims traceable to the canonical harness documentation. Preserve high contrast, keyboard navigation, and reduced-motion behavior. Run typecheck/build, fix issues, and provide screenshots at desktop and mobile. Do not clone Trigger.dev’s visual assets or copy its site layout. Do not add extra pages or framework dependencies without a demonstrated need.
