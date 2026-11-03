---
id: ca1e020e
purpose: Landing page and navigation index for the Engineering Guide's conventions, documentation, lifecycles, and infrastructure sections
keywords: [engineering guide, index, navigation]
---

# Engineering Guide

Cross-cutting conventions and operational procedures for how work is planned, implemented, reviewed, and published in this repo.

## How This Guide Works

The top-level articles cover conventions and setup — read [Doc Structure](./Documentation/02%20Structure.md) first for the full three-tier documentation model this repo follows. [Documentation](#documentation) holds the presentation and structural-contract articles that govern how every doc type is written. [Lifecycles](./Lifecycles/00%20Overview.md) documents the four lifecycles (Dev, Design, Skill, Architecture) that structure all work end to end — also mirrored under [Harness › Lifecycles](/Harness/03%20Lifecycles/00%20Overview.md) as part of the harness's own nav. [Infrastructure](./Infrastructure/04%20Giscus%20Setup.md) covers the one remaining manual setup procedure, Giscus comments configuration — the AWS deploy/provisioning runbooks that used to live here were retired along with the Infrastructure and Auth containers. This guide is stable reference material — it changes when a convention changes, not as the project progresses.

| Page                                                                            | Holds                                                                          |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [01 Conventions](./01%20Conventions.md)                                         | Portable conventions that apply regardless of which AI tool is used            |
| [03 Engineer Role](./03%20Engineer%20Role.md)                                   | The engineer/AI division of labour — creative direction vs. workflow execution |
| [04 AI Coding Tool Compatibility](./04%20AI%20Coding%20Tool%20Compatibility.md) | How harness concepts map to each AI coding agent's primitives                  |
| [05 Getting Started](./05%20Getting%20Started.md)                               | First-time setup and daily commands for the monorepo                           |
| [06 MCP Setup](./06%20MCP%20Setup.md)                                           | Connecting Claude Code to AWS, GitHub, and Atlassian via MCP                   |

### Documentation

| Page                                                  | Holds                                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [01 Principles](./Documentation/01%20Principles.md)   | Why these principles exist, what they are, and which structure fits which doc type |
| [02 Structure](./Documentation/02%20Structure.md)     | The four-tier model — what each tier is for and what lives where                   |
| [03 HLD Intent](./Documentation/03%20HLD%20Intent.md) | Required C4 container abstraction and semantic coverage for HLD container docs     |
| [04 LLD Intent](./Documentation/04%20LLD%20Intent.md) | Required C4 component abstraction and semantic coverage for LLD component docs     |
| [05 NFR Intent](./Documentation/05%20NFR%20Intent.md) | Required semantic coverage and acceptance-evidence contract for NFR pillar docs    |

### Lifecycles

| Page                                                                       | Holds                                                                                               |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [00 Overview](./Lifecycles/00%20Overview.md)                               | The four lifecycles, how they interact, and when to use each one                                    |
| [01 Dev Lifecycle](./Lifecycles/01%20Dev%20Lifecycle.md)                   | Plan → Implement → Test → Document — ticket to merged, documented code                              |
| [02 Design Lifecycle](./Lifecycles/02%20Design%20Lifecycle.md)             | Frame → Research → Evaluate → Solution → Review Gate → Address Feedback → Publish — approved design |
| [03 Evolve Lifecycle](./Lifecycles/03%20Evolve%20Lifecycle.md)             | Reflect → Triage → Draft → Validate → Adopt — grows the shared convention library                   |
| [04 Architecture Lifecycle](./Lifecycles/04%20Architecture%20Lifecycle.md) | Periodic audit commands — gaps between design, implementation, docs                                 |
| [05 Documents Flow](./Lifecycles/05%20Documents%20Flow.md)                 | How documentation is born, refined, and graduates to its permanent home                             |

### Infrastructure

| Page                                                       | Holds                                            |
| ---------------------------------------------------------- | ------------------------------------------------ |
| [04 Giscus Setup](./Infrastructure/04%20Giscus%20Setup.md) | Manual comments-widget setup and reconfiguration |
