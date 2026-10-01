import type { GradeContext } from '../graders/_types.ts';
import type { CaseDefinition, StepReport } from '../cases/_types.ts';
import type { ScenarioDefinition } from '../scenarios/_types.ts';
import { errorMessage } from '../utils/errors.ts';
import { gradeReport } from './grade.ts';
import { transcriptDiagnostics } from './diagnostics.ts';
import type { ScenarioOutcome } from './_types.ts';
import { StepRun, blockedStep } from './step-run.ts';

/** Runs one scenario: each step in order via its own `StepRun`, then the
 * scenario's own graders against the context those steps built up.
 *
 * Workspace creation and disposal belong to `CaseRun` — a scenario declares
 * how many it needs, it does not make them.
 *
 * The scenario's graders are reported as a final pseudo-step named for the
 * scenario, so they share the `<step>/<grader>` report keying and the same
 * blocking rule as a real step.
 */
export class ScenarioRun {
  private readonly reports: StepReport[] = [];
  private readonly failures: string[] = [];
  /** The first step that did not pass; everything after it is blocked. */
  private blockedBy?: string;

  constructor(
    private readonly scenario: ScenarioDefinition,
    private readonly definition: CaseDefinition,
    private readonly grade: GradeContext
  ) {}

  async run(): Promise<ScenarioOutcome> {
    try {
      await this.runSteps();
      await this.gradeScenario();
    } catch (error) {
      // A step's own throw is caught by its StepRun, so reaching here means
      // the scenario's grading itself blew up.
      this.failures.push(`Scenario ${this.scenario.id} failed: ${errorMessage(error)}`);
    }
    return { reports: this.reports, failures: this.failures };
  }

  private async runSteps(): Promise<void> {
    for (const step of this.scenario.steps) {
      if (this.blockedBy) {
        this.collect(blockedStep(step.id, `Blocked by ${this.blockedBy}`));
        continue;
      }
      this.collect(await new StepRun(step, this.definition, this.grade).run());
    }
  }

  private async gradeScenario(): Promise<void> {
    const graders = this.scenario.graders;
    if (!graders?.length) return;
    if (this.blockedBy) {
      this.collect(blockedStep(this.scenario.id, `Blocked by ${this.blockedBy}`));
      return;
    }
    const started = performance.now();
    const report = await gradeReport(this.scenario.id, graders, this.grade, transcriptDiagnostics);
    report.durationMs = Math.round(performance.now() - started);
    this.collect(report);
  }

  private collect(report: StepReport): void {
    this.reports.push(report);
    if (report.status !== 'passed') this.blockedBy ??= report.step;
  }
}
