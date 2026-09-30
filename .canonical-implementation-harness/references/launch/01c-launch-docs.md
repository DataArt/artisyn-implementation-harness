# Launch D.2–D.5 and E — documentation ownership, review, and rendering gate

Stage sequence and tracking live in [01-launch.md](01-launch.md). Documentation is
performed by the installed layer/component agents selected from the project's actual
Agents table. The orchestrator assigns each agent a non-overlapping evidence-backed
scope, then verifies the outputs and owns cross-component indexes and summaries.

## D.2/D.3 — Layer/component documentation

Identify actual C4 containers and decompose each into cohesive implementation
components using the installed LLD/HLD intents. File counts estimate effort; they do
not define architecture boundaries. Start one layer/component agent per confirmed
scope. Agents write only their assigned component or container documents. The
orchestrator owns shared pattern documents, indexes, system overview, and sizing.
Never dispatch overlapping scopes or invent fixed backend/frontend/data categories.

Each agent receives project-relative paths, the applicable intent and principles,
source evidence boundaries, output budget, and this contract. A completed response is
not proof: inspect the written files, links, evidence, and hashes before accepting it.
Record failed or partial scopes in the run report and resume them explicitly.

D.2: identify actual C4 containers and decompose each into cohesive components per
LLD Intent before assigning work. File counts estimate effort, not architecture
boundaries. Reserve a component overview per container, owned by the orchestrator,
and verify that component documents map to that view. HLD uses the corresponding
container view per HLD Intent; context-only or file-inventory substitutes fail review.
Use bounded actual `filePaths`; output one doc per agreed component under
`project:docs/System Architecture (LLD)/<Container>/`. Verify each before generating
the LLD README registry (one row per actual doc, with container and coverage).

As part of D.2, assess shared layer patterns using the installed LLD Intent. Reserve
applicable shared outputs in derived_outputs before writing: Web
UI UX Patterns.md, and Backend/Data Principles and Patterns.md, under the actual
container's LLD folder. Do not invent absent layers or boilerplate documents.
The orchestrator owns these shared outputs: derive them from verified component
LLDs and inspected code/config, then add links from relevant components and the
LLD index. Workers continue to write only their assigned component destinations.
Verify shared patterns, source evidence, component links, and final hashes before
completing the D.2 task; record non-applicability in the run report. Keep proposed
patterns in HLD/design records and system-wide decisions in HLD.
Greenfield skips LLD workers and implemented-pattern documents: create a router
and container-folder scaffold only.

D.3: use verified LLD in `lldPaths` and confirmed requirements/decisions in `intentPaths`
(the run report may supply Q&A). Do not advance from partial/unverified LLD. Greenfield
uses `greenfield:true`, empty `lldPaths`, and nonempty confirmed `intentPaths`; HLD
workers still run from confirmed design statements; unresolved implementation questions
stay in the run record. Workers write only assigned destinations; the orchestrator
owns indexes and cross-document consistency.

Return `{ status, results, failedPaths }`; each successful worker returns `path`,
`status`, `lineCount`, `coverage` for scope/structure/flows/contracts/constraints,
`evidence` claim/source pairs, `unresolved` (external review metadata), and
`deviationsFound`. Record failures too. Read actual files, verify
path/content/evidence/links, and hash them before accepting complete or reusing
as inputs. A worker response alone is not proof. Never dispatch overlapping outputs.

For a new HLD, create `project:docs/Target Architecture (HLD)/README.md` with active
version v1 and `v1/Containers/<Name>.md` per Q3; preserve existing version decisions.
After containers, the orchestrator writes `System Overview.md` and `System Sizing.md`
inside that version. No numeric prefixes or initial WAR folder. For shared product
context, reserve its README plus one agreed/default `Architecture/` folder; invent no
further structure. Present verified LLD/HLD summaries at their dependency boundaries.

## Plan reconciliation for D.1–D.5 outputs

