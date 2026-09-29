# harness-bootstrap-e2e

Tests for the `harness-bootstrap` authoring package in
`.canonical-implementation-harness/`. Deterministic tests exercise scripts and
contracts; agent E2E cases exercise the skill through real Claude or Codex CLI
sessions in disposable projects.

## Test layers and CI

| Layer       | Nx target     | Coverage                                                                                           | Live agents | Nx caching |
| ----------- | ------------- | -------------------------------------------------------------------------------------------------- | ----------- | ---------- |
| Unit        | `unit`        | Materializer/provider scripts, fixture and scenario helpers, grader pass/fail behavior             | No          | Enabled    |
| Integration | `integration` | Stubbed launch plans, materialization, simulated adaptation, finalization and provider projections | No          | Enabled    |
| Agent E2E   | `agent-e2e`   | Real bootstrap reasoning and patch prepare/apply across projects                                   | Yes         | Disabled   |

The `test` target depends on `unit` and `integration`. The pull-request workflow
in [ci.yml](../../.github/workflows/ci.yml) runs affected `test` targets between
typecheck and build. Live agent E2E runs are separate and use CLI authentication
and model usage from the developer's environment.

Run from the repository root:

```sh
yarn nx run harness-bootstrap-e2e:typecheck
yarn nx run harness-bootstrap-e2e:lint
yarn nx run harness-bootstrap-e2e:test
yarn nx run harness-bootstrap-e2e:unit
yarn nx run harness-bootstrap-e2e:integration
```

Cached deterministic runs can finish quickly. To execute them again:

```sh
yarn nx run harness-bootstrap-e2e:test --skip-nx-cache
```

## Directory layout

```text
fixtures/
├── registry.ts                 Typed fixture facts and container definitions
├── nx-monorepo/                Deterministic launch and patch baseline
├── multi-container-project/    Four-container greenfield bootstrap fixture
└── installed-harness/          Reserved, unpopulated feature-flow fixture
src/
├── cases/                      Agent E2E specs directly in this directory
│   └── registry.ts             Case IDs and paths; no test registration on import
├── scenarios/
│   ├── bootstrap.ts            Bootstrap scenario and input validation
│   ├── boot-e2e.shared.ts      Host invocation and bootstrap grading
│   ├── launch-prompt.ts        Automated bootstrap inputs
│   ├── patch-prepare-apply.ts  Two-workspace patch workflow
│   └── feature-flows.ts        Pending design/dev scenarios
├── agent-runners/              Claude and Codex headless CLI adapters
├── graders/                    Filesystem, transcript and receipt checks
├── testkit/
│   ├── providers.ts            Provider type, constants and filesystem mappings
│   ├── fixture.ts              Scratch workspace creation and package copying
│   ├── build-launch.ts         Stubbed deterministic launch helpers
│   ├── eval-case.ts            Integration EvalCase execution and reporting
│   ├── scenario.ts             Agent E2E case/step execution and reporting
│   └── harness-assertions.ts   Fluent launch assertions
└── tests/
    ├── unit/                   Script, testkit and grader specs
    │   └── graders/
    └── integration/            BOOT-001–005 definitions and aggregate spec
```

Each layer has its own Vitest configuration:
`vitest.unit.config.ts`, `vitest.config.ts` (integration), and
`vitest.agent-e2e.config.ts`. Unit and integration tests live outside the E2E
case registry. Grader specs live under `src/tests/unit/graders/` beside the other
unit tests. E2E execution uses Vitest directly through Nx; the former standalone
`src/bin/run-evals.ts` runner has been removed.

## Fixtures and providers

`fixtures/registry.ts` defines each fixture's ID, path, project name, purpose,
population state, existing harness/docs state, and containers with stack and
source evidence. Cases pass the full definition to `createFixture()`; reports
record its ID. Fixture facts describe the starting repository, while requested
integrations and lifecycles belong to case inputs.

