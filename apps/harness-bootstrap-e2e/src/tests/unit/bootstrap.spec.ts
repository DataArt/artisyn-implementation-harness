import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fixtures } from '../../../fixtures/_registry.ts';
import { PROVIDERS, type Provider } from '../../utils/providers.ts';
import { createFixture, installSkillPackage, type Workspace } from '../../utils/fixture.ts';
import { runCodexSkill } from '../../agent-runners/run-codex-skill.ts';
import { runClaudeSkill } from '../../agent-runners/run-claude-skill.ts';
import { bootstrapScenario } from '../../scenarios/bootstrap.ts';
import { runCase } from '../../engine/case-run.ts';
import type { CaseReport } from '../../cases/_types.ts';
import type { SkillRunResult } from '../../agent-runners/_types.ts';

vi.mock('../../utils/fixture.ts');
vi.mock('../../agent-runners/run-codex-skill.ts');
vi.mock('../../agent-runners/run-claude-skill.ts');

let workspace: Workspace;
const launch: SkillRunResult = {
  exitCode: 0,
  stdout: '',
  stderr: '',
  durationMs: 0,
  events: [{ type: 'item.completed', item: { type: 'agent_message', text: 'Agent explanation' } }],
};

function bootstrap(provider: Provider, host: Provider): Promise<CaseReport> {
  return runCase({
    id: 'unit-bootstrap',
    name: 'Unit bootstrap',
    scenario: bootstrapScenario,
    fixture: fixtures.multiContainerProject,
    configuration: 'aws-dev',
    provider,
    host,
  });
}

/** Grader IDs recorded for one step, with the `<step>/` prefix removed. */
function gradersOf(report: CaseReport, step: string): string[] {
  return Object.keys(report.graders)
    .filter((key) => key.startsWith(`${step}/`))
    .map((key) => key.slice(step.length + 1));
}

beforeEach(() => {
  vi.resetAllMocks();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-bootstrap-unit-'));
  workspace = {
    root,
    packageRoot: path.join(root, 'package'),
    fixture: fixtures.multiContainerProject,
    cleanup: vi.fn(async () => {}),
  };
  fs.mkdirSync(workspace.packageRoot);
  vi.mocked(createFixture).mockResolvedValue(workspace);
  vi.mocked(runCodexSkill).mockResolvedValue(launch);
  vi.mocked(runClaudeSkill).mockResolvedValue(launch);
});

afterEach(() => {
  fs.rmSync(workspace.root, { recursive: true, force: true });
});

it('gates the scenario graders on the agent run and cleans up', async () => {
  vi.mocked(runCodexSkill).mockResolvedValue({ ...launch, exitCode: 1, stderr: 'CLI failed' });
  const report = await bootstrap(PROVIDERS.claude, PROVIDERS.codex);

  expect(gradersOf(report, 'launch')).toEqual(['agent-run']);
  expect(report.steps.map((step) => step.status)).toEqual(['failed', 'blocked']);
  expect(report.failures.join('\n')).toContain('CLI failed');
  expect(report.failures.join('\n')).toContain('Agent explanation');
  expect(installSkillPackage).toHaveBeenCalledWith(workspace, PROVIDERS.codex);
  expect(runClaudeSkill).not.toHaveBeenCalled();
  expect(workspace.cleanup).toHaveBeenCalledOnce();
});

it('still evaluates every scenario grader when the launch report is missing', async () => {
  const report = await bootstrap(PROVIDERS.codex, PROVIDERS.claude);
  const graders = gradersOf(report, 'bootstrap');

  expect(graders).toContain('installed');
  expect(report.graders['bootstrap/state']).toBe('fail');
  expect(report.failures.join('\n')).toContain('cannot identify primary launch run');
  expect(report.failures.join('\n')).toContain('Full claude transcript:');
  expect(workspace.cleanup).toHaveBeenCalledOnce();
});

it('records one distinct report entry per check, with Codex adding its plan-tool check', async () => {
  const claude = gradersOf(await bootstrap(PROVIDERS.claude, PROVIDERS.claude), 'bootstrap');
  const codex = gradersOf(await bootstrap(PROVIDERS.codex, PROVIDERS.codex), 'bootstrap');

  expect(claude).toHaveLength(14);
  expect(new Set(claude).size).toBe(14);
  expect(claude).not.toContain('config');
  expect(codex).toEqual([...claude.slice(0, 9), 'config', ...claude.slice(9)]);
  expect(codex).toHaveLength(15);
});

it('cleans up when the runner throws', async () => {
  vi.mocked(runCodexSkill).mockRejectedValue(new Error('runner crashed'));
  const report = await bootstrap(PROVIDERS.codex, PROVIDERS.codex);
  expect(report.failures.join('\n')).toContain('runner crashed');
  expect(workspace.cleanup).toHaveBeenCalledOnce();
});
