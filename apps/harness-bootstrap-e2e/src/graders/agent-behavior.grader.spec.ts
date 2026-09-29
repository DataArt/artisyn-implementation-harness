import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { gradeTaskTrackingUsed } from './agent-behavior.grader.ts';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});
it('accepts native tracking from either host', () => {
  expect(
    gradeTaskTrackingUsed([
      { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'TaskCreate' }] } },
    ]).pass
  ).toBe(true);
  expect(
    gradeTaskTrackingUsed([
      { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'update_plan' }] } },
    ]).pass
  ).toBe(true);
  expect(
    gradeTaskTrackingUsed([
      {
        type: 'item.updated',
        item: { type: 'todo_list', items: [{ text: 'Inspect', completed: false }] },
      },
    ]).pass
  ).toBe(true);
  expect(gradeTaskTrackingUsed([]).pass).toBe(false);
});
it('accepts accurate in-progress report tracking even when launch gates block completion', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tracking-'));
  roots.push(root);
  const dir = path.join(root, 'state/launch/reports');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '20260929-launch.md');
  const rows = Array.from(
    { length: 14 },
    (_, i) => `| ${i + 1} | Stage | Complete | evidence |`
  ).join('\n');
  fs.writeFileSync(file, `## Progress\n${rows}\n\n## Answers\n`);
  expect(gradeTaskTrackingUsed([], root).pass).toBe(false);
  fs.writeFileSync(file, `Tracker: report\n## Progress\n${rows}\n\n## Answers\n`);
  expect(gradeTaskTrackingUsed([], root).pass).toBe(true);
  const inProgressRows = Array.from({ length: 14 }, (_, i) => {
    const stage = i + 1;
    const status = stage <= 11 ? '✅ Complete' : stage === 12 ? '🔄 In progress' : '⏳ Pending';
    return `| ${stage} | Stage | ${status} | evidence |`;
  }).join('\n');
  fs.writeFileSync(file, `Tracker: report\n## Progress\n${inProgressRows}\n\n## Answers\n`);
  expect(gradeTaskTrackingUsed([], root).pass).toBe(true);
  const staleRows = rows
    .replaceAll('Complete', 'Pending')
    .replace('| 1 | Stage | Pending |', '| 1 | Stage | ✅ Complete |');
  fs.writeFileSync(file, `Tracker: report\n## Progress\n${staleRows}\n\n## Answers\n`);
  expect(gradeTaskTrackingUsed([], root).pass).toBe(false);
  const completeRows = Array.from(
    { length: 14 },
    (_, i) => `| ${i + 1} | Stage | ✅ Complete | evidence |`
  ).join('\n');
  fs.writeFileSync(file, `Tracker: report\n## Progress\n${completeRows}\n\n## Answers\n`);
  expect(gradeTaskTrackingUsed([], root).pass).toBe(true);
  fs.writeFileSync(
    file,
    `Tracker: report\n## Progress\n${rows.replace('| 14 |', '| 13 |')}\n\n## Answers\n`
  );
  expect(gradeTaskTrackingUsed([], root).pass).toBe(false);
});

function launchReport(completed = 3): string {
  return (
    'Tracker: update_plan\nRun ID / native Task IDs: `run`\n## Progress\n' +
    Array.from(
      { length: 14 },
      (_, i) =>
        `| ${i + 1} | Stage | ${i < completed ? 'Complete' : i === completed ? 'In progress' : 'Pending'} | evidence |`
    ).join('\n')
  );
}
function trackingWorkspace(report: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tracking-'));
  roots.push(root);
  const dir = path.join(root, 'state/launch/reports');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'latest-launch.md'), report);
  return root;
}
it('requires report and final Codex snapshot to agree, even after an earlier matching snapshot', () => {
  const root = trackingWorkspace(launchReport());
  const snapshot = (completed: number) => ({
    type: 'item.updated',
    item: {
      type: 'todo_list',
      items: Array.from({ length: 14 }, (_, i) => ({
        text: `[harness-bootstrap run] Stage ${i + 1}`,
        completed: i < completed,
      })),
    },
  });
  expect(gradeTaskTrackingUsed([snapshot(3)], root).pass).toBe(true);
  expect(gradeTaskTrackingUsed([snapshot(3), snapshot(2)], root).failures.join(' ')).toContain(
    'disagree for stage 3'
  );
  expect(gradeTaskTrackingUsed([snapshot(3)], trackingWorkspace(launchReport(7))).pass).toBe(false);
  expect(
    gradeTaskTrackingUsed(
      [snapshot(3)],
      trackingWorkspace(launchReport().replace('| 8 | Stage | Pending', '| 8 | Stage | Complete'))
    ).failures.join(' ')
  ).toContain('Stage order violated');
  expect(
    gradeTaskTrackingUsed(
      [snapshot(3)],
      trackingWorkspace(launchReport().replace('## Progress', '## Missing'))
    ).pass
  ).toBe(false);
});
it('does not accept a native call alone or an incomplete native snapshot for a launch', () => {
  const root = trackingWorkspace(launchReport());
  expect(
    gradeTaskTrackingUsed(
      [{ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'update_plan' }] } }],
      root
    ).pass
  ).toBe(false);
  expect(
    gradeTaskTrackingUsed(
      [
        {
          type: 'item.updated',
          item: { type: 'todo_list', items: [{ text: 'Setup', completed: true }] },
        },
      ],
      root
    ).pass
  ).toBe(false);
});
it('reconstructs Claude tasks by ID and ignores failed updates', () => {
  const root = trackingWorkspace(launchReport().replace('update_plan', 'TaskCreate/TaskUpdate'));
  const events: import('../agent-runners/types.ts').StreamEvent[] = [];
  for (let i = 1; i <= 14; i++) {
    events.push({
      type: 'assistant',
      message: {
        content: [
          {
            type: 'tool_use',
            id: `create${i}`,
            name: 'TaskCreate',
            input: { subject: `[harness-bootstrap run] Stage ${i}` },
          },
        ],
      },
    });
    events.push({
      type: 'user',
      message: {
        content: [
          {
            type: 'tool_result',
            tool_use_id: `create${i}`,
            content: `Task #${i + 100} created successfully`,
          },
        ],
      },
    });
    if (i <= 4) {
      events.push({
        type: 'assistant',
        message: {
          content: [
            {
              type: 'tool_use',
              id: `update${i}`,
              name: 'TaskUpdate',
              input: { taskId: String(i + 100), status: i <= 3 ? 'completed' : 'in_progress' },
            },
          ],
        },
      });
      events.push({
        type: 'user',
        message: {
          content: [{ type: 'tool_result', tool_use_id: `update${i}`, content: 'Updated task' }],
        },
      });
    }
  }
  expect(gradeTaskTrackingUsed(events, root).pass).toBe(true);
  events.find(
    (event) => event.message?.content?.[0].tool_use_id === 'update3'
  )!.message!.content![0].is_error = true;
  expect(gradeTaskTrackingUsed(events, root).pass).toBe(false);
});
it('allows report fallback after a native tracker discovery failure', () => {
  const root = trackingWorkspace(
    launchReport().replace('update_plan', 'report-only; native TaskList unavailable')
  );
  expect(
    gradeTaskTrackingUsed(
      [
        {
          type: 'assistant',
          message: { content: [{ type: 'tool_use', id: 'list', name: 'TaskList' }] },
        },
        {
          type: 'user',
          message: {
            content: [
              { type: 'tool_result', tool_use_id: 'list', is_error: true, content: 'Unavailable' },
            ],
          },
        },
      ],
      root
    ).pass
  ).toBe(true);
});
