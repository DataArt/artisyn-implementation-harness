# harness-bootstrap-e2e

Test suite for the `harness-bootstrap` skill (`.canonical-implementation-harness/`)
itself — the thing that installs/patches this platform's own AI-dev harness
into a project. Combines normal software testing with AI-skill evaluation:
deterministic checks wherever possible, real subagent runs only where no
deterministic script can substitute for the skill's actual judgment.

## Three layers

| Layer       | Nx target     | What it exercises                                                                                                                                                                                                                               | Real agent spend? | Cached? |
| ----------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- |
| Unit        | `unit`        | The skill's own deterministic scripts (`materialize-launch.mjs`, `plan-provider-launch.mjs`, `provider-adapter.mjs`) directly, in isolated fake projects. Ported from `scripts/tests/*.test.mjs`.                                               | No                | Yes     |
| Integration | `integration` | Launch's deterministic half (`Q&A → plan → materialize-launch.mjs → INTENT → verify`) against a hand-built plan standing in for Q&A, plus grader-level specs. No subagent — a plan's `knowns` substitute for a completed Q&A.                   | No                | Yes     |
| Agent E2E   | `agent-e2e`   | The skill's actual judgment: real `claude -p "/harness-bootstrap ..."` calls against isolated fixtures. The only way to test harvest/prepare/apply (no script backs those at all) or whether launch's Q&A/INTENT reasoning is actually correct. | **Yes**           | Never   |

Run them:

```sh
yarn nx run harness-bootstrap-e2e:typecheck
yarn nx run harness-bootstrap-e2e:lint
yarn nx run harness-bootstrap-e2e:unit
yarn nx run harness-bootstrap-e2e:integration
yarn nx run harness-bootstrap-e2e:agent-e2e   # real claude CLI calls, costs money, run deliberately
yarn nx run harness-bootstrap-e2e:eval        # structured JSON report for the deterministic BOOT-* cases
```

Run a single agent-e2e case by name (`testNamePattern` is a vitest `-t` filter,
matched against the full `describe > it` name) instead of all three — useful
when you're near a usage limit or just iterating on one case:

```sh
yarn nx run harness-bootstrap-e2e:agent-e2e --testNamePattern="BOOT-006"
```

Before spending real agent budget on a case, sanity-check it actually
resolves with a read-only list (never invokes `claude`, never costs
anything):

```sh
cd apps/harness-bootstrap-e2e
npx vitest list --config vitest.agent-e2e.config.ts -t "BOOT-006"
```

Note: `nx ... --dry-run` is **not** a real flag for this target — `nx:run-commands`
silently ignores unrecognized flags and runs the command anyway. Use
`vitest list` above to check without spending anything, never `--dry-run`.

## Why deterministic and agent-e2e are separate

Launch has a real deterministic core (`materialize-launch.mjs`/`provider-adapter.mjs` —
pure Node, no LLM). Patch (harvest/prepare/apply) has **no script at all**:
hashing, diffing, and manifest construction are done live by the agent
following `references/patch/*.md`. So:

- Anything testable without an LLM lives in `integration`/`unit` — fast, free, safe to cache, safe for CI.
- Anything that requires the skill to actually reason (Q&A inference, INTENT derivation, harvest generalization, patch prepare/apply) can only be tested by really invoking the selected host CLI (`claude` or `codex`), in `agent-e2e` — slow, costs real money, deliberately excluded from CI/caching.

## Directory layout

```
src/
├── testkit/          Reusable fixture/plan-building/assertion primitives
│   ├── fixture.ts        createFixture(name) / installSkillPackage(ws) — isolated scratch copies
│   ├── build-launch.ts   runStubbedLaunch/rematerialize/finalizeStubbedLaunch — the deterministic launch path
│   ├── eval-case.ts      EvalCase type + runEvalCase() — case/report model
│   └── harness-assertions.ts   expectHarness(result).toHave...() fluent API
├── graders/           Pure functions: (filesystem state | event transcript) -> GradeResult
│   ├── filesystem.grader.ts     exists/absent path checks
│   ├── state.grader.ts          launch materialization/verification receipts
│   ├── references.grader.ts     installed-doc cross-references resolve on disk
│   ├── projection.grader.ts     Claude vs Codex projections stay semantically identical
│   ├── patch.grader.ts          patch bundle contract (schema v2: manifest/hashes/diff-apply)
│   ├── agent-behavior.grader.ts task tracking used, no plan-mode during automated runs
│   └── docs-adoption.grader.ts  README budget, HLD/LLD coverage, per-container agents
├── agent-runners/      Headless CLI invocation
│   ├── run-claude-skill.ts   spawns `claude -p --output-format stream-json`, live progress, full event transcript
│   └── run-codex-skill.ts    spawns `codex exec --json`, workspace-write sandbox, full event transcript
├── cases/
│   ├── unit/           Ported scripts/tests/*.test.mjs, now vitest specs
│   ├── integration/    BOOT-001..005 (stubbed launch, hand-built plans)
│   └── e2e/            BOOT-006/007, PATCH-001 (real claude CLI calls)
└── bin/run-evals.ts    CLI: run named cases, print one JSON report line each
```

