---
id: f803c04f
purpose: Entry point to the Target Architecture (HLD) directory — navigation to system overview, sizing, containers, and NFRs
keywords: [hld, index, navigation, containers]
---

# Target Architecture (HLD)

The system's design intent — what this repo's own platform (the ADLC Discovery Tool site) is built toward. Five containers: Web Explorer (promotional single-page app), Web Docs (VitePress static site), Web Portal (build-time composition of both into one deployable artifact tree, deployed to GitHub Pages), Discuss (client-side giscus comments widget), and Harness Bootstrap E2E (test harness for the `harness-bootstrap` skill).

## How This Directory Works

Each version lives in its own folder — see [README](./README.md) for version status. [v1/System Overview](./v1/System%20Overview.md) is the entry point: purpose, containers, and data flow. Container docs state only settled design intent, not open questions or rationale — those live in `Stories/<TICKET>/design/` during active design work.

| Page                                                                                        | Holds                                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [v1/System Overview](./v1/System%20Overview.md)                                             | Purpose, containers, and data flow                                 |
| [v1/System Sizing](./v1/System%20Sizing.md)                                                 | Capacity dimensions and targets                                    |
| [v1/Containers — Web Explorer](./v1/Containers/Web%20Explorer.md)                           | Promotional single-page app                                        |
| [v1/Containers — Web Docs](./v1/Containers/Web%20Docs.md)                                   | VitePress static documentation site                                |
| [v1/Containers — Web Portal](./v1/Containers/Web%20Portal.md)                               | Build-time composition into one deployable artifact tree           |
| [v1/Containers — Discuss](./v1/Containers/Discuss.md)                                       | giscus-based comments widget                                       |
| [v1/Containers — Harness Bootstrap E2E](./v1/Containers/Harness%20Bootstrap%20E2E.md)       | Test harness for the `harness-bootstrap` skill                     |
| [v1/Non-Functional Concerns — Requirements](./v1/Non-Functional%20Concerns/Requirements.md) | NFRs — security, performance, and other cross-cutting requirements |
