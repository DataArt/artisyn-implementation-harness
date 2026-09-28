# Manifest-driven provider launch

`canonical/manifest.json` owns destinations and native formats. `canonical/settings.json`
contains provider-native defaults; `canonical/mcp.json` contains shared server declarations.
Configure selected servers with environment references, never credential values. Empty MCP
configuration is valid. Unsupported fields fail rather than being silently dropped.

The bootstrap package must be inside the target project. It can live in either provider's
skill directory or another project directory. Record that one package path as `package:`;
both providers share `package:state/launch/` history. Scripts resolve their own package directory.
No package path is inferred from the selected provider.

## Prepare a selection

Resolve project facts and Q6 first. Save `selection.json` in `package:state/launch/runs/<id>/`:

```json
{
  "run_id": "example-launch",
  "providers": ["claude", "codex"],
  "skills": ["dev", "design", "evolve", "war", "where-we-are", "x-ray"],
  "agents": [
    { "template": "architect", "name": "architect" },
    { "template": "docs-writer", "name": "docs-writer" },
    {
      "template": "layer",
      "name": "processor",
      "knowns": {
        "LAYER_PATH": {
          "value": "packages/processor",
          "source": "project architecture",
          "status": "verified"
        }
      }
    }
  ],
  "knowns": {
    "PROJECT_NAME": {
      "value": "Example project",
      "source": "package.json",
      "status": "verified"
    }
  }
}
```

Select only applicable skills and roles; the example is not a mandatory installation.
Inspect references to establish writing/review dependencies. Template `layer` may be
instantiated for several named roles; record their separate INTENT adaptations.
Each agent’s optional `knowns` overrides global knowns for that instance only, using
the same value/source/status shape. Its selected name fixes LAYER_NAME.

```sh
node <package>/scripts/plan-provider-launch.mjs --selection <run-dir>/selection.json > <run-dir>/plan.json
node <package>/scripts/materialize-launch.mjs --plan <run-dir>/plan.json --check
node <package>/scripts/materialize-launch.mjs --plan <run-dir>/plan.json --write
```

The planner writes JSON to stdout only. It inventories full skill bundles, renames the
entry template, selects runtime procedures, converts agent frontmatter to native format,
and freezes source/config/adapter hashes. Unresolved project tokens are explicitly
preserved for INTENT adaptation; this is not a ready-to-run installation yet. Review
all existing-target hashes and proposed changes before materialization. Conflicting
local skill edits require explicit reconciliation, not automatic acceptance of a snapshot.

Existing non-identical settings/MCP files become reserved derivations, preserving them
until the orchestrator reconciles the exact changes. New Codex config combines settings
and MCP in one TOML file. Agent model selection inherits the runtime default in Codex;
Claude model hints are not guessed into an OpenAI model. Role tools inform read-only vs
workspace-write sandbox selection, with role instructions preserved; shell access alone
does not imply filesystem write access. Prompt restrictions are not native tool allowlists.

Extend the plan with shared documentation and other reserved outputs before freezing it.
Shared docs are generated once for both providers. Both root instruction files use the
same confirmed project facts, with provider paths and invocation syntax adapted.

## Adapt and verify

Apply canonical INTENT to each permanent bundle, resolving/removing deferred project
tokens and conditional sections. Use the same project decisions for both providers.
Do not alter provider mechanics through free-form INTENT reasoning. Installed temporary
INTENT copies are installation aids; canonical originals remain authoritative.

Native tasks, native planning, delegation and browser tools are capabilities, not promises
made by selecting a provider. Runtime procedures inspect actual availability and preserve
evidence and approval boundaries. Reports in story/design folders remain authoritative
for switching providers; bootstrap state tracks installation only.

Record semantic checks and final file hashes in `<run-dir>/evidence.json`:

```json
{
  "plan_sha256": "<from materialization.json>",
  "outputs": [
    {
      "target": ".agents/skills/dev/SKILL.md",
      "sha256": "<current file hash>",
      "status": "verified",
      "evidence": "Applied dev INTENT; checked project routing and companion references.",
      "runtime_tokens": []
    }
  ],
  "checks": [
    {
      "status": "passed",
      "evidence": "All selected INTENT checks, syntax and reference checks passed; see dated report."
    }
  ]
}
```

Include exactly every permanent materialized output and reserved derived output. Exclude
only temporary INTENT copies. `runtime_tokens` explicitly lists intentional reusable-template
tokens; it must not hide unresolved project configuration. Evidence is written by the
orchestrator after inspecting real outputs; the finalizer cannot establish semantic truth.

```sh
node <package>/scripts/finalize-launch.mjs --run <id> --evidence <run-dir>/evidence.json --check
node <package>/scripts/finalize-launch.mjs --run <id> --evidence <run-dir>/evidence.json --write
```

The finalizer rejects stale/missing evidence, unresolved undeclared tokens, changed INTENT
copies, and unsafe paths. It removes only the run's recorded temporary INTENT copies and
writes verification.json. Interrupted cleanup is retryable. Missing human/runtime checks
remain pending in the report; do not label them passed to force closure.

On resume, retain adapted files and inspect receipts; do not rematerialize over them.
Use a new linked run for a changed plan. Preserve state/ across package updates and exclude
it from portable releases. Legacy `.harness/launch/` records are migration inputs only.

## Disposable bootstrap; permanent runtime

`runtimeSource` is a path relative to canonical/ used only during installation.
The installer copies these procedures into each permanent skill's runtime/ directory.
Agent procedures are copied into the provider's permanent harness-runtime/ directory
(outside agent discovery directories). These are real files, not symlinks or imports
into the bootstrap package. Installed skills/agents never read bootstrap runtime sources.

After verified launch the bootstrap package can be ignored or removed entirely. Its
state/launch history is local installation bookkeeping, not workflow runtime state.
Keep or archive it only if later bootstrap/patch operations need its records. Removing
the package does not remove installed skills, agents, configuration, or story reports.