The Stage-3 JSON plan is frozen before D.1–D.5 run, so none of their outputs exist in
it yet. This is not an exemption: every file D.1–D.5 create or update — Engineering
Guide docs, HLD/LLD docs and indexes, `docs/README.md`, the root `README.md`, app
READMEs, the two D.2 shared pattern docs, and any other stage output — must be
reserved in `derived_outputs` and re-validated via `materialize-launch.mjs --plan
<run-dir>/plan.json --check`/`--write`, where `<run-dir>` is this run's **original**
`runs/<run_id>/` directory from Stage 3 — the same file, amended in place, every time.
Do not create a new linked run ID for a D-stage addition (linked runs are reserved for
splitting A/B/C materialization only, per 01a-launch-plan.md); state verification
reconciles the operation record against this one run's receipt, so anything reserved
in a different run's plan is invisible to it and the reconciliation will still fail.
Do this progressively, stage by stage, rather than batching it at the end: an output
written without a matching `derived_outputs` reservation in the original plan leaves
the plan, the materialization receipt, and the operation record unreconciled with each
other, which fails verification whether the run finishes cleanly or is later graded as
a partial/blocked run. Stage 13 (cleanup and final audit) must find the plan, receipt,
and operation record in exact agreement over every permanent output that stage produced.

## Documentation evidence and precedence

Read installed intents/principles first. These launch rules override conflicting
older checklists without changing canonical files; record each applied exception:

- LLD describes implementation, including execution/data flow and relevant failure
  behavior under Relationships; technical claims link exact code/config evidence.
- HLD abstracts verified LLD into responsibilities, boundaries, contracts and flows;
  distinguish observed implementation from confirmed future target requirements.
- Observed consequential choices may be Key Decisions; rationale and alternatives
  require documented evidence or confirmation. Never invent why an approach won.
- Published HLD/LLD/NFR contain supported statements only: no Gaps, open-question,
  TODO or unknown-placeholder sections. Record uncertainty in the run report/design
  working records. Essential missing evidence blocks readiness; do not invent facts.
- Explain meaningful business/data flows and interaction sequencing: trigger, actors,
  ordered actions, data boundaries, outcomes, and supported failure behavior. Use
  sequence/flow diagrams where they clarify the design. Add or link a UI mockup when
  it materially explains a user-facing flow, layout or state; omit irrelevant mockups.
- Apply installed Documentation/01 Principles.md for formatting, diagrams, budgets
  and immediate self-review; use focused companions to preserve essential coverage.
- System Overview synthesizes verified containers; Sizing separates measurements,
  confirmed targets and operating conditions; unresolved assumptions remain external.
  Indexes require their own coverage, not a container checklist. Greenfield HLD
  derives only from confirmed intent.

## D.4/D.5 and E — Finish documentation and review

Unless Q11=None, write one `Non-Functional Concerns/<Pillar>.md` per selected pillar
under the active HLD version, using installed `Documentation/05 NFR Intent.md`.
Inspect relevant config/code, confirmed requirements, and selected framework guidance.
Write complete, testable statements with scope, approved target/control, conditions,
and verification evidence; distinguish measured current behavior from target obligations.
Keep unknown targets outside final docs and never adopt arbitrary default numbers.
`@docs-writer` reads NFR Intent before writing; `@architect` reviews applicability and
requirement coverage. If essential requirements are unresolved, D.4 remains incomplete.

Create/update `project:docs/README.md` as a thin index to actual HLD/LLD/Engineering
Guide outputs and lifecycle/structure routers. Reconcile meaningful existing content.
Use link syntax supported by the project's actual Markdown/link checker. Check literal
destinations with that checker; do not hide failures by stripping or decoding characters
it treats as part of a filename. Prefer space-free names for new process references.

Also update the project's own root `README.md` (not `docs/README.md`) to link into
`docs/`, so `docs/` is discoverable from the project's front door. Add a short section
or line pointing at `docs/README.md` (or the most relevant entry point); reconcile
with any existing root README content rather than replacing it wholesale.

