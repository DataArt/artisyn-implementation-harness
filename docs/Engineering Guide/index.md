# Engineering Guide

Cross-cutting conventions and operational procedures for how work is planned, implemented, reviewed, and published in this repo.

## How This Guide Works

The top-level articles cover conventions and setup — read [02 Doc Structure](./02%20Doc%20Structure.md) first for the full three-tier documentation model this repo follows. [Lifecycles](./Lifecycles/00%20Overview.md) documents the four lifecycles (Dev, Design, Skill, Architecture) that structure all work end to end — also mirrored under [Harness › Lifecycles](/Harness/03%20Lifecycles/00%20Overview.md) as part of the harness's own nav. [Infrastructure](./Infrastructure/00%20Configuration%20%26%20Secrets.md) covers deploy-related operational runbooks. This guide is stable reference material — it changes when a convention changes, not as the project progresses.

| Page                                                                            | Holds                                                                              |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [01 Conventions](./01%20Conventions.md)                                         | Portable conventions that apply regardless of which AI tool is used                |
| [02 Doc Structure](./02%20Doc%20Structure.md)                                   | The four-tier model — what each tier is for and what lives where                   |
| [03 Engineer Role](./03%20Engineer%20Role.md)                                   | The engineer/AI division of labour — creative direction vs. workflow execution     |
| [04 AI Coding Tool Compatibility](./04%20AI%20Coding%20Tool%20Compatibility.md) | How harness concepts map to each AI coding agent's primitives                      |
| [05 Getting Started](./05%20Getting%20Started.md)                               | First-time setup and daily commands for the monorepo                               |
| [06 MCP Setup](./06%20MCP%20Setup.md)                                           | Connecting Claude Code to AWS, GitHub, and Atlassian via MCP                       |
| [07 Documentation Principles](./07%20Documentation%20Principles.md)             | Why these principles exist, what they are, and which structure fits which doc type |

### Lifecycles

| Page                                                                       | Holds                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [00 Overview](./Lifecycles/00%20Overview.md)                               | The four lifecycles, how they interact, and when to use each one        |
| [01 Dev Lifecycle](./Lifecycles/01%20Dev%20Lifecycle.md)                   | Plan → Implement → Test → Document — ticket to merged, documented code  |
| [02 Design Lifecycle](./Lifecycles/02%20Design%20Lifecycle.md)             | Frame → Research → Elaborate → Solution → Publish — approved design     |
| [03 Skill Lifecycle](./Lifecycles/03%20Skill%20Lifecycle.md)               | Reflect → Triage → New → Promote — grows the shared convention library  |
| [04 Architecture Lifecycle](./Lifecycles/04%20Architecture%20Lifecycle.md) | Periodic audit commands — gaps between design, implementation, docs     |
| [05 Documents Flow](./Lifecycles/05%20Documents%20Flow.md)                 | How documentation is born, refined, and graduates to its permanent home |

### Infrastructure

| Page                                                                                     | Holds                                                                                |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [00 Configuration & Secrets](./Infrastructure/00%20Configuration%20%26%20Secrets.md)     | Principles for how environment configuration and secrets flow from source to runtime |
| [01 Local Provisioning Runbook](./Infrastructure/01%20Local%20Provisioning%20Runbook.md) | Step-by-step sequence for provisioning a fresh environment and deploying all apps    |
| [02 Deploy Lifecycle](./Infrastructure/02%20Deploy%20Lifecycle.md)                       | Full sequence from code change to live site                                          |
| [03 CI-CD Pipeline](./Infrastructure/03%20CI-CD%20Pipeline.md)                           | Automated quality gate (CI) and deployment (CD) via GitHub Actions and AWS OIDC      |
| [04 Giscus Setup](./Infrastructure/04%20Giscus%20Setup.md)                               | Manual comments-widget setup and reconfiguration                                     |
