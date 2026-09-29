import type { SkillRunResult } from '../agent-runners/types.ts';
import { PROVIDERS, PROVIDER_DETAILS } from '../testkit/providers.ts';
import { fixtures, type FixtureDefinition } from '../../fixtures/registry.ts';
import fs from 'node:fs';
import path from 'node:path';
import type { GradeResult } from '../graders/filesystem.grader.ts';
import { createFixture, installSkillPackage, type Workspace } from '../testkit/fixture.ts';
import type { Provider } from '../testkit/build-launch.ts';
import { runCodexSkill } from '../agent-runners/run-codex-skill.ts';
import { runClaudeSkill } from '../agent-runners/run-claude-skill.ts';
import { gradeFilesystem } from '../graders/filesystem.grader.ts';
import { gradeLaunchState } from '../graders/state.grader.ts';
import { parseLaunchReport } from '../graders/launch-report.ts';
import { gradeReferencesResolve } from '../graders/references.grader.ts';
import { gradeIntentCleanup } from '../graders/cleanup.grader.ts';
import {
  gradeTaskTrackingUsed,
  gradeNoPlanModeDuringAutomatedRun,
} from '../graders/agent-behavior.grader.ts';
import {
  gradeRootReadmeBudget,
  gradeAppReadmesLinkToArchitecture,
  gradeHldCoversContainers,
  gradeDocsIndexExists,
  gradeContainerAgentsDeployed,
} from '../graders/docs-adoption.grader.ts';
import { gradeMcpConfigured } from '../graders/mcp.grader.ts';
import { gradeCodexPlanToolConfigured } from '../graders/config.grader.ts';
import { gradeAdaptationsComplete } from '../graders/adaptation.grader.ts';
import { buildScratchLaunchPrompt } from './launch-prompt.ts';

/** Read the primary run ID from the launch report. A valid launch may have
 * linked stage plans and verification runs, so the runs directory can contain
 * more than one entry.
 */
function findLaunchRunId(packageRoot: string): string {
  const reportsDir = path.join(packageRoot, 'state/launch/reports');
  const reports = fs.existsSync(reportsDir)
    ? fs
        .readdirSync(reportsDir)
        .filter((file) => file.endsWith('-launch.md'))
        .map((file) => path.join(reportsDir, file))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    : [];
  for (const report of reports) {
    const text = fs.readFileSync(report, 'utf8');
    const runId = parseLaunchReport(text).runId;
    if (runId) return runId;
  }
  const runsDir = path.join(packageRoot, 'state/launch/runs');
  const runs = fs.existsSync(runsDir) ? fs.readdirSync(runsDir) : [];
  if (runs.length !== 1)
    throw new Error(
      `cannot identify primary launch run from report; run directories: ${JSON.stringify(runs)}`
    );
  return runs[0];
}

/** The Codex runner records structured events, but failures should expose the
 * assistant's final explanation instead of only saying that expected files are absent.
 */
function finalAgentMessage(events: import('../agent-runners/types.ts').StreamEvent[]): string {
  const messages = events
    .filter((event) => event.item?.type === 'agent_message')
    .map((event) => {
      const item = event.item;
      return item?.text ?? item?.content?.map((part) => part.text ?? '').join('');
    })
    .filter((message): message is string => Boolean(message?.trim()));
  return messages.at(-1)?.trim().slice(-4000) ?? '';
}

/** Run a real execution host against independently selected provider outputs. */
export async function runBootstrap(
  provider: Provider,
  host: Provider,
  fixture: FixtureDefinition = fixtures.multiContainerProject
): Promise<GradeResult[]> {
  const workspace = await createFixture(fixture);
  try {
    installSkillPackage(workspace, host);

    const runner = host === PROVIDERS.codex ? runCodexSkill : runClaudeSkill;
    const transcriptPath = path.join(
      workspace.packageRoot,
      'state/launch',
      `${host}-transcript-${Date.now()}.jsonl`
    );
    const launch = await runner({
      cwd: workspace.root,
      prompt: buildScratchLaunchPrompt(provider, host, fixture),
      timeoutMs: 60 * 60_000,
      transcriptPath,
    });
    if (launch.exitCode !== 0)
      return [
        {
          grader: 'agent-run',
          pass: false,
          failures: [
            `${host} launch failed:\n${launch.stderr}\n${launch.stdout}\n${finalAgentMessage(launch.events)}`,
            `Full ${host} transcript: ${transcriptPath}`,
          ],
        },
      ];

    return gradeBootstrap(workspace, launch, provider, host, transcriptPath);
  } finally {
    await workspace.cleanup();
  }
}

