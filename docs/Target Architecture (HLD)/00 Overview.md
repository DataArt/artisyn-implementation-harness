---
id: f803c04f
type: HLD
title: Target Architecture (HLD)
description: Entry point to the Target Architecture (HLD) directory — navigation to system overview, sizing, containers, and NFRs
tags: [hld, index, navigation, containers]
generated: { by: process:okf-migration, at: 2026-08-17T23:37:37Z }
updated: { by: process:okf-migration, at: 2026-11-16T21:31:28Z }
---

# Target Architecture (HLD)

The system's design intent — what this repo's own platform (the ADLC Discovery Tool site) is built toward. Seven containers: Web Explorer (promotional single-page app), Web Docs (VitePress static site), Web Portal (build-time composition of both into one deployable artifact tree, deployed to GitHub Pages), Discuss (client-side giscus comments widget), Implementation Harness E2E (test harness for the `implementation-harness` skill package and the release tooling), Log Hub (opt-in local session-telemetry dev tooling), and Harness Release Pipeline (CI tooling that ships the harness package to its five channels).

## How This Directory Works

Each version lives in its own folder — see [README](./README.md) for version status. [v1/System Overview](./v1/System%20Overview.md) is the entry point: purpose, containers, and data flow. Container docs state only settled design intent, not open questions or rationale — those live in `Stories/<TICKET>/design/` during active design work.

| Page                                                                                            | Holds                                                                 |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [v1/System Overview](./v1/System%20Overview.md)                                                 | Purpose, containers, and data flow                                    |
| [v1/System Sizing](./v1/System%20Sizing.md)                                                     | Capacity dimensions and targets                                       |
| [v1/Containers — Web Explorer](./v1/Containers/Web%20Explorer.md)                               | Promotional single-page app                                           |
| [v1/Containers — Web Docs](./v1/Containers/Web%20Docs.md)                                       | VitePress static documentation site                                   |
| [v1/Containers — Web Portal](./v1/Containers/Web%20Portal.md)                                   | Build-time composition into one deployable artifact tree              |
| [v1/Containers — Discuss](./v1/Containers/Discuss.md)                                           | giscus-based comments widget                                          |
| [v1/Containers — Implementation Harness E2E](./v1/Containers/Implementation%20Harness%20E2E.md) | Test harness for the `implementation-harness` skill package           |
| [v1/Containers — Log Hub](./v1/Containers/Log%20Hub.md)                                         | Opt-in local session-telemetry dev tooling                            |
| [v1/Containers — Harness Release Pipeline](./v1/Containers/Harness%20Release%20Pipeline.md)     | The only release lane: ships the harness package to its five channels |
| [v1/Non-Functional Concerns — Requirements](./v1/Non-Functional%20Concerns/Requirements.md)     | NFRs — security, performance, and other cross-cutting requirements    |
| [v1/Non-Functional Concerns — Accessibility](./v1/Non-Functional%20Concerns/Accessibility.md)   | Accessibility requirements (WCAG 2.2 AA target) for the website       |
