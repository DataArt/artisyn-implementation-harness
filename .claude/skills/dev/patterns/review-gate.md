# Review findings and resolution

All Plan, Implement, PR, HLD deviation and documentation consistency reviews use one
`## Review Findings` table in `2-report.md`. Apply `patterns/approvals.md`.
Write findings before acting, then update the same rows as evidence and decisions
arrive. Reviewers return findings; the orchestrator owns the ledger.

| ID  | Stage | Origin | Kind | Deviation type | Severity | Classification | Finding | Evidence | Resolution | TD  | Decision |
| --- | ----- | ------ | ---- | -------------- | -------- | -------------- | ------- | -------- | ---------- | --- | -------- |

- **ID:** stable `RF-001`, never recycled. Deduplicate by underlying issue and affected
  contract/location, not reviewer wording. Later reviews reuse the ID and append
  their origin/evidence. Preserve prior decisions in Decision when reopening a row.
- **Stage:** first discovery: `plan`, `implement`, `test`, `document`.
- **Origin:** semicolon-separated unique values: `plan-audit`, `implementation-review`,
  `pr-review`, `hld-audit`, `doc-consistency`.
- **Kind:** `deviation`, `bug`, `design`, `improve`, `security`, `performance`, `docs`.
  HLD contract divergence is `deviation`; design is another design concern. Translate
  legacy BUG/SEC/PERF/DESIGN/IMPROVE codes using the actual finding's meaning.
- **Deviation type:** `contradiction`, `extension`, `omission` for deviations; `—` otherwise.
- **Severity:** impact, independent of triage: `critical`, `high`, `medium`, `low`, `info`.
- **Classification:** `introduced`, `pre-existing`, `ruled-out`, `advisory`.
- **Evidence:** concrete file/section, test output or review reference. Escape literal
  pipes as `\|`; each row occupies one line. No placeholder rows in live reports.
- **Resolution:** `open`, `fixed`, `accepted`, `tech-debt`, `doc-updated`.
- **TD:** linked ledger ID (`TD-1`) for tech-debt, otherwise `—`.
- **Decision:** fix/verification evidence or attributed acceptance/deferral with rationale.

Fix confirmed in-scope regressions and routine doc inconsistencies, then run relevant
verification without a per-fix confirmation. Do not expand scope to fix unrelated
pre-existing issues. Combine unresolved scope/risk decisions for human review after
preparing the available fixes. A ruled-out finding becomes `accepted` with the
counter-evidence; it needs no human approval unless accepting a real residual risk.

`fixed` requires passing relevant verification; `doc-updated` requires completed,
checked docs, and any changed HLD decision already authorized. HLD omission/extension
is not permission to rewrite the target to excuse a regression. `accepted` for a real
risk requires attributed authorization and rationale. `tech-debt` requires a linked
TD row with an owner and next action, plus authorized deferral of required work.
Optional tracker creation can be declined: the local ledger remains the durable record.

No findings is a review coverage note, never a fabricated finding row. Ordinary LLD
lag pending the Document stage goes directly to Documentation, not a deviation row.
A contradiction remaining after doc updates is a `docs` finding.

Before archival all rows must be terminal, all required AC/checks must pass, and each
resolution must have evidence. Critical/high risk cannot be silently accepted or
hidden in debt. Resolve newly discovered consistency findings before final closure.

For an existing report, explicitly consolidate legacy findings sections once, retain
old codes and decisions in Evidence/Decision, and deduplicate across sections. Leave
immutable plans and archived reports unchanged unless migration is requested. Link
plan exceptions to RF IDs in the report rather than copying another live table.