function gradeProviderPlaceholders(workspace: Workspace, provider: Provider): GradeResult {
  const unresolvedProviderTokens = /\{\{provider:[a-z_]+(?::[a-z-]+)?\}\}/;
  const providerSkillsDir = path.join(workspace.root, PROVIDER_DETAILS[provider].skills);
  const leftovers: string[] = [];
  if (fs.existsSync(providerSkillsDir))
    for (const file of walk(providerSkillsDir)) {
      if (file === workspace.packageRoot || file.startsWith(workspace.packageRoot + path.sep))
        continue;
      if (unresolvedProviderTokens.test(fs.readFileSync(file, 'utf8')))
        leftovers.push(path.relative(workspace.root, file));
    }
  return {
    grader: 'no-unresolved-placeholders',
    pass: leftovers.length === 0,
    failures: leftovers.map((f) => `unresolved {{provider:*}} placeholder in ${f}`),
  };
}

function appendFailureDiagnostics(
  results: GradeResult[],
  launch: SkillRunResult,
  host: Provider,
  transcriptPath: string
): void {
  const explanation = host === PROVIDERS.codex ? finalAgentMessage(launch.events) : '';
  for (const result of results.filter((result) => !result.pass)) {
    if (explanation) result.failures.push(`Codex final response: ${explanation}`);
    result.failures.push(`Full ${host} transcript: ${transcriptPath}`);
  }
}

function gradeBootstrap(
  workspace: Workspace,
  launch: SkillRunResult,
  provider: Provider,
  host: Provider,
  transcriptPath: string
): GradeResult[] {
  const fixture = workspace.fixture;
  const providerRoots = PROVIDER_DETAILS[provider];
  const results: GradeResult[] = [
    gradeTaskTrackingUsed(launch.events, workspace.packageRoot),
    gradeNoPlanModeDuringAutomatedRun(launch.events),
    gradeFilesystem(workspace.root, {
      exists: [`${providerRoots.skills}/dev/SKILL.md`, providerRoots.instructions],
    }),
  ];

  let runId: string;
  try {
    runId = findLaunchRunId(workspace.packageRoot);
  } catch (error) {
    const explanation = finalAgentMessage(launch.events);
    return [
      ...results,
      {
        grader: 'state',
        pass: false,
        failures: [
          (error as Error).message,
          ...(explanation ? [`${host} final response: ${explanation}`] : []),
          `Full ${host} transcript: ${transcriptPath}`,
        ],
      },
    ];
  }
  const containers = fixture.containers.map((container) => container.name);
  results.push(
    gradeLaunchState(workspace.packageRoot, runId, true),
    gradeReferencesResolve(
      workspace.root,
      ['.claude', '.agents', '.codex'],
      [workspace.packageRoot]
    ),
    gradeIntentCleanup(workspace.root, ['.claude', '.agents', '.codex'], [workspace.packageRoot]),
    gradeAdaptationsComplete(workspace.root, provider, workspace.packageRoot, false),
    gradeRootReadmeBudget(workspace.root),
    gradeMcpConfigured(workspace.root, provider, 'aws-mcp'),
    ...(provider === PROVIDERS.codex ? [gradeCodexPlanToolConfigured(workspace.root)] : []),
    gradeAppReadmesLinkToArchitecture(workspace.root, containers),
    gradeHldCoversContainers(workspace.root, containers),
    gradeDocsIndexExists(workspace.root),
    gradeContainerAgentsDeployed(workspace.root, provider, containers),
    gradeProviderPlaceholders(workspace, provider)
  );
  appendFailureDiagnostics(results, launch, host, transcriptPath);
  return results;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walk(full) : [full];
  });
}
