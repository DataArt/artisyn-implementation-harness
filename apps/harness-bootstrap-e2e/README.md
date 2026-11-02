# harness-bootstrap-e2e

Tests for the `harness-bootstrap` authoring package in
`.canonical-implementation-harness/`. Deterministic tests exercise scripts and
contracts; agent E2E cases exercise the skill through real Claude or Codex CLI
sessions in disposable projects.

## Links

→ `docs/Target Architecture (HLD)/v1/Containers/Harness Bootstrap E2E.md` — HLD for this container (responsibilities, technology, boundary contracts)
→ `docs/System Architecture (LLD)/Harness Bootstrap E2E/00. Overview.md` — LLD: fixtures, cases/scenarios, engine, agent-runners, graders

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
├── _registry.ts                Typed fixture facts and container definitions
├── nx-monorepo/                Deterministic launch and patch baseline
├── multi-container-project/    Four-container greenfield bootstrap fixture
└── installed-harness/          Reserved, unpopulated feature-flow fixture
src/
├── cases/                      Agent E2E specs directly in this directory
│   ├── _types.ts               CaseDefinition, CaseReport, StepReport, Outcome
│   └── _registry.ts            Case IDs and paths; no test registration on import
├── scenarios/                  Configuration: what to run and what to check
│   ├── _types.ts               ScenarioDefinition, StepDefinition, AgentStep
│   ├── _registry.ts            Every scenario, keyed by id
│   ├── bootstrap.ts            Requirements, one agent step, the grader set
│   ├── launch-prompt.ts        The bootstrap step's prompt
│   ├── patch-prepare-apply.ts  Two-workspace patch workflow (seed/prepare/apply)
│   └── feature-flows.ts        Pending design/dev scenarios
├── agent-runners/              Claude and Codex headless CLI adapters
│   ├── _types.ts               SkillRunner, SkillRunOptions/Result, StreamEvent
│   ├── _registry.ts            The runner for each provider
│   ├── transcript.ts           finalAgentMessage
│   └── run-claude-skill.ts, run-codex-skill.ts
├── graders/                    Filesystem, transcript and receipt checks, by concern
│   ├── _types.ts               GradeResult, GradeContext, GraderBinding, PatchManifest
│   ├── _registry.ts            Single import surface: every binding a scenario can list
│   ├── grading.ts              result(), when(), requireProvider()
│   └── launch-report.ts        Report parsing and run-ID resolution
├── engine/                     Execution — the only stateful layer
│   ├── _types.ts               FoldedGrades, Diagnostics, ScenarioOutcome
│   ├── case-run.ts             CaseRun: requirements, workspaces, CaseReport, runCase()
│   ├── scenario-run.ts         ScenarioRun: step loop, blocking, scenario grading
│   ├── step-run.ts             StepRun: agent invocation, step execution and grading
│   ├── grade.ts                applyGraders, foldGrades, gradeReport
│   ├── run-report.ts           Writes each case's report.json
│   └── diagnostics.ts          Transcript breadcrumbs for failing reports
├── utils/                      Helpers the engine and scenarios lean on
│   ├── constants.ts            Paths, filenames, regexes, timeouts
│   ├── errors.ts  fs.ts  paths.ts
│   ├── providers.ts            Provider type, constants and filesystem mappings
│   ├── fixture.ts              Scratch workspace creation and package copying
│   ├── build-launch.ts         Stubbed deterministic launch helpers
│   ├── run-output.ts           Per-case run directory, fixture dirs, report path
│   └── harness-assertions.ts   Fluent launch assertions
└── tests/
    ├── unit/                   Script, engine, utils and grader specs
    │   └── graders/
    └── integration/            BOOT-001–005, plus eval-case.ts
