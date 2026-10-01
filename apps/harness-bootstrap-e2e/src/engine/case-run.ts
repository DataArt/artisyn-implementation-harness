import type { GradeContext } from '../graders/_types.ts';
import type { CaseDefinition, CaseReport, Outcome, StepReport } from '../cases/_types.ts';
import type { ScenarioDefinition } from '../scenarios/_types.ts';
import { createFixture, installSkillPackage, type Workspace } from '../utils/fixture.ts';
import { PROVIDERS } from '../utils/providers.ts';
import { errorMessage } from '../utils/errors.ts';
import { recordCaseReport } from './run-report.ts';
import { ScenarioRun } from './scenario-run.ts';

/** The run's starting knowledge: what the case declared, plus the scratch
 * projects the engine made for it. Everything else — the launch result, the
 * run ID — is filled in by the steps as they execute.
 */
function initialGradeContext(definition: CaseDefinition, workspaces: Workspace[]): GradeContext {
  return {
    workspaces,
    root: workspaces[0]?.root ?? '',
    packageRoot: workspaces[0]?.packageRoot ?? '',
    fixture: definition.fixture,
    containers: definition.fixture.containers.map((container) => container.name),
    provider: definition.provider,
    host: definition.host,
    providers: definition.provider ? [definition.provider] : [],
    artifacts: new Map(),
  };
}

/** Names every way the case fails to match what the scenario accepts, so a
 * misconfiguration reports all of them at once rather than one per rerun.
 */
function requirementMismatches(definition: CaseDefinition, scenario: ScenarioDefinition): string[] {
  const requires = scenario.requires;
  if (!requires) return [];
  const problems: string[] = [];
  if (requires.fixtures && !requires.fixtures.includes(definition.fixture))
    problems.push(
      `fixture ${definition.fixture.id} (accepts ${requires.fixtures.map((f) => f.id).join(', ')})`
    );
  if (requires.configurations && !requires.configurations.includes(definition.configuration))
    problems.push(
      `configuration ${definition.configuration} (accepts ${requires.configurations.join(', ')})`
    );
  if (requires.hosts && (!definition.host || !requires.hosts.includes(definition.host)))
    problems.push(`host ${definition.host ?? 'none'} (accepts ${requires.hosts.join(', ')})`);
  if (
    requires.providers &&
    (!definition.provider || !requires.providers.includes(definition.provider))
  )
    problems.push(
      `provider ${definition.provider ?? 'none'} (accepts ${requires.providers.join(', ')})`
    );
  return problems;
}

/** Runs one case: checks the scenario accepts it, creates the scratch
 * projects it declared, hands execution to a `ScenarioRun`, disposes the
 * projects, and assembles the report the spec asserts on.
 */
export class CaseRun {
  private readonly startedAt = performance.now();
  private readonly workspaces: Workspace[] = [];

  constructor(private readonly definition: CaseDefinition) {}

  private get scenario(): ScenarioDefinition {
    return this.definition.scenario;
  }

  async execute(): Promise<CaseReport> {
    const mismatches = requirementMismatches(this.definition, this.scenario);
    if (mismatches.length)
      return this.buildReport(
        [],
        [`Scenario ${this.scenario.id} does not accept this case: ${mismatches.join('; ')}`]
      );

    const failures: string[] = [];
    let reports: StepReport[] = [];
    try {
      const grade = initialGradeContext(this.definition, await this.createWorkspaces());
      const outcome = await new ScenarioRun(this.scenario, this.definition, grade).run();
      reports = outcome.reports;
      failures.push(...outcome.failures);
    } catch (error) {
      failures.push(`Workspace setup failed: ${errorMessage(error)}`);
      reports = this.scenario.steps.map((step) => ({
        step: step.id,
        status: 'blocked' as const,
        graders: {},
        failures: ['Workspace setup failed'],
        durationMs: 0,
      }));
    } finally {
      await this.disposeWorkspaces(failures);
    }
    return this.buildReport(reports, failures);
  }

  private async createWorkspaces(): Promise<Workspace[]> {
    const { host, fixture } = this.definition;
    for (let index = 0; index < (this.scenario.workspaces ?? 0); index++) {
      const workspace = await createFixture(fixture, this.definition.id);
      this.workspaces.push(workspace);
      if (this.scenario.installPackage) installSkillPackage(workspace, host ?? PROVIDERS.claude);
    }
    return this.workspaces;
  }

  private async disposeWorkspaces(failures: string[]): Promise<void> {
    for (const workspace of this.workspaces) {
      try {
        await workspace.cleanup();
      } catch (error) {
        failures.push(`Cleanup failed: ${errorMessage(error)}`);
      }
    }
  }

  private outcome(reports: StepReport[], failures: string[]): Outcome {
    if (failures.length || reports.some((step) => step.status === 'failed')) return 'failed';
    if (reports.some((step) => step.status === 'blocked')) return 'blocked';
    return 'passed';
  }

  private buildReport(reports: StepReport[], failures: string[]): CaseReport {
    const { definition } = this;
    const runFailures = [...failures];
    if (!reports.length && !runFailures.length) runFailures.push('Scenario has no steps');
    const graders = Object.fromEntries(
      reports.flatMap((step) =>
        Object.entries(step.graders).map(([id, result]) => [`${step.step}/${id}`, result])
      )
    );
    // Every step ran cleanly but nothing was actually checked; without this a
    // scenario that forgot its graders would report a confident pass.
    if (
      reports.length &&
      reports.every((step) => step.status === 'passed') &&
      !Object.keys(graders).length
    )
      runFailures.push('Scenario completed without evaluating any grader');
    const status = this.outcome(reports, runFailures);
    return {
      case: definition.id,
      scenario: this.scenario.id,
      fixture: definition.fixture.id,
      configuration: definition.configuration,
      feature: definition.feature,
      provider: definition.provider,
      host: definition.host,
      passed: status === 'passed',
      requiredGradersPassed: status === 'passed',
      status,
      graders,
      failures: [
        ...runFailures,
        ...reports.flatMap((step) => step.failures.map((failure) => `[${step.step}] ${failure}`)),
      ],
      durationMs: Math.round(performance.now() - this.startedAt),
      steps: reports,
    };
  }
}

export async function runCase(definition: CaseDefinition): Promise<CaseReport> {
  const report = await new CaseRun(definition).execute();
  recordCaseReport(report);
  return report;
}
