---
okf_version: '0.2'
---

# Engineering Guide

- [Engineering Guide Overview](00%20Overview.md) - Landing page and navigation index for the Engineering Guide's conventions, documentation, lifecycles, and infrastructure sections
- [Conventions](01%20Conventions.md) - Portable conventions for root context files, skill authoring, doc naming, and commit messages
- [Engineer Role](03%20Engineer%20Role.md) - How the engineer and the AI assistant divide ownership and responsibility during delivery
- [AI Coding Tool Compatibility](04%20AI%20Coding%20Tool%20Compatibility.md) - How harness skills, agents, and settings map to each supported AI coding tool's native files, and which install channel serves each host
- [Getting Started](05%20Getting%20Started.md) - First-time workspace setup and the daily NX commands used to run and check this monorepo
- [MCP Setup](06%20MCP%20Setup.md) - How to generate and wire MCP credentials so Claude Code can reach AWS, GitHub, and Atlassian
- [Branching Strategy](07%20Branching%20Strategy.md) - The trunk-based branching model, naming conventions, the harness release tag, the main ruleset, and how branches map to CI/CD and environments
- [Log Hub Setup](07%20Log%20Hub%20Setup.md) - What Log Hub uploads, the consent it requires, and how to run or target a Log Hub server (local init+serve, an already-running local server, or a remote server) before installing the Claude Code hook
- [Harness Release Runbook](08%20Harness%20Release%20Runbook.md) - Developer/admin runbook for the harness release lane (deploy-harness.yml): the main ruleset (web deployment, five required checks, the accepted owner bypass) and the 2026-11-17 cutover record, the release environment with required reviewers, the v<version> tag format and the v4.0.2 bridge tag, the per-PR yarn harness:version step, the automatic build on merge, the approval that starts publish, the publish-npmjs stub and its npmjs.com setup, the first 4.0.0 release and the per-channel smoke checklist
- [CI/CD](09%20CI-CD.md) - The single home for this repo's CI/CD: every GitHub Actions workflow (ci-web.yml on every PR and its gitleaks job on push to main, ci-harness.yml with its in-job harness filter, deploy-web.yml and deploy-harness.yml on merge), their jobs, permissions and credentials, the environments (web, github-pages, release), the secret scan on PRs and on push to main and the accepted owner bypass, required vs advisory checks, how to reproduce each gate locally, and the one release lane with its approval gate and the publish-npmjs stub

## Documentation

- [Documentation Principles](Documentation/01%20Principles.md) - Why these principles exist, what they are, and how every doc writer applies them
- [Documentation Structure](Documentation/02%20Structure.md) - The three-tier documentation model — what each tier is for, its folder layout, and what lives where
- [HLD Intent](Documentation/03%20HLD%20Intent.md) - Required C4 container abstraction and the five semantic coverage keys an HLD container doc must satisfy
- [LLD Intent](Documentation/04%20LLD%20Intent.md) - Required C4 component abstraction and the five semantic coverage keys an LLD component doc must satisfy
- [NFR Intent](Documentation/05%20NFR%20Intent.md) - Required semantic coverage and acceptance-evidence contract for NFR pillar documents
- [Terminology](Documentation/07%20Terminology.md) - The approved term registry for project concepts that have more than one plausible name

## Lifecycles

- [Implementation Harness — Lifecycle Overview](Lifecycles/00%20Overview.md) - The four harness lifecycles, how they interact, and when to use each one
- [Dev Lifecycle — Context → Ceremony → Plan → Implement → Test → Document → Completion](Lifecycles/01%20Dev%20Lifecycle.md) - The Dev lifecycle's seven stages, invariants, patterns, and approval model for delivering a ticket
- [Design Lifecycle — Context Gathering → Ceremony → Frame → Research → Evaluate → Solution → Review → Address Feedback → Publish → Completion](Lifecycles/02%20Design%20Lifecycle.md) - The Design lifecycle's phases, invariants, and patterns for producing an approved architectural design
- [Evolve Lifecycle](Lifecycles/03%20Evolve%20Lifecycle.md) - How the Evolve lifecycle captures friction and requests and turns them into validated harness improvements
- [Architecture Lifecycle — Audit Commands](Lifecycles/04%20Architecture%20Lifecycle.md) - The periodic audit commands that surface gaps between design, implementation, and documentation
- [Documents Flow](Lifecycles/05%20Documents%20Flow.md) - How documentation is born in Stories, refined, and graduates to its permanent home

## Infrastructure

- [Giscus Setup](Infrastructure/04%20Giscus%20Setup.md) - Manual runbook for wiring up or reconfiguring the giscus comments widget