runs/                           Retained agent-e2e workspaces and reports, per case
```

Each layer has its own Vitest configuration:
`vitest.unit.config.ts`, `vitest.config.ts` (integration), and
`vitest.agent-e2e.config.ts`. Unit and integration tests live outside the E2E
case registry. Grader specs live under `src/tests/unit/graders/` beside the other
unit tests. E2E execution uses Vitest directly through Nx; the former standalone
`src/bin/run-evals.ts` runner has been removed.

## Fixtures and providers

`fixtures/_registry.ts` defines each fixture's ID, path, project name, purpose,
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

`src/utils/providers.ts` centralizes `PROVIDERS`, the shared `Provider` type,
and `PROVIDER_DETAILS`: display names, skill and agent paths, instruction files,
settings, extensions and invocation prefixes. Host and output provider are
separate case fields: the host selects the CLI and bootstrap discovery path;
the provider selects the installed harness format.

## Cases, scenarios and steps

A case is the top-level runnable E2E unit. Its `CaseDefinition` selects a
`ScenarioDefinition`, fixture, configuration and optional host, provider and
feature. Each descriptively named `src/cases/<id>.spec.ts` exports its definition
and declares an ordinary Vitest test. Registry entries contain only IDs and paths.

**A scenario is configuration, not code.** It declares what it accepts
(`requires`), how many scratch projects it needs (`workspaces`,
`installPackage`), its ordered steps, and the graders to evaluate. There is
deliberately no `setup`/`cleanup` hook: the engine creates and disposes the
workspaces, and anything else a scenario needs to prepare is simply its first
step — which is what the patch scenario's `seed` step is for.

A step declares an agent invocation as config, arbitrary `run` code, or both;
the agent goes first, so `run` sees its result on the context:

```ts
steps: [
  {
    id: 'launch',
    agent: { prompt: (c) => buildScratchLaunchPrompt(...), timeoutMs: AGENT_RUN_TIMEOUT_MS },
    graders: [agentRunSucceeded()],
  },
];
```

`StepRun` resolves the host's CLI adapter from `agent-runners/_registry.ts`,
writes the transcript and records the result. A non-zero exit is **not** a
throw — it is reported by `agentRunSucceeded()`, so a failed launch is a
graded outcome like any other.

Outcomes are `passed`, `failed` or `blocked`. A failed or blocked step blocks
dependent steps; a step with neither `agent` nor `run` is blocked; a run that
grades nothing fails; a case the scenario's `requires` rejects fails before
any workspace is created.

Execution mirrors that nesting, one class per level — definitions stay plain
data, and these three are the only stateful pieces:

| Class         | File                     | Owns                                                                        |
| ------------- | ------------------------ | --------------------------------------------------------------------------- |
| `CaseRun`     | `engine/case-run.ts`     | Requirement checks, workspace creation and disposal, the final `CaseReport` |
| `ScenarioRun` | `engine/scenario-run.ts` | The step loop, blocking, and the scenario's own graders                     |
| `StepRun`     | `engine/step-run.ts`     | One step's `StepContext`, its agent invocation, execution and graders       |

Each step gets its own `StepContext`, but the `GradeContext` inside it is the
run's single shared object: a step returns a patch, which is merged in, so
later steps and the scenario's own graders see what earlier steps discovered.
`context.workspaces` holds every scratch project, with `root`/`packageRoot`
pointing at the first. `runCase()` in `engine/case-run.ts` is the entry point
a spec calls.

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
`HB_E2E_CODEX_MODEL` overrides this argument. Every timeout is declared in
`utils/constants.ts`: `AGENT_RUN_TIMEOUT_MS` (60 minutes) budgets the launch
CLI run, `DEFAULT_RUNNER_TIMEOUT_MS` (5 minutes) covers shorter turns such as
patch prepare/apply, and `AGENT_E2E_TEST_TIMEOUT_MS` derives Vitest's limit
from the first so the supervisor always outlasts the run it supervises. Spec
files run serially.
A failed child-agent dispatch does not itself stop the main CLI process; the
runner waits for process completion and then grades the outputs.

## Graders and result interpretation

Graders return `{ grader, pass, failures }`. Each module in `src/graders/`
exports a pure `grade*(…)` function taking explicit arguments — what the unit
specs call — plus a curried factory returning a `GraderBinding`, which is what
a scenario lists. A binding resolves its arguments from the run's
`GradeContext` (workspace root, package root, provider, containers, run ID,
launch transcript, step artifacts), so a scenario stays declarative:

```ts
import { launchState, hldCoversContainers, codexPlanToolConfigured } from '../graders/_registry.ts';

