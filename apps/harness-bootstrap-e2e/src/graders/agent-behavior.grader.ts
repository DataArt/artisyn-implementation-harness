import { result } from './grading.ts';
import type { GradeResult, GraderBinding } from './_types.ts';
import { LAUNCH_STAGE_COUNT } from '../utils/constants.ts';
import type { StreamEvent } from '../agent-runners/_types.ts';
import { nativeProgress } from './native-progress.ts';
import { latestLaunchReport, parseLaunchReport } from './launch-report.ts';

/** Tool names any supported host may use for its own progress tracker. */
const NATIVE_TRACKER_TOOLS = ['TaskCreate', 'TaskUpdate', 'TaskList', 'TodoWrite', 'update_plan'];

function toolUseNames(events: StreamEvent[]): string[] {
  const names: string[] = [];
  for (const event of events) {
    if (event.type !== 'assistant') continue;
    for (const block of event.message?.content ?? [])
      if (block.type === 'tool_use' && block.name) names.push(block.name);
  }
  return names;
}

/** A launch must preserve its durable report and mirror native progress when used.
 * This grades tracking accuracy, not whether external launch gates passed. */
export function gradeTaskTrackingUsed(events: StreamEvent[], packageRoot?: string): GradeResult {
  const failures: string[] = [];
  const failedToolIds = new Set(
    events
      .flatMap((event) => event.message?.content ?? [])
      .filter((block) => block.type === 'tool_result' && block.is_error)
      .map((block) => block.tool_use_id)
  );
  const nativeUsed =
    events.some(
      (event) =>
        event.type === 'assistant' &&
        event.message?.content?.some(
          (block) =>
            block.type === 'tool_use' &&
            NATIVE_TRACKER_TOOLS.includes(block.name ?? '') &&
            !(block.id && failedToolIds.has(block.id))
        )
    ) || events.some((event) => event.item?.type === 'todo_list');
  if (!packageRoot)
    return result('task-tracking', nativeUsed ? [] : ['No native progress events found']);
  const text = latestLaunchReport(packageRoot);
  if (!text) return result('task-tracking', ['Missing durable launch report']);
  const progress = text.split(/^## Progress\s*$/m)[1]?.split(/^##\s/m)[0] ?? '';
  const rows = [...progress.matchAll(/^\|\s*(\d+)\s*\|\s*[^|]+\|\s*([^|]+)\|[^\n]*$/gm)];
  const statuses = rows.map((row) =>
    row[2]
      .replace(/[✅🔄⏳]/gu, '')
      .trim()
      .toLowerCase()
      .replace(/^completed$/, 'complete')
  );
  const tracker = text.match(/(?:tracker|tracking mechanism)\s*[:|]([^\n]+)/i)?.[1] ?? '';
  if (!tracker.trim()) failures.push('Report must declare its tracking mechanism');
  if (rows.length !== LAUNCH_STAGE_COUNT || rows.some((row, index) => Number(row[1]) !== index + 1))
    failures.push(`Report must contain exactly the ${LAUNCH_STAGE_COUNT} launch stages in order`);
  if (statuses.some((status) => !['pending', 'in progress', 'complete'].includes(status)))
    failures.push('Report contains invalid stage statuses');
  const firstIncomplete = statuses.findIndex((status) => status !== 'complete');
  if (
    firstIncomplete !== -1 &&
    (statuses[firstIncomplete] !== 'in progress' ||
      statuses.slice(firstIncomplete + 1).some((status) => status !== 'pending'))
  )
    failures.push(
      'Stage order violated: only the first incomplete stage may be in progress; its dependents must remain pending'
    );

  const runId = parseLaunchReport(text).runId;
  const nativeDeclared =
    /update_plan|TaskCreate|TaskUpdate|TaskList|TodoWrite|native/i.test(tracker) &&
    !/report.only|unavailable|not exposed/i.test(tracker);
  if (nativeUsed || nativeDeclared) {
    const snapshot = nativeProgress(events, runId);
    if (!snapshot || snapshot.length !== LAUNCH_STAGE_COUNT)
      failures.push(
        `Native tracker must expose a final snapshot of all ${LAUNCH_STAGE_COUNT} launch stages`
      );
    else
      for (let index = 0; index < LAUNCH_STAGE_COUNT; index++) {
        const item = snapshot[index];
        if (
          item.completed !== (statuses[index] === 'complete') ||
          (item.status &&
            item.status.replace('_', ' ').replace(/^completed$/, 'complete') !== statuses[index])
        )
          failures.push(`Native tracker and report disagree for stage ${index + 1}`);
      }
  } else if (!/report|checklist/i.test(tracker)) {
    failures.push('Without native tracking the report must declare report/checklist fallback');
  }
  return result('task-tracking', failures);
}

/** SKILL.md: "Updating progress does not enter Plan mode." Plan mode is for
 * proposing a change before making it — launch is a well-defined lifecycle
 * that's supposed to just execute once Q&A resolves, not stop and re-plan.
 * Seeing EnterPlanMode/ExitPlanMode during a headless launch turn is a sign
 * the agent second-guessed its own instructions mid-run.
 */
export function gradeNoPlanModeDuringAutomatedRun(events: StreamEvent[]): GradeResult {
  const names = toolUseNames(events);
  const planModeCalls = names.filter((n) => n === 'EnterPlanMode' || n === 'ExitPlanMode');
  return result(
    'no-plan-mode',
    planModeCalls.length === 0
      ? []
      : [
          `unexpected plan-mode tool call(s) during an automated launch: ${planModeCalls.join(', ')}`,
        ]
  );
}

export const taskTrackingUsed = (): GraderBinding => (c) =>
  gradeTaskTrackingUsed(c.launch?.events ?? [], c.packageRoot);

export const noPlanModeDuringAutomatedRun = (): GraderBinding => (c) =>
  gradeNoPlanModeDuringAutomatedRun(c.launch?.events ?? []);

export const agentRunSucceeded = (): GraderBinding => (c) => {
  if (!c.launch) return result('agent-run', ['no launch result was recorded']);
  if (c.launch.exitCode === 0) return result('agent-run', []);
  return result('agent-run', [
    `${c.host} launch exited ${c.launch.exitCode}:\n${c.launch.stderr}\n${c.launch.stdout}`,
  ]);
};
