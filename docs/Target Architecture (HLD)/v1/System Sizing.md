---
id: 79bf09c2
purpose: Capacity dimensions and targets for the public site
keywords: [sizing, capacity, nfr]
---

# System Sizing

_The site is public, so its potential audience is unbounded; no formal capacity targets defined._

| Dimension        | Target      | Notes                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concurrent users | ~10         | Current planning assumption, not an access restriction — the site is publicly reachable with no auth boundary                                                                                                                                                                                                                                                                            |
| Traffic pattern  | Bursty      | Irregular; peaks on workshop days                                                                                                                                                                                                                                                                                                                                                        |
| Data storage     | < 100 MB    | Static site content only — excludes giscus/GitHub Discussions comment data, hosted externally on GitHub. Includes the build-time-produced operational graph database (`docs-operational-graph.sqlite`, ~140KB observed) and its `sql.js` WASM query engine, both shipped as static site content; the db grows with doc and edge count, so its size is worth watching as the graph scales |
| Response time    | < 2s p95    | GitHub Pages' own CDN covers most requests                                                                                                                                                                                                                                                                                                                                               |
| Availability     | Best-effort | No SLA defined                                                                                                                                                                                                                                                                                                                                                                           |
