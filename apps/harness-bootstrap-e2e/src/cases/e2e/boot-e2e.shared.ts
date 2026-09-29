import fs from 'node:fs';
import path from 'node:path';
import type { EvalCase } from '../../testkit/eval-case.ts';
import type { GradeResult } from '../../graders/filesystem.grader.ts';
import { createFixture, installSkillPackage } from '../../testkit/fixture.ts';
import type { Provider } from '../../testkit/build-launch.ts';
import { runCodexSkill } from '../../agent-runners/run-codex-skill.ts';
import { runClaudeSkill } from '../../agent-runners/run-claude-skill.ts';
import { gradeFilesystem } from '../../graders/filesystem.grader.ts';
import { gradeLaunchState } from '../../graders/state.grader.ts';
import { parseLaunchReport } from '../../graders/launch-report.ts';
import { gradeReferencesResolve } from '../../graders/references.grader.ts';
import { gradeIntentCleanup } from '../../graders/cleanup.grader.ts';
import {
  gradeTaskTrackingUsed,
  gradeNoPlanModeDuringAutomatedRun,
} from '../../graders/agent-behavior.grader.ts';
import {
  gradeRootReadmeBudget,
  gradeAppReadmesLinkToArchitecture,
  gradeHldCoversContainers,
  gradeDocsIndexExists,
  gradeContainerAgentsDeployed,
} from '../../graders/docs-adoption.grader.ts';
import { gradeMcpConfigured } from '../../graders/mcp.grader.ts';
import { gradeCodexPlanToolConfigured } from '../../graders/config.grader.ts';
import { gradeAdaptationsComplete } from '../../graders/adaptation.grader.ts';
import { buildScratchLaunchPrompt } from './launch-prompt.ts';

const FIXTURE = 'multi-container-project';
const CONTAINERS = ['fe', 'be', 'infra', 'mobile'];

const PROVIDER_ROOTS: Record<Provider, { skills: string; instructions: string }> = {
  claude: { skills: '.claude/skills', instructions: 'CLAUDE.md' },
  codex: { skills: '.agents/skills', instructions: 'AGENTS.md' },
};

/** Read the primary run ID from the launch report. A valid launch may have
 * linked stage plans and verification runs, so the runs directory can contain
 * more than one entry.
 */
function findLaunchRunId(packageRoot: string): string {
  const reportsDir = path.join(packageRoot, 'state/launch/reports');
  const reports = fs.existsSync(reportsDir)
    ? fs.readdirSync(reportsDir)
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
function finalAgentMessage(events: import('../../agent-runners/types.ts').StreamEvent[]): string {
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
export function bootE2eCase(
  id: string,
  name: string,
  provider: Provider,
  host: Provider
): EvalCase {
  return {
    id,
    name,
    layer: 'agent-e2e',
    provider,
    host,
    async run(): Promise<GradeResult[]> {
      const workspace = await createFixture(FIXTURE);
      try {
        installSkillPackage(workspace, host);

        const runner = host === 'codex' ? runCodexSkill : runClaudeSkill;
        const transcriptPath = path.join(
          workspace.packageRoot,
          'state/launch',
          `${host}-transcript-${Date.now()}.jsonl`
        );
        const launch = await runner({
          cwd: workspace.root,
          prompt: buildScratchLaunchPrompt(provider, host),
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

        const providerRoots = PROVIDER_ROOTS[provider];
        const results: GradeResult[] = [];
        results.push(gradeTaskTrackingUsed(launch.events, workspace.packageRoot));
        results.push(gradeNoPlanModeDuringAutomatedRun(launch.events));
        results.push(
          gradeFilesystem(workspace.root, {
            exists: [`${providerRoots.skills}/dev/SKILL.md`, providerRoots.instructions],
          })
        );

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
        results.push(gradeLaunchState(workspace.packageRoot, runId, true));
        results.push(
          gradeReferencesResolve(
            workspace.root,
            ['.claude', '.agents', '.codex'],
            [workspace.packageRoot]
          )
        );
        results.push(
          gradeIntentCleanup(
            workspace.root,
            ['.claude', '.agents', '.codex'],
            [workspace.packageRoot]
          )
        );
        results.push(gradeAdaptationsComplete(workspace.root, provider, workspace.packageRoot, false));

        results.push(gradeRootReadmeBudget(workspace.root));
        results.push(gradeMcpConfigured(workspace.root, provider, 'aws-mcp'));
        if (provider === 'codex') results.push(gradeCodexPlanToolConfigured(workspace.root));
        results.push(gradeAppReadmesLinkToArchitecture(workspace.root, CONTAINERS));
        results.push(gradeHldCoversContainers(workspace.root, CONTAINERS));
        results.push(gradeDocsIndexExists(workspace.root));
        results.push(gradeContainerAgentsDeployed(workspace.root, provider, CONTAINERS));

        const unresolvedProviderTokens = /\{\{provider:[a-z_]+(?::[a-z-]+)?\}\}/;
        const providerSkillsDir = path.join(workspace.root, providerRoots.skills);
        const leftovers: string[] = [];
        if (fs.existsSync(providerSkillsDir))
          for (const file of walk(providerSkillsDir)) {
            if (file === workspace.packageRoot || file.startsWith(workspace.packageRoot + path.sep))
              continue;
            if (unresolvedProviderTokens.test(fs.readFileSync(file, 'utf8')))
              leftovers.push(path.relative(workspace.root, file));
          }
        results.push({
          grader: 'no-unresolved-placeholders',
          pass: leftovers.length === 0,
          failures: leftovers.map((f) => `unresolved {{provider:*}} placeholder in ${f}`),
        });

        const explanation = host === 'codex' ? finalAgentMessage(launch.events) : '';
        if (explanation)
          for (const result of results)
            if (!result.pass) result.failures.push(`Codex final response: ${explanation}`);
        if (results.some((result) => !result.pass))
          for (const result of results)
            if (!result.pass) result.failures.push(`Full ${host} transcript: ${transcriptPath}`);
        return results;
      } finally {
        await workspace.cleanup();
      }
    },
  };
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? walk(full) : [full];
  });
}
