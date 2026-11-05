# Manifest-driven provider launch

`canonical/manifest.json` owns destinations and native formats. `canonical/settings.json`
contains provider-native defaults; `canonical/mcp.json` contains shared server declarations.
Configure selected servers with environment references, never credential values. Empty MCP
configuration is valid. Unsupported fields fail rather than being silently dropped.

Consumer projects obtain the package from the release archive, not by copying
`.canonical-implementation-harness/` from the source repository. Extract the archive
into the selected host's skill directory (`.agents/skills/` or `.claude/skills/`); the
archive creates `harness-bootstrap/` there. Record that package path as `package:`;
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

Read each canonical INTENT directly from the bootstrap package and apply it to the
permanent output, resolving/removing deferred project tokens and conditional sections.
Use the same project decisions for both providers. Do not copy INTENT files into the
consumer project or alter provider mechanics through free-form INTENT reasoning.

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

Include exactly every permanent materialized output and reserved derived output. INTENT
files are authoring inputs in the bootstrap package and must never be materialized in the
consumer project. `runtime_tokens` explicitly lists intentional reusable-template
tokens; it must not hide unresolved project configuration. Evidence is written by the
orchestrator after inspecting real outputs; the finalizer cannot establish semantic truth.

```sh
node <package>/scripts/finalize-launch.mjs --run <id> --evidence <run-dir>/evidence.json --check
node <package>/scripts/finalize-launch.mjs --run <id> --evidence <run-dir>/evidence.json --write
```

The finalizer rejects stale/missing evidence, unresolved undeclared tokens, changed outputs,
and unsafe paths, then writes verification.json. It can remove recorded INTENT copies from
older plans for migration compatibility; current plans never create them. Interrupted
cleanup is retryable. Missing human/runtime checks remain pending in the report; do not
label them passed to force closure.

On resume, retain adapted files and inspect receipts; do not rematerialize over them.
Use a new linked run for a changed plan. Preserve state/ across package updates and exclude
it from portable releases. Legacy `.harness/launch/` records are migration inputs only.

## Checkpoint when Stage E is externally blocked

When local adaptation and checks are complete but independent review and Mermaid
rendering are blocked, keep the launch report **In progress**. Its 14-row Progress
table is authoritative: rows 1–11 complete, Stage E in progress, cleanup and F/G
pending. Include `Run ID: <id>` in report metadata and mirror these statuses in the
provider's native tracker. Icons and bullet/table metadata are presentation only.

Persist a partial operation in `state/operations/<operation-id>.json` using this shape:

```json
{
  "schema_version": 1,
  "id": "<operation-id>",
  "mode": "launch",
  "run_id": "<id>",
  "status": "partial",
  "plan_sha256": "<from materialization.json>",
  "outputs": [
    {
      "target": "<permanent output path relative to project>",
      "sha256": "<current file hash>",
      "status": "locally_verified"
    }
  ],
  "checks": {
    "local": { "status": "passed", "evidence": "<checks actually performed>" },
    "independent_review": { "status": "blocked", "evidence": "<actual dispatch failure>" },
    "mermaid": { "status": "blocked", "evidence": "<actual rendering failure>" }
  }
}
```

Include exactly every permanent materialized and reserved derived output, with its
current hash. Record the actual outcome of each gate; the example's blocked statuses
apply only when both gates failed externally. This checkpoint is not a verification
receipt or a completed launch. Do not use it to defer unfinished adaptation, missing
outputs, or failed local checks. Resume pending gates before final verification and
closure. If an operation also records stage statuses, keep them consistent with the
report.

### Check status vocabulary

`status` is a closed set. Use exactly one of these values — do not coin a new
one, and do not qualify it (`passed_with_scope_limit`, `partially_passed` and
similar are rejected):

| Status    | Meaning                                              |
| --------- | ---------------------------------------------------- |
| `passed`  | The gate ran and its outcome was accepted.           |
| `pending` | The gate has not run yet and is still expected to.   |
| `blocked` | The gate could not run, or ran and was not accepted. |

`checks.local` must be `passed` with evidence — a partial checkpoint is for
_external_ gates, never for unfinished local work. Each of
`checks.independent_review` and `checks.mermaid` must carry one of the three
statuses **and** non-empty `evidence`, and at least one of them must be
`pending` or `blocked`; an operation where both already passed is a finished
launch, not a checkpoint.

Nuance belongs in `evidence`, not in the status. A reviewer who approves with
a caveat is `passed` with the caveat spelled out:

```json
"independent_review": {
  "status": "passed",
  "evidence": "Reviewer GO after three iterations. Scope limit: accepted as a disposable fixture scaffold, not as a formal product HLD."
}
```

A reviewer whose caveat means the work is _not_ accepted is `blocked`, with the
reason as evidence. If the distinction is unclear, prefer `blocked`: it keeps
the launch honestly in progress rather than closing it on a qualified approval.

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