Indexing is not only the docs-tree root doc: installed Documentation/02 Structure.md's "App
README scope" requires every app README to link to its HLD container and LLD
component doc. Once this launch has created or confirmed those HLD/LLD outputs, add
or update an `## Architecture` section (or equivalent) linking to them in each
discovered app's `README.md` — this is normally `/dev document`'s incremental job,
but a first launch has no prior `/dev document` run to have done it, so launch must
seed it once. Skip only an app with no corresponding HLD container yet (record why).

Delegate a read-only satellite review to `@architect` covering all components,
containers, overview/sizing, NFRs, evidence consistency, diagrams and budgets. Apply
installed Principles for claim challenges, Conventions for rule authority, HLD Intent
for runtime boundaries and capacity comparisons, and NFR Intent for acceptance
traceability. Inspect actual documents and contrary evidence, not just worker metadata.

Keep author self-check, orchestrator verification and independent reviewer verdict
as separate records. Each records actor/role, inspected paths and hashes, findings
and disposition. Only the independent reviewer issues **go** or **reiterate**; an
orchestrator's verified fix does not change the previous verdict. Fix and resubmit
affected findings and cross-document impacts, up to three iterations. If review is
unavailable or findings remain, record the limitation and obtain a developer decision
as an explicit exception, never as an independent **go**.

After satellite findings are resolved, have `@docs-writer` review and edit the final
in-scope documentation. Resubmit affected documents if those edits change reviewed
content; retain the prior verdict only for unchanged hashes. Then run the rendering
gate below before completing task E.

## Mermaid rendering gate

The orchestrator owns this check; a writer's assurance or a Markdown preview is not
evidence of CLI success. Use the standalone Node-standard-library helper:

`node <package>/scripts/check-mermaid.mjs <config.json>`

The config contains `files` (explicit .md/.mmd paths), `output` (a fresh attempt
folder), `renderer` (executable and fixed arguments as a JSON array),
`rendererIdentity` (the verified pinned version/digest and environment details), and
optional `timeoutMs` per render. Paths resolve from the invocation directory. The
renderer must be an isolated, exactly pinned Mermaid CLI resolved and recorded before
running — outside the project dependency tree, with no project package.json, npm init,
package-manager migration, or application dependency/lockfile edits. Repositories
without Node may instead use Docker/Podman with the official
ghcr.io/mermaid-js/mermaid-cli image pinned by digest, mounting only the check
directory; a container wrapper must map the absolute input/output paths passed by the
helper to its mounted check directory. Follow environment permissions for downloads;
if no route is available, record the blocker and leave the gate incomplete rather than
claiming diagrams passed.

The helper extracts top-level backtick/tilde fences, follows inline local .mmd links,
renders each input separately, and writes results.json with source/input/output hashes
and per-render command/logs into the config's fresh output folder under
`package:state/launch/runs/<run_id>/diagram-checks/<attempt>/`. List reference-style
or HTML-linked .mmd companions explicitly in `files`; review the inventory for
completeness — the check covers all generated or edited documentation, including
shared layer patterns and diagram companions. Nested Mermaid fences are rejected for
normalization in a temporary input copy, with provenance retained; never silently
omit them. The helper validates the configured renderer's result but does not install
or verify its claimed identity: record the actual version/environment before invoking
it. Reruns use a fresh output directory.

Gate acceptance:

- Extracted inputs reconcile with the source inventory. Zero diagrams is an explicit
  not-applicable result, not a renderer success.
- Every input renders with exit code zero and a newly produced nonempty SVG; old
  output files never count.
- Render failures return to `@docs-writer` for source correction, then re-extract and
  rerender the affected diagrams.
- A passed CLI result still requires visual review: inspect rendered artifacts for
  clipped labels, overlap, readability and intended flow, and record visual findings
  separately. Unresolved render or visual findings keep task E incomplete.
- After cleanup or any later documentation edit, compare final source hashes with the
  checked inventory, re-inventory added/removed diagrams, and rerun invalidated
  checks. The final audit requires a complete result manifest matching the final
  files; keep reports and task statuses aligned with actual check outcomes.

Renderer invocation reference: [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli).
