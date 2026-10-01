import { PROVIDER_DETAILS } from '../utils/providers.ts';
import type { FixtureDefinition } from '../../fixtures/_registry.ts';
import type { Provider } from '../utils/build-launch.ts';

/** Every answer launch's Q&A (references/launch/02-launch-questions.md, Q1-Q11)
 * would otherwise need to ask for, stated up front so a single non-interactive
 * headless agent turn can resolve them all as "already confirmed" rather than
 * stopping mid-turn to ask a question nobody's there to answer. Scoped to Dev
 * only (Q10) to keep this expensive case's installed footprint small and
 * predictable to grade. Deliberately does NOT hand-feed Q2/Q3 (stack,
 * containers) — fixtures/multi-container-project has real per-app evidence
 * (package.json dependencies), so resolving those from evidence is exactly
 * the judgment this case is supposed to exercise, not something to shortcut.
 */
export function buildScratchLaunchPrompt(
  provider: Provider,
  host: Provider,
  fixture: FixtureDefinition
): string {
  return `Run ${PROVIDER_DETAILS[host].invocationPrefix}harness-bootstrap launch. The skill entrypoint is ${PROVIDER_DETAILS[host].skills}/harness-bootstrap/SKILL.md; read it before acting. Treat every answer below as already
confirmed evidence — do not ask me anything further, proceed autonomously
through the full launch lifecycle (Q&A -> plan -> materialize -> INTENT ->
verify) to completion, and finalize the launch report.

Q1 (purpose): ${fixture.purpose}

Q2 (stack): Resolve from actual repository evidence — inspect each app's
the repository files. Do not invent anything beyond what's
actually there. No database, no team-specific cloud account.

Q3 (containers/layers): Resolve from actual repository evidence — identify
the containers and their paths from the repository. Confirm exactly what's there; do not invent
additional containers and do not collapse distinct apps into one container.

Q4 (data flow/integrations): Configure
the AWS MCP integration (aws-mcp) for us-east-1 using the local AWS credential
chain; do not expect credentials to be present in this disposable fixture, and
document the developer's local authentication setup.

Q5 (tracker): None.

Q6 (provider): ${provider} only.

Q7 (conventions): Conventional Commits (type(scope): subject); branch format
type/short-description; no build/check commands are configured yet; no
guarded commands.

Q8 (NFRs): None targeted. This is a disposable test fixture — skip NFR
research and record no targets.

Q9 (team/constraints): Solo, no fixed pace, no constraints; this is an
automated test fixture, not a real team.

Q10 (lifecycles): Dev only. Disable Design, Evolve, and the Architecture/WAF
lifecycle entirely for this fixture — this does not skip launch's own D-stage
initial HLD/LLD/agent documentation, only the ongoing design skill install.

Q11 (WAF): None.

Do not end your turn after creating the initial report, plan, or materialization
receipt. Those are setup checkpoints, not launch deliverables. Continue with the
next pending stage in the same run, adapting and verifying each stage before
advancing. In particular, a report that says Stage A is in progress means you
must now perform Stage A; it is not a reason to stop. Stop only after all
applicable stages and final verification are complete, or when a concrete
external blocker prevents the next required action. None of the confirmed
answers above is unresolved.

Materialization only copies files; it does not complete launch. After each of
Stages A, B, and C, inspect the generated files, read the matching canonical
INTENT directly from the installed bootstrap package, apply its substitutions
and conditional removals, and verify the provider syntax and resulting content
before marking the stage complete. Do not stop with copied templates, unresolved
project placeholders, or unverified config. Preserve all materialized Codex
settings when adding AWS MCP configuration, including
tools.update_plan.enabled=true. If a check finds a fixable problem, correct and
recheck it before moving on. Continue through all stages that have no genuine
external blocker; if one exists, record the precise blocker and leave the report
in progress rather than presenting the launch as complete.`;
}
