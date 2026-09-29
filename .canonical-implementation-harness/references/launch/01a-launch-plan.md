# Launch stages 1–3 — storage, context, knowns, and plan

Stage sequence and tracking live in [01-launch.md](01-launch.md).

## 1. Initialize storage, recover, and inspect

**First launch action:** select `claude`, `codex`, or both, reusing an explicit
selection already supplied by the developer. Record Q6 before provider output planning.
`package:` is the installed bootstrap package directory, independent of the selected targets;
use one package/state directory for both providers. In consumer projects, install it by
extracting the released ZIP archive; do not copy the source-repository directory. In a consumer project, add
`/<package-relative-path>/` to .gitignore; the toolkit and its local launch history
are disposable after verification. Do not untrack files as a side effect of launch.
The harness source repository keeps its authoritative package tracked.

Keep answers, reports, plans and receipts in `package:state/launch/`. Exclude state
from release archives and preserve it when updating the toolkit. Existing project
Legacy `.harness/` records are read-only migration inputs: copy/revalidate needed data
into `package:state/` with provenance; do not write new data there. Keep patch
inventory, bundles, and baselines under `package:state/` as specified in Patch State.

Read the newest incomplete `package:state/launch/reports/*-launch.md` and its operation record.
Match tracked tasks by the recorded run ID. Resume that run, asking only if multiple
runs or restart intent are ambiguous. Recheck input/output hashes before reusing
completed work; retain verified independent results.

For a new run, copy `package:reports/report.template.md` to
`package:state/launch/reports/<UTC YYYY-MM-DD-HHMMSS>-launch.md`, keeping launch progress rows.
Record run ID, package version, plan/operation-record paths, decisions, and evidence.
Remove unused patch-mode example tables from the new launch report so its Progress
section contains exactly the 14 launch rows. Mirror native tracking on these rows.
Load permanent `answers.json` first. If absent, import the newest populated legacy
`package:reports/` Answers, recording provenance and `historical` status; preserve
legacy originals. Revalidate historical answers before plan use. Legacy package patch,
state and registry records are also read-only migration fallbacks.
Persist each resolved answer immediately in both `answers.json` and this run's report;
record verified outputs immediately. Leave templates and prior reports intact.