| Fixture                   | Starting state                                                                     | Usage                                              |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| `nx-monorepo`             | Minimal single-container Nx-shaped repository                                      | Deterministic BOOT-001–005 and patch prepare/apply |
| `multi-container-project` | `fe`, `be`, `infra`, `mobile` manifests; no architecture docs or installed harness | Claude and Codex greenfield bootstrap              |
| `installed-harness`       | Reserved; not populated                                                            | Pending design/dev cases                           |

`createFixture()` copies source files into a unique scratch workspace. Tests
never operate directly on fixture sources; unpopulated fixtures fail explicitly.
`installSkillPackage()` copies the current authoring package into the selected
host's skill directory and excludes package `state`. Consumer release-ZIP
installation is a separate workflow. Scratch projects do not contain an
`.canonical-implementation-harness/` authoring directory.

`src/testkit/providers.ts` centralizes `PROVIDERS`, the shared `Provider` type,
and `PROVIDER_DETAILS`: display names, skill and agent paths, instruction files,
settings, extensions and invocation prefixes. Host and output provider are
separate case fields: the host selects the CLI and bootstrap discovery path;
the provider selects the installed harness format.

## Cases, scenarios and steps

A case is the top-level runnable E2E unit. Its `CaseDefinition` selects a
`ScenarioDefinition`, fixture, configuration and optional host, provider and
feature. Each descriptively named `src/cases/<id>.spec.ts` exports its definition
and declares an ordinary Vitest test. Registry entries contain only IDs and paths.

A scenario defines ordered steps plus optional setup and cleanup. `runCase()`
shares an artifact map between steps and returns overall and per-step outcomes,
grader results, failures and durations. Outcomes are `passed`, `failed` or
`blocked`. A failed or blocked step blocks dependent steps; missing step
implementations are blocked; an empty grader result fails. Setup and cleanup
failures are included in the report. The patch step owns two isolated workspaces.

| Case IDs                                                                    | Scenario              | Implementation                                                                        |
| --------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `boot-claude-from-scratch-greenfield`, `boot-codex-from-scratch-greenfield` | `bootstrap`           | Live launch of `multi-container-project` with `aws-dev`, Dev lifecycle only           |
| `patch-prepare-apply`                                                       | `patch-prepare-apply` | Claude prepare in project A, transfer only the bundle, then Claude apply in project B |
| `design-dev-claude`, `design-dev-codex`                                     | `design-dev`          | `it.todo`: design feature, then develop feature                                       |
| `dev-claude`, `dev-codex`                                                   | `dev-only`            | `it.todo`: develop feature from existing artifacts                                    |

Greenfield means no prior harness or architecture docs; application manifests
already exist. Bootstrap currently validates the specific fixture/configuration
combination and supported hosts/providers. Feature-flow cases remain pending
and invoke no agents. Their fixture, prompts, approval handoff and graders still
need implementation. A combined bootstrap → design → dev scenario is future work.

## Running agent E2E

List cases before executing them:

```sh
yarn nx run harness-bootstrap-e2e:agent-e2e --mode=list
yarn nx run harness-bootstrap-e2e:agent-e2e --case=boot-codex-from-scratch-greenfield --mode=list
```

Run a selected case:

```sh
yarn nx run harness-bootstrap-e2e:agent-e2e --case=boot-claude-from-scratch-greenfield
yarn nx run harness-bootstrap-e2e:agent-e2e --case=boot-codex-from-scratch-greenfield
yarn nx run harness-bootstrap-e2e:agent-e2e --case=patch-prepare-apply
```

Omitting `--case` selects all E2E specs, including the live patch workflow and
pending feature-flow tests. `--mode=list` does not invoke agents. Do not use
`--dry-run` as a listing substitute: this `nx:run-commands` target does not provide
that guarantee.

From `apps/harness-bootstrap-e2e`, a spec can also be run directly:

```sh
yarn vitest run --config vitest.agent-e2e.config.ts src/cases/boot-codex-from-scratch-greenfield.spec.ts
```

