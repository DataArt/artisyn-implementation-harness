# System Sizing

_Engagement-scoped site serving a small internal team. No formal capacity targets defined._

| Dimension        | Target      | Notes                                                                                                   |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Concurrent users | ~10         | Internal team only                                                                                      |
| Traffic pattern  | Bursty      | Irregular; peaks on workshop days                                                                       |
| Data storage     | < 100 MB    | Static site content only — excludes giscus/GitHub Discussions comment data, hosted externally on GitHub |
| Response time    | < 2s p95    | CloudFront edge cache covers most requests                                                              |
| Availability     | Best-effort | No SLA defined for this engagement                                                                      |