Then initialize task tracking per [01-launch.md](01-launch.md#tracking-protocol)
before context inspection or Q&A.

Read the canonical Engineering Guide, then inspect project code/config, build tools,
lockfiles, conventions, existing HLD/Engineering Guide/LLD, and the latest five stories.
Inventory root and nested README/AI-context files, existing skills/agents/settings,
and any shared product-context documentation. Exclude the bootstrap package from
project scans and cleanup: its files are neither installed harness nor project evidence.
Present detected stack, containers, harness state, implementation presence, and proposed
cleanup scope. Resolve contradictions; do not infer target requirements from code.

Adoption preserves populated docs and local customizations. Read existing docs and
harness files before planning; install missing A–C dependencies before D. Do not bulk
rename existing documentation or replace approved HLD with a code summary. A fully
installed harness normally needs `patch apply`; never treat it as a blank destination.

## 2. Resolve knowns and write the plan

Use the checklist from evidence first; ask only for missing values, ambiguous choices,
or conflicts. Record key, value, source, and status: verified, confirmed, proposed, or
unresolved. Reuse verified/confirmed values. Proposed interpretations are not facts.
Permanent `answers.json` is:

```json
{
  "schema_version": 1,
  "answers": {
    "<Q-key>": {
      "question": "<exact checklist wording at resolution time>",
      "value": "<resolved answer>",
      "source": "<project-relative evidence path>",
      "status": "<verified | confirmed | proposed | unresolved | historical>"
    }
  }
}
```

The `question` snapshot preserves an answer's meaning even if the checklist changes
later; use `Key | Question | Answer` columns in the report. For older entries without
`question`, recover wording from the original report when available; otherwise backfill
from the current checklist with `question_source: "current-checklist-backfill"`. Do not
overwrite existing question snapshots or rewrite historical reports. Keep schema
version 1; this is an additive field. Retain import provenance when migrating.
Historical/proposed/unresolved values cannot become plan knowns until verified or
confirmed. Keep one `## Answers` row per applicable question key in the dated report,
including resolved values obtained from evidence; mark inapplicable branches explicitly.

Load [Launch questions](02-launch-questions.md), the authoritative checklist for
this task. Resolve every applicable key and record inapplicable branches with their
reason. Persist resolved answers in `answers.json` and the run report before
completing task 3; unresolved required decisions keep it incomplete.

Present the resolved answers and concrete installation/reconciliation plan before
writes. Existing authorization covers clean changes; resolve outstanding decisions
and conflicting local edits explicitly rather than repeating answered questions.

### Inventory and JSON plan

Read each TEMPLATE with its INTENT. Inventory source/hash, target, existing target
hash, substitutions, conditional actions, and dependencies. Include INTENT companions
and references found in templates: patterns and flat rule files. Each
companion gets its own entry; a filename glob alone is not a companion inventory.
Missing dependencies and destination collisions are planning errors.

Store immutable JSON at `package:state/launch/runs/<run_id>/plan.json`; use a new linked
run ID if the plan changes, and separate linked plans for later blocks with unresolved
inputs. Freeze the selected canonical payload/manifest before writes per Patch State.
Keep project values and baseline bytes local; never put secrets in plans.

Plan shape — `scripts/materialize-launch.mjs` is the validation authority for this
schema (hashes, safe paths, knowns, tokens, collisions, preconditions):

```json
{
  "schema_version": 1,
  "run_id": "<this run's ID>",
  "knowns": {
    "<TOKEN_KEY>": {
      "value": "<resolved string>",
      "source": "<project-relative evidence path>",
      "status": "<verified | confirmed>"
    }
  },
  "files": [
    {
      "source": "<package-relative canonical/... TEMPLATE path>",
      "source_sha256": "<SHA-256 of canonical source bytes>",
      "target": "<project-relative destination>",
      "expected_target_sha256": "<reviewed existing hash, or null when absent>",
      "intent": "<package-relative INTENT path>",
      "replacements": { "<{{TOKEN}}>": "<known key>" },
      "preserve_tokens": ["<deferred {{TOKEN}} retained for a recorded derive step>"],
      "derive": [{ "rule": "<INTENT rule reference>", "action": "<recorded adaptation>" }]
    }
  ],
  "derived_outputs": [
    {
      "target": "<project-relative reserved output>",
      "expected_target_sha256": "<reviewed existing hash, or null when absent>",
      "rule": "<launch-reference rule that derives it>",
      "inputs": ["<project-relative input or planned output>"]
    }
  ]
}
```

`source`/`intent` are package-relative; `target` and derived `inputs` are
project-relative. Resolve target placeholders first. Known values are strings with
evidence `source` and `verified` or `confirmed` status. `replacements` maps exact
`{{TOKEN}}` strings to known keys, applied once; established multiline prose is
allowed. Further INTENT reasoning belongs in `derive` rule/actions.

`files` declares canonical copies. `derived_outputs` reserves root/config/docs/index
or assembly outputs with a rule, inputs, and overwrite precondition; the script checks
these reservations but does not write them. Future inputs may name planned outputs;
accept them before deriving dependents. Recheck target hashes immediately before
agent writes and record evidence, coverage, final hashes, and verification.

Show a reconciliation diff for existing content and preserve retained local changes.
Provider selection and transformations are owned by `canonical/manifest.json`.
Use [Provider launch](08-provider-launch.md) to generate the skill/agent/config plan.
Extend it with shared docs and reserved derivations before freezing it. Both providers
share project facts and adaptation decisions, but receive separate native files.

### Materialize → apply INTENT → verify

Run from the project root against this run's plan:

```sh
node <package>/scripts/materialize-launch.mjs --plan <run-dir>/plan.json --check
node <package>/scripts/materialize-launch.mjs --plan <run-dir>/plan.json --write
```

The Node standard-library script validates the whole plan, copies/replaces declared
sources, and writes `<run-dir>/materialization.json`. It performs no deletions or
semantic INTENT reasoning. Read INTENT source files directly from the bootstrap package
to guide adaptation; never materialize them in the project. The finalizer retains cleanup
support for temporary copies from older plans. See [Provider launch](08-provider-launch.md).
Attach the receipt to the operation record; partial writes remain partial.

During materialization and adaptation, apply each recorded INTENT action: omit, replace, adapt, or
instantiate as stated, preserving unrelated template behavior. Derive reserved outputs
using their named rules/evidence. Record output → rule/decision → diff for every change.
Compare TEMPLATE/companion placeholders with INTENT; resolve mismatches explicitly as
local exceptions. Never invent executable values to pass preflight. `preserve_tokens`
may retain a resolved deferred token until its containing omitted section is removed;
record that removal in `derive` and verify it before readiness. Preserve intentional
runtime tokens such as `<TICKET>` and reusable template syntax.

Verify content/syntax first, then installed references, commands, applicability, and
all applicable INTENT checks. Future dependencies are pending, not verified or failed.
Unresolved executable values prevent readiness; disabled branches do not. On resume,
use receipts and hashes; never rerun materialization over adapted files blindly.
Identical materialized files are no-ops; replacement of derived files needs a new
reviewed plan. Final baselines describe verified outputs after cleanup, not receipts.
