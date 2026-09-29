import fs from 'node:fs';
import path from 'node:path';
import type { GradeResult } from './filesystem.grader.ts';
import type { StreamEvent } from '../agent-runners/types.ts';
import { nativeProgress } from './native-progress.ts';
import { parseLaunchReport } from './launch-report.ts';

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
            ['TaskCreate', 'TaskUpdate', 'TaskList', 'TodoWrite', 'update_plan'].includes(
              block.name ?? ''
            ) &&
            !(block.id && failedToolIds.has(block.id))
        )
    ) || events.some((event) => event.item?.type === 'todo_list');
  if (!packageRoot)
    return {
      grader: 'task-tracking',
      pass: nativeUsed,
      failures: nativeUsed ? [] : ['No native progress events found'],
    };
  const dir = path.join(packageRoot, 'state/launch/reports');
  const latest = (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
    .filter((file) => file.endsWith('-launch.md'))
    .sort(
      (a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs
    )[0];
  if (!latest)
    return { grader: 'task-tracking', pass: false, failures: ['Missing durable launch report'] };
  const text = fs.readFileSync(path.join(dir, latest), 'utf8');
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
  if (rows.length !== 14 || rows.some((row, index) => Number(row[1]) !== index + 1))
    failures.push('Report must contain exactly the 14 launch stages in order');
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
    if (!snapshot || snapshot.length !== 14)
      failures.push('Native tracker must expose a final snapshot of all 14 launch stages');
    else
      for (let index = 0; index < 14; index++) {
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
  return { grader: 'task-tracking', pass: failures.length === 0, failures };
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
  return {
    grader: 'no-plan-mode',
    pass: planModeCalls.length === 0,
    failures:
      planModeCalls.length === 0
        ? []
        : [
            `unexpected plan-mode tool call(s) during an automated launch: ${planModeCalls.join(', ')}`,
          ],
  };
}