Runners print live progress and preserve transcript diagnostics. Codex runs with
workspace-write permissions and noninteractive approval policy, using the
caller's CLI authentication. The runner passes `--model gpt-6-sol` by default;
`HB_E2E_CODEX_MODEL` overrides this argument. Bootstrap allows up to 60 minutes
for the CLI run; E2E Vitest timeouts are 65 minutes and spec files run serially.
A failed child-agent dispatch does not itself stop the main CLI process; the
runner waits for process completion and then grades the outputs.

## Graders and result interpretation

Graders return `{ grader, pass, failures }`. Bootstrap checks task tracking,
absence of plan mode, required files, launch state, references, INTENT cleanup,
project/provider placeholder resolution, README budget, AWS MCP, Codex planning
configuration, app architecture links, HLD container coverage, docs index and
per-container agents. Claude bootstrap runs 14 checks; Codex adds the planning
configuration check for 15. Integration also checks cross-provider projections;
patch graders check schema, hashes and diff reconstruction.

The state grader accepts either finalized verification receipts or a documented
partial Stage E checkpoint with current output hashes and local verification.
External gates may be passed or pending/blocked with evidence, but a partial
checkpoint must retain at least one outstanding gate. A passed independent
review with blocked Mermaid rendering is valid; failed review or missing
evidence is rejected. The report must preserve all 14 stages in order, with
stages 1–11 complete, Stage E in progress and dependent stages pending.

**A passing bootstrap test can therefore represent a valid partial installation.**
Read the dated launch report and operation record to distinguish it from a
fully finalized launch. Report-template formatting, Stats and Efforts Spent
sections are not currently enforced by the graders.

All returned checks affect pass/fail, but the result map is keyed by grader name.
Repeated names such as the five `docs-adoption` checks overwrite individual map
entries; failures are still accumulated. `runCase()` returns its report to the
spec; it does not write a separate JSON case report to disk.

## Retaining and inspecting outputs

Normally workspaces live in the OS temporary directory and are cleaned up.
Set `HB_E2E_KEEP_TMP=1` to retain them under the repository's gitignored `tmp/`:

```sh
HB_E2E_KEEP_TMP=1 yarn nx run harness-bootstrap-e2e:agent-e2e --case=boot-codex-from-scratch-greenfield
HB_E2E_KEEP_TMP=1 yarn nx run harness-bootstrap-e2e:integration --skip-nx-cache
```

For bootstrap, inspect these paths under the host's
`.agents/skills/harness-bootstrap/` or `.claude/skills/harness-bootstrap/`:

- `state/launch/<host>-transcript-*.jsonl`: full CLI stdout transcript, saved when the runner exits.
- `state/launch/reports/*-launch.md`: answers, stage progress and blockers.
- `state/launch/runs/<run-id>/`: plan, materialization, optional verification and diagram evidence.
- `state/operations/`: recorded output hashes, local checks and external gates.

Each execution creates a fresh workspace. Retained workspaces accumulate until
removed manually; select the newest directory when reviewing a rerun.

## Deterministic integration coverage

| Test                | Contract                                                                              |
| ------------------- | ------------------------------------------------------------------------------------- |
| BOOT-001 / BOOT-002 | Claude / Codex materialization and provider output                                    |
| BOOT-003            | Both providers from one canonical source; semantic skill/agent projection consistency |
| BOOT-004            | Idempotent rematerialization without duplicate registrations or receipt changes       |
| BOOT-005            | Existing settings/config scheduled for reconciliation rather than silently rewritten  |

These use `EvalCase` and `runEvalCase()` through the aggregate
`boot.integration.spec.ts`, which imports the individual `.test.ts` definitions.
Stubbed plans and adaptation prove deterministic contracts; live cases verify
the agent's discovery and INTENT reasoning.

## Adding coverage

1. Use unit or integration tests for behavior that can be proved deterministically.
2. Keep reusable checks in `src/graders/` and pass/fail regression specs in `src/tests/unit/graders/`.
3. Add fixture facts to `fixtures/registry.ts` and provider mappings to `src/testkit/providers.ts`.
4. For live workflows, reuse or implement a scenario and create `src/cases/<id>.spec.ts` plus its registry entry. Use `it.todo` until the workflow exists.
5. List the selected case before a live run and inspect retained evidence when debugging.