graders: [
  launchState({ verified: true }),
  hldCoversContainers(),
  when((c) => c.provider === PROVIDERS.codex, codexPlanToolConfigured()),
];
```

Each folder keeps its own `_types.ts` and `_registry.ts` — underscored so they
sort to the top of the directory. Types are declared in
the folder that owns them (`graders/_types.ts` holds the whole grading
contract, `scenarios/_types.ts` the authoring contract, `cases/_types.ts` the
case and report shapes), and the registry is the single import surface for
that folder's values. `src/graders/_registry.ts` therefore re-exports every
binding from its concern module, so a scenario imports its checks from one
path rather than a dozen. It carries only the binding factories — the pure
`grade*` functions stay behind their own module, which is what the unit specs
and `utils/harness-assertions.ts` import.

`registries.spec.ts` guards all four against drift: it fails if a grader
module declares a binding the registry does not re-export (or vice versa), if
a scenario is defined but unregistered or keyed under the wrong id, if a
provider has no runner, or if a case spec is missing from the case registry.

A binding may return `null` for "not applicable here" — that's what `when()`
produces — and the runner skips it rather than counting it either way.
Graders attach to a step (evaluated after that step, gating the rest) or to
the scenario (evaluated once every step has passed).

Bootstrap checks task tracking, absence of plan mode, required files, launch
state, references, INTENT cleanup, project/provider placeholder resolution,
README budget, AWS MCP, Codex planning configuration, app architecture links,
HLD container coverage, docs index and per-container agents. Claude bootstrap
runs 14 checks; Codex adds the planning configuration check for 15. The
`launch` step's `agent-run` gate is reported separately, and blocks all of
them when the host CLI exits non-zero. Integration also checks cross-provider
projections; patch graders check schema, hashes and diff reconstruction.

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

All returned checks affect pass/fail. The result map is keyed by grader name,
so **grader IDs must be unique within a step** — `foldGrades()` throws on a
repeat rather than letting a later check overwrite an earlier one. Checks that
share a concern are namespaced (`docs-adoption/hld-containers`,
`patch/bundle-hashes`, `projection/skills`). Both runners share this core, so
the rule holds for `runCase()` and `runEvalCase()` alike. `runCase()` returns
its report to the spec and, for a retained run, appends it to that run's
`report.json` (see below).

## Retaining and inspecting outputs

**Agent E2E runs are kept by default.** A live case costs real money and up to
an hour, so throwing its workspace away on exit would be hostile. Each
invocation writes one directory per case, named for when it ran and which
case produced it:

```text
runs/
└── 2026-10-01T14-32-07-boot-claude-from-scratch-greenfield/
    ├── fixture/        the scratch project the agent worked in
    └── report.json     that case's CaseReport
```

A case that builds more than one project — `patch-prepare-apply`, which needs
a sending and a receiving repo — gets `fixture/` and `fixture-2/` side by side.
Running several cases in one invocation produces one directory each, so they
never overwrite one another's workspaces or results. `report.json` is written
when the case finishes; `fixture*/` is gitignored, the report is not.

Unit and integration still use a throwaway OS temporary directory and clean up
after themselves; they create fixtures constantly and would otherwise bury
`runs/` in noise. Set `HB_E2E_KEEP_TMP=1` to opt those layers into the same
retained layout for a debugging session:

```sh
yarn nx run harness-bootstrap-e2e:agent-e2e --case=boot-codex-from-scratch-greenfield
HB_E2E_KEEP_TMP=1 yarn nx run harness-bootstrap-e2e:integration --skip-nx-cache
```

For bootstrap, inspect these paths under the host's
`.agents/skills/harness-bootstrap/` or `.claude/skills/harness-bootstrap/`
inside `fixture/`:

- `state/launch/<host>-<step>-transcript-*.jsonl`: full CLI stdout transcript, one per agent step, saved when the runner exits.
- `state/launch/reports/*-launch.md`: answers, stage progress and blockers.
- `state/launch/runs/<run-id>/`: plan, materialization, optional verification and diagram evidence.
- `state/operations/`: recorded output hashes, local checks and external gates.

Each execution creates a fresh workspace. Run directories accumulate until
removed manually (`rm -rf apps/harness-bootstrap-e2e/runs`); the newest
timestamp is the most recent run.

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
2. Keep reusable checks in `src/graders/`, grouped by concern, and pass/fail regression specs in `src/tests/unit/graders/`. Export both the pure `grade*` function and a `GraderBinding` factory, re-export the factory from `src/graders/_registry.ts`, and give the check a unique ID. Shared helpers and path/filename constants belong in `src/utils/`, not a second local copy.
3. Add fixture facts to `fixtures/_registry.ts` and provider mappings to `src/utils/providers.ts`.
4. For live workflows, reuse or implement a scenario and create `src/cases/<id>.spec.ts` plus its `_registry.ts` entry. Use `it.todo` until the workflow exists.
5. List the selected case before a live run and inspect retained evidence when debugging.
