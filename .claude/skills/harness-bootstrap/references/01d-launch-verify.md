# Launch stages 13–14 — cleanup, audit, and close

Stage sequence and tracking live in [01-launch.md](01-launch.md).

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
- Applicable INTENT checks pass; hard stops, explicit decision logic, phase delegation,
  and verify-by-artifact behavior survive specialization. Runtime tokens remain intact.
- Root tables, selected wrappers/settings, registry, commands and MCP setup match the
  installed scope; JSON parses, secrets remain references, local settings are ignored.
- LLD registry and HLD active-version pointers match disk; claims have evidence, required
  categories and flows meet budgets; NFRs distinguish facts from target obligations,
  and uncertainties are recorded outside the published architecture.
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
installed, and run it only when requested. The toolkit remains ignored; preserve already
tracked files and keep durable project records outside it per Patch State.

Optional local implementation checks, run from the project root:

```sh
node .claude/skills/harness-bootstrap/scripts/check-materialize-launch.mjs
node .claude/skills/harness-bootstrap/scripts/check-launch-workflows.mjs
```

These check an isolated fake project and mocked Claude primitives. Runtime discovery,
agent writes and semantic documentation verification still require an actual launch.
