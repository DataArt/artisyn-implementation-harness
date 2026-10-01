import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fixtures } from '../../../fixtures/_registry.ts';
import { PROVIDERS } from '../../utils/providers.ts';
import { runClaudeSkill } from '../../agent-runners/run-claude-skill.ts';
import { runCodexSkill } from '../../agent-runners/run-codex-skill.ts';
import { StepRun } from '../../engine/step-run.ts';
import { result } from '../../graders/grading.ts';
import type { GradeContext } from '../../graders/_types.ts';
import type { CaseDefinition } from '../../cases/_types.ts';
import type { Workspace } from '../../utils/fixture.ts';
import type { SkillRunResult } from '../../agent-runners/_types.ts';

vi.mock('../../agent-runners/run-claude-skill.ts');
vi.mock('../../agent-runners/run-codex-skill.ts');

const launch: SkillRunResult = { exitCode: 0, stdout: '', stderr: '', durationMs: 0, events: [] };

function workspace(name: string): Workspace {
  return {
    root: `/scratch/${name}`,
    packageRoot: `/scratch/${name}/pkg`,
    fixture: fixtures.nxMonorepo,
    cleanup: async () => {},
  };
}

function context(overrides: Partial<GradeContext> = {}): GradeContext {
  const workspaces = [workspace('a'), workspace('b')];
  return {
    workspaces,
    root: workspaces[0].root,
    packageRoot: workspaces[0].packageRoot,
    fixture: fixtures.nxMonorepo,
    containers: [],
    providers: [],
    artifacts: new Map(),
    ...overrides,
  };
}

const caseDefinition: CaseDefinition = {
  id: 'c',
  name: 'C',
  fixture: fixtures.nxMonorepo,
  configuration: 'minimal',
  scenario: { id: 's', steps: [] },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(runClaudeSkill).mockResolvedValue(launch);
  vi.mocked(runCodexSkill).mockResolvedValue(launch);
});

describe('StepRun agent config', () => {
  it('invokes the host CLI and records the launch on the context', async () => {
    const grade = context({ host: PROVIDERS.claude });
    const report = await new StepRun(
      { id: 'launch', agent: { prompt: () => 'do the thing' }, graders: [() => result('ok', [])] },
      caseDefinition,
      grade
    ).run();

    expect(report.status).toBe('passed');
    expect(runClaudeSkill).toHaveBeenCalledOnce();
    expect(runCodexSkill).not.toHaveBeenCalled();
    const options = vi.mocked(runClaudeSkill).mock.calls[0][0];
    expect(options.prompt).toBe('do the thing');
    expect(options.cwd).toBe('/scratch/a');
    expect(grade.launch).toBe(launch);
    expect(grade.transcriptPath).toContain('/scratch/a/pkg');
  });

  it('honours an explicit host and workspace index', async () => {
    const grade = context({ host: PROVIDERS.claude });
    await new StepRun(
      {
        id: 'apply',
        agent: { prompt: () => 'p', host: () => PROVIDERS.codex, workspace: 1 },
        graders: [() => result('ok', [])],
      },
      caseDefinition,
      grade
    ).run();

    expect(runCodexSkill).toHaveBeenCalledOnce();
    expect(vi.mocked(runCodexSkill).mock.calls[0][0].cwd).toBe('/scratch/b');
  });

  it('runs the agent before `run`, so `run` sees the launch', async () => {
    const grade = context({ host: PROVIDERS.claude });
    let sawLaunch = false;
    await new StepRun(
      {
        id: 'prepare',
        agent: { prompt: () => 'p' },
        run: async ({ grade: g }) => {
          sawLaunch = g.launch === launch;
        },
        graders: [() => result('ok', [])],
      },
      caseDefinition,
      grade
    ).run();
    expect(sawLaunch).toBe(true);
  });

  it('fails the step when the case has no host to run against', async () => {
    const report = await new StepRun(
      { id: 'launch', agent: { prompt: () => 'p' } },
      caseDefinition,
      context()
    ).run();
    expect(report.status).toBe('failed');
    expect(report.failures.join('\n')).toContain('no host');
  });

  it('blocks a step that declares neither agent nor run', async () => {
    const report = await new StepRun({ id: 'todo' }, caseDefinition, context()).run();
    expect(report.status).toBe('blocked');
    expect(report.failures).toEqual(['Step todo is not implemented']);
  });
});
