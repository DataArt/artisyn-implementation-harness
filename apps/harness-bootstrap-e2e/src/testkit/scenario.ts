import type { Provider } from './providers.ts';
import type { FixtureDefinition } from '../../fixtures/registry.ts';
import type { GradeResult } from '../graders/filesystem.grader.ts';

export type Outcome = 'passed' | 'failed' | 'blocked';
export interface CaseDefinition {
  id: string;
  name: string;
  scenario: ScenarioDefinition;
  fixture: FixtureDefinition;
  configuration: string;
  host?: Provider;
  provider?: Provider;
  feature?: string;
}
export interface StepContext {
  case: CaseDefinition;
  /** Persisted outputs and workspace handles shared across steps. */
  artifacts: Map<string, unknown>;
}
export interface StepDefinition {
  id: string;
  /** Missing implementation makes this step explicitly blocked. */
  run?: (context: StepContext) => Promise<GradeResult[]>;
}
export interface ScenarioDefinition {
  id: string;
  steps: StepDefinition[];
  setup?: (context: StepContext) => Promise<void>;
  cleanup?: (context: StepContext) => Promise<void>;
}
export interface StepReport {
  step: string;
  status: Outcome;
  graders: Record<string, 'pass' | 'fail'>;
  failures: string[];
  durationMs: number;
}
export interface CaseReport {
  case: string;
  passed: boolean;
  requiredGradersPassed: boolean;
  graders: Record<string, 'pass' | 'fail'>;
  failures: string[];
  durationMs: number;
  provider?: Provider;
  host?: Provider;
  scenario: string;
  fixture: string;
  configuration: string;
  feature?: string;
  status: Outcome;
  steps: StepReport[];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function blockedStep(step: StepDefinition, reason: string): StepReport {
  return { step: step.id, status: 'blocked', graders: {}, failures: [reason], durationMs: 0 };
}

function applyGrades(report: StepReport, grades: GradeResult[]): void {
  for (const grade of grades) {
    report.graders[grade.grader] = grade.pass ? 'pass' : 'fail';
    if (!grade.pass) report.failures.push(...grade.failures.map((f) => `[${grade.grader}] ${f}`));
  }
  report.status = grades.length > 0 && grades.every((grade) => grade.pass) ? 'passed' : 'failed';
  if (!grades.length) report.failures.push('Step returned no grader results');
}

async function runStep(
  step: StepDefinition,
  context: StepContext,
  blockedBy?: string
): Promise<StepReport> {
  const start = performance.now();
  let report: StepReport;
  if (blockedBy) {
    report = blockedStep(step, `Blocked by ${blockedBy}`);
  } else if (!step.run) {
    report = blockedStep(step, `Step ${step.id} is not implemented`);
  } else {
    report = { step: step.id, status: 'failed', graders: {}, failures: [], durationMs: 0 };
    try {
      applyGrades(report, await step.run(context));
    } catch (error) {
      report.status = 'failed';
      report.failures.push(errorMessage(error));
    }
  }
  report.durationMs = Math.round(performance.now() - start);
  return report;
}

async function runSteps(context: StepContext, reports: StepReport[]): Promise<void> {
  let blockedBy: string | undefined;
  for (const step of context.case.scenario.steps) {
    const report = await runStep(step, context, blockedBy);
    reports.push(report);
    if (report.status !== 'passed') blockedBy ??= step.id;
  }
}

async function cleanupScenario(context: StepContext, failures: string[]): Promise<void> {
  try {
    await context.case.scenario.cleanup?.(context);
  } catch (error) {
    failures.push(`Cleanup failed: ${errorMessage(error)}`);
  }
}

function caseOutcome(steps: StepReport[], failures: string[]): Outcome {
  if (failures.length || steps.some((step) => step.status === 'failed')) return 'failed';
  if (steps.some((step) => step.status === 'blocked')) return 'blocked';
  return 'passed';
}

function buildCaseReport(
  definition: CaseDefinition,
  steps: StepReport[],
  failures: string[],
  start: number
): CaseReport {
  if (!steps.length) failures.push('Scenario has no steps');
  const status = caseOutcome(steps, failures);
  const graders = Object.fromEntries(
    steps.flatMap((step) =>
      Object.entries(step.graders).map(([id, result]) => [`${step.step}/${id}`, result])
    )
  );
  return {
    case: definition.id,
    scenario: definition.scenario.id,
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
      ...failures,
      ...steps.flatMap((step) => step.failures.map((failure) => `[${step.step}] ${failure}`)),
    ],
    durationMs: Math.round(performance.now() - start),
    steps,
  };
}

export async function runCase(definition: CaseDefinition): Promise<CaseReport> {
  const start = performance.now();
  const context: StepContext = { case: definition, artifacts: new Map() };
  const steps: StepReport[] = [];
  const failures: string[] = [];
  try {
    await definition.scenario.setup?.(context);
    await runSteps(context, steps);
  } catch (error) {
    failures.push(`Setup failed: ${errorMessage(error)}`);
    steps.push(...definition.scenario.steps.map((step) => blockedStep(step, 'Setup failed')));
  } finally {
    await cleanupScenario(context, failures);
  }
  return buildCaseReport(definition, steps, failures, start);
}
