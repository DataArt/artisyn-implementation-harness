# Launch stages 13–15 — operational graph, cleanup, audit, and close

Stage sequence and tracking live in [01-launch.md](01-launch.md).

## Materialize operational graph

Copy `package:canonical/docs/.og/cli.mjs`, `constants.mjs`, `schema.mjs`, `utils.mjs`,
`docs.mjs`, `edges.mjs`, and `docs-operational-graph.sqlite` verbatim into
`project:docs/.og/` — never `cli.test.mjs`, which is canonical-only tooling, not
deployed payload. No token substitution: this is code and a binary database file,
not prose. Then run `node docs/.og/cli.mjs build --dir <project root>`; silent on
success, a non-zero exit plus diagnostic on failure.

**Completion evidence:** every listed file exists at `project:docs/.og/` (and
`cli.test.mjs` does not), `build()`'s exit code is recorded, and (on success)
`docs/.og/docs-operational-graph.sqlite` and `docs/.og/graph.mmd` exist. Runs
before Cleanup specifically so these files are in scope for Final audit's
hash/baseline recording below.

## Cleanup

After review, reconcile the original cleanup inventory within authorized scope.
Move shared rules/procedures to Engineering Guide, implementation mechanics to LLD,
and confirmed design intent to HLD; check existing coverage before duplicating content.
Preserve scoped AI instructions and selected tool wrappers. Leave forwarding links or
section-to-destination tables in migrated originals. Inspect inbound references before
restructuring; retain a router at required paths. Do not modify canonical package
sources or discard approved target intent when code differs; report the discrepancy.
Trim the root README to the root-context budget in installed Documentation/01
Principles.md: purpose, local run instructions, docs links, and "Your AI teammate"
onboarding with only installed commands/agents. Record intentional exceptions,
retained customizations, and every cleanup change; reverify altered docs.
When `docs/README.md` exists, the root `README.md` must link to it. If the root
README is only a placeholder, replace it with a concise project introduction and
that documentation link; verify the destination resolves.

After each writer's immediate self-review, @docs-writer checks the document against
Documentation Principles and its intent, citing concrete sections for reader utility
and required coverage. Correct findings before satellite review and rendering. For
sizing, apply HLD Intent's capacity exercise; for missing NFR targets, collect sourced
proposals and confirm them in Q&A before declaring the specification ready. Worker
coverage claims alone never substitute for inspecting the generated files.

## Final audit

Before marking complete, audit actual outputs against the selected plan:

- All copies, companions, reserved derivations and worker outputs verified; missing
  inputs, failed workers and unresolved executable placeholders are resolved.
- All deferred cross-stage checks are resolved against the final files, including
  skill-to-agent routing, root Agents tables, and Engineering Guide references.
- Applicable INTENT checks pass; hard stops, explicit decision logic, phase delegation,
  and verify-by-artifact behavior survive specialization. Runtime tokens remain intact.
- Root tables, selected wrappers/settings, registry, commands and MCP setup match the
  installed scope; JSON parses, secrets remain references, local settings are ignored.
- LLD registry and HLD active-version pointers match disk; claims have evidence, required
  categories and flows meet budgets; NFRs distinguish facts from target obligations,
  and uncertainties are recorded outside the published architecture.
- Every discovered app's `README.md` satisfies installed Documentation/02 Structure.md's
  "App README scope" — including links to its HLD container and LLD component doc,
  not just `project:docs/README.md`. An app with no corresponding HLD container yet
  is an explicitly recorded skip, not a silent gap.
- Mermaid inventory and CLI results match final source hashes; all diagrams render,
  visual findings are resolved, or a zero-diagram inventory records non-applicability.
- Author self-check, orchestrator verification and independent satellite verdict are
  separately recorded per 01c-launch-docs.md. The reviewer's verdict covers final
  content hashes; cleanup or later edits require affected-scope re-review. A developer
  exception is labeled as such, never as reviewer approval. Cleanup links and retained
  context still work; disabled checks have explicit reasons.
- Answers, per-output outcomes and final canonical/rendered baselines are recorded per
  Patch State after cleanup. Keep the report in progress until this audit passes.

## Close

Then finalize tasks/report and Ended, summarize outcomes, and suggest a Conventional
Commit covering installation and cleanup. Do not stage, commit, push or deploy merely
because launch ran; respect project guarded commands. Suggest `/where-we-are` only if
installed, and run it only when requested. Preserve toolkit state/launch across updates; exclude it from distribution archives.
Complete final evidence and INTENT cleanup with the provider finalizer before closing.
