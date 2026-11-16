---
id: ca3a865c
purpose: Design intent for the Harness Bootstrap E2E container — the test harness validating the implementation-harness skill package and the repo's release tooling
keywords: [harness-bootstrap-e2e, implementation-harness, testing, release-tooling, hld]
---

# Harness Bootstrap E2E Container

Test harness validating the `implementation-harness` skill package (`skills/implementation-harness/`) and the repo's release tooling: deterministic unit and integration coverage of the package's scripts, install CLI, migrator and release gates, plus live agent E2E runs that drive the skill through real Claude or Codex CLI sessions against disposable fixture workspaces. The Nx project keeps its historical name `harness-bootstrap-e2e`.

## Baseline diagram

```mermaid
flowchart LR
    GH(["⚙️ GitHub Actions\nci.yml"]):::ci

    subgraph DET ["  Deterministic — Nx-cached, no live agents  "]
        UNIT["🧪 unit\nscripts, fixtures, graders,\nstate root, CLI, migrator, release gates"]:::test
        INT["🧪 integration\nstubbed launch/patch"]:::test
    end

    subgraph AGENT ["  Agent E2E — uncached, live model usage  "]
        FIX["📁 fixtures/\nscratch workspace copy"]:::fixture
        ENG["⚙️ engine\nCaseRun · ScenarioRun · StepRun"]:::engine
        RUN["🤖 agent-runners\nClaude/Codex CLI adapter"]:::runner
        GRD["✅ graders\nfilesystem/transcript/receipt checks"]:::grader
        REP["📄 runs/<case>/report.json"]:::report
    end

    PKG[("skills/implementation-harness/\nskill package under test")]:::pkg

    GH -->|"nx affected --target=test"| UNIT
    GH --> INT
    UNIT -.->|"exercises"| PKG
    INT -.->|"exercises"| PKG

    ENG -->|"createFixture()"| FIX
    ENG -->|"launchAgent()"| RUN
    RUN -->|"drives"| PKG
    RUN -->|"transcript"| ENG
    ENG --> GRD
    ENG --> REP

    classDef ci      fill:#E0E7FF,stroke:#4338CA,color:#1e1b4b,font-weight:bold
    classDef test    fill:#D1FAE5,stroke:#059669,color:#064e3b
    classDef fixture fill:#CFFAFE,stroke:#0891B2,color:#164e63
    classDef runner  fill:#EDE9FE,stroke:#7C3AED,color:#4c1d95
    classDef engine  fill:#DBEAFE,stroke:#2563EB,color:#1e3a8a
    classDef grader  fill:#FEF3C7,stroke:#D97706,color:#78350f
    classDef report  fill:#FFE4E6,stroke:#E11D48,color:#881337
    classDef pkg     fill:#FCE7F3,stroke:#DB2777,color:#831843

    style DET   fill:#ECFDF5,stroke:#059669,color:#064e3b
    style AGENT fill:#EEF2FF,stroke:#4338CA,color:#1e1b4b
```

Agent E2E runs are not triggered by `ci.yml` — they use the developer's own CLI authentication and model usage (`yarn nx run harness-bootstrap-e2e:agent-e2e`, a guarded command).

## Responsibilities

- Deterministic unit tests (no live agent, Nx-cached) over the package's scripts, install CLI, state-root and migration libraries, fixture/scenario helpers and grader logic, and over the repo's release tooling (stamping, scope and rename gates, pack allowlist, plugin validation, workflow definitions) — the release-tooling coverage is an accepted widening of the original package-only scope (DEV-20261115-5DUE plan sign-off)
- Deterministic integration tests over stubbed launch plans, materialization, simulated adaptation, finalization, and cross-provider projections
- Agent E2E cases that drive real Claude/Codex CLI sessions against disposable fixture workspaces, grade the resulting filesystem/transcript/receipt state, and persist a per-case `report.json`
- Validates `skills/implementation-harness/` as a whole — scripts, canonical templates, patch harvest/prepare/apply, install CLI, migration — never the deployed site containers (Web/Discuss)

## Technology

| Component        | Choice                                                        |
| ---------------- | ------------------------------------------------------------- |
| Test runner      | Vitest, three separate configs (unit, integration, agent-e2e) |
| Orchestration    | Nx (`unit`, `integration`, `agent-e2e`, `test` targets)       |
| Agent invocation | Claude/Codex headless CLI adapters (`agent-runners/`)         |
| Language         | TypeScript                                                    |

## Boundary contracts

- Input: fixture workspaces under `fixtures/` (seeded, disposable copies of the skill package's target repositories), case/scenario definitions under `src/cases/` and `src/scenarios/`
- Output: per-case `runs/<case>/report.json`; CI-visible pass/fail from `unit`/`integration` (via the `test` target, which `ci.yml` runs through `nx affected --target=test`, between the affected typecheck and build steps); the `harness-cli` CI job additionally runs the install-CLI, migrator and state-root specs on Linux, macOS and Windows runners
- Guarantee: deterministic layers (`unit`, `integration`) never invoke a live model and are Nx-cached (`cache: true` in `project.json`); agent E2E is explicitly uncached (`cache: false`) and guarded — it never runs in CI, only when a developer deliberately spends agent budget
- Guarantee: fixtures are read-only sources — `createFixture()` copies each one into a disposable scratch workspace per case; no test target writes back into `skills/implementation-harness/` or a fixture's checked-in source

## Key paths

| Path                                            | Purpose                                                      |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `apps/harness-bootstrap-e2e/fixtures/`          | Deterministic launch/patch baseline + greenfield fixtures    |
| `apps/harness-bootstrap-e2e/src/cases/`         | Agent E2E case specs                                         |
| `apps/harness-bootstrap-e2e/src/scenarios/`     | What each case runs and checks                               |
| `apps/harness-bootstrap-e2e/src/engine/`        | The only stateful layer — step loop, grading, report writing |
| `apps/harness-bootstrap-e2e/src/graders/`       | Filesystem/transcript/receipt checks, grouped by concern     |
| `apps/harness-bootstrap-e2e/src/agent-runners/` | Claude/Codex CLI adapters                                    |

## Constraints

- Agent E2E must never run automatically in CI — it spends real agent budget and is listed as a guarded command in `CLAUDE.md`
- Deterministic layers (`unit`, `integration`) must never invoke a live model — any real CLI/model call belongs in `agent-e2e` only
- Case IDs and scenario IDs are centralized in `src/cases/_registry.ts` and `src/scenarios/_registry.ts` — no test registers itself by import side effect elsewhere