## Fixtures

Never run against a fixture directly — `createFixture(name)` copies it into a
fresh OS-tmpdir scratch workspace per test.

- **`nx-monorepo/`** — minimal single-container Nx project root. Used by the stubbed BOOT-001..005 cases, which exercise the real canonical skill/agent content (packaged as a release-shaped ZIP and extracted fresh every run) but skip Q&A/INTENT judgment.
- **`multi-container-project/`** — four real containers (`fe`→react, `be`→express, `infra`→aws-cdk-lib, `mobile`→react-native), each with genuine `package.json` evidence, **no `docs/` at all**. Used by BOOT-006/007: the agent must discover all four containers from evidence and generate README/HLD/LLD/per-container-agent docs itself — nothing is pre-seeded to grade against. See `FIXTURE.md` inside it for exactly what's expected afterward.
- **`installed-harness/`** — reserved, not yet populated (see its `README.md`).

Debug tip: set `HB_E2E_KEEP_TMP=1` to land scratch workspaces under `<repo>/tmp/`
(gitignored) instead of the OS tmpdir, and skip cleanup, so you can inspect
what a run actually produced:

```sh
HB_E2E_KEEP_TMP=1 yarn nx run harness-bootstrap-e2e:integration
```

## Cases

| Case           | Layer       | What it proves                                                                                                                                                                                                                                               |
| -------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BOOT-001 / 002 | integration | Materialize + provider-adapter render correctly for Claude / Codex alone                                                                                                                                                                                     |
| BOOT-003       | integration | **Primary CI smoke.** Claude and Codex projections of the same canonical source stay semantically identical (name/description/tool-derived sandbox mode), only the declared `{{provider:*}}` substitutions differ                                            |
| BOOT-004       | integration | Repeating the same materialize run is a true no-op — no duplicate registrations, byte-identical receipt                                                                                                                                                      |
| BOOT-005       | integration | An existing `.claude/settings.json`/`.codex/config.toml` is scheduled for reconciliation (`derived_outputs`), never silently rewritten                                                                                                                       |
| BOOT-006 / 007 | agent-e2e   | BOOT-006 runs Claude; BOOT-007 runs Codex. Each bootstraps `multi-container-project` for its own provider — container discovery, task tracking, no stray plan-mode, docs adoption, all graded for real                                                       |
| PATCH-001      | agent-e2e   | Real `patch prepare` in project A → bundle → transfer only the bundle folder → real `patch apply` in project B. Proves actual cross-project portability, not just the bundle format in isolation (`patch.grader.spec.ts` covers that half deterministically) |

## Adding a new case

1. Pick the cheapest layer that can prove what you actually care about — reach for `agent-e2e` only when no script/deterministic path can substitute for real judgment.
2. Write graders as pure functions returning `GradeResult` (`{ grader, pass, failures }`) in `src/graders/`, with their own `*.grader.spec.ts` proving both the pass and fail path against synthetic input — don't gate a grader's first test on a live agent run.
3. Wire the case into its layer's `*.spec.ts` and, if it should be runnable standalone, into `src/bin/run-evals.ts`'s registry.
4. Run `vitest list --config vitest.<layer>.config.ts` to confirm it resolves before spending real agent budget on it.

Fixtures copy the authoring package contents directly into the selected host's skill
directory (`.agents/skills/harness-bootstrap/` or `.claude/skills/harness-bootstrap/`).
This keeps fixture setup simple; consumer projects install the distributed release ZIP
into `.agents/skills/` or `.claude/skills/`. Fixture workspaces never contain a
`.canonical-implementation-harness/` directory. Execution host and output provider are separate case fields.
Codex uses existing CLI authentication with noninteractive workspace-write permissions.
The agent E2E selects `gpt-6-sol` so an incompatible global model alias cannot prevent
startup; set `HB_E2E_CODEX_MODEL` to another model supported by the signed-in Codex
account, such as `gpt-6-luna`, when needed. Initialization or authentication failures
identify the host.
