import path from 'node:path';
import type { GradeContext } from '../graders/_types.ts';
import type { CaseDefinition, StepReport } from '../cases/_types.ts';
import type { AgentStep, StepContext, StepDefinition, StepOutput } from '../scenarios/_types.ts';
import { runners } from '../agent-runners/_registry.ts';
import { errorMessage } from '../utils/errors.ts';
import { AGENT_RUN_TIMEOUT_MS, LAUNCH_DIR } from '../utils/constants.ts';
import { gradeReport } from './grade.ts';
import { transcriptDiagnostics } from './diagnostics.ts';

/** A step that never ran — because an earlier one failed, or because it has
 * no implementation yet. Distinct from `failed`: it proved nothing.
 */
export function blockedStep(step: string, reason: string): StepReport {
  return { step, status: 'blocked', graders: {}, failures: [reason], durationMs: 0 };
}

/** Runs one step and grades it.
 *
 * A step may declare an `agent` invocation, arbitrary `run` code, or both —
 * the agent goes first, so `run` sees its result on the context.
 *
 * Each step gets its own `StepContext`, but the `GradeContext` inside it is
 * the run's single shared object: a step returns a patch, which is merged in,
 * so later steps — and the scenario's own graders — see what earlier steps
 * discovered.
 */
export class StepRun {
  private readonly context: StepContext;

  constructor(
    private readonly definition: StepDefinition,
    caseDefinition: CaseDefinition,
    grade: GradeContext
  ) {
    this.context = { case: caseDefinition, grade };
  }

  get id(): string {
    return this.definition.id;
  }

  async run(): Promise<StepReport> {
    const started = performance.now();
    const report = await this.execute();
    report.durationMs = Math.round(performance.now() - started);
    return report;
  }

  private async execute(): Promise<StepReport> {
    const { agent, run, graders } = this.definition;
    if (!agent && !run) return blockedStep(this.id, `Step ${this.id} is not implemented`);
    try {
      if (agent) this.absorb(await this.launchAgent(agent));
      if (run) this.absorb(await run(this.context));
      return await gradeReport(this.id, graders ?? [], this.context.grade, transcriptDiagnostics);
    } catch (error) {
      return {
        step: this.id,
        status: 'failed',
        graders: {},
        failures: [errorMessage(error), ...transcriptDiagnostics(this.context.grade)],
        durationMs: 0,
      };
    }
  }

  /** Invokes the host's CLI adapter. A non-zero exit is not thrown here — it
   * is reported by the `agentRunSucceeded()` grader, so a failed launch is a
   * graded outcome like any other rather than a crash.
   */
  private async launchAgent(agent: AgentStep): Promise<StepOutput> {
    const grade = this.context.grade;
    const host = agent.host?.(grade) ?? grade.host;
    if (!host) throw new Error(`step ${this.id} declares an agent but the case has no host`);
    const workspace = grade.workspaces[agent.workspace ?? 0];
    if (!workspace) throw new Error(`step ${this.id} wants workspace ${agent.workspace ?? 0}`);

    const transcriptPath = path.join(
      workspace.packageRoot,
      LAUNCH_DIR,
      `${host}-${this.id}-transcript-${Date.now()}.jsonl`
    );
    const launch = await runners[host]({
      cwd: workspace.root,
      prompt: agent.prompt(grade),
      timeoutMs: agent.timeoutMs ?? AGENT_RUN_TIMEOUT_MS,
      transcriptPath,
    });
    return { launch, transcriptPath };
  }

  private absorb(output: StepOutput): void {
    Object.assign(this.context.grade, output ?? {});
  }
}
