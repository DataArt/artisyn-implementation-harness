import type { ContentBlock, StreamEvent } from '../agent-runners/types.ts';

export interface ProgressItem {
  text: string;
  completed: boolean;
  status?: string;
}

function items(value: unknown): ProgressItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result: ProgressItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return undefined;
    const text = item.text ?? item.step ?? item.content ?? item.subject;
    if (typeof text !== 'string') return undefined;
    if (
      typeof item.completed !== 'boolean' &&
      !['pending', 'in_progress', 'completed'].includes(item.status)
    )
      return undefined;
    result.push({
      text,
      completed: item.completed ?? item.status === 'completed',
      status: item.status,
    });
  }
  return result;
}

function resultText(block?: ContentBlock): string {
  return typeof block?.content === 'string'
    ? block.content
    : (block?.content?.map((part) => part.text ?? '').join('\n') ?? '');
}

/** Normalize Codex snapshots and Claude task mutations without treating a tool
 * invocation alone as proof of the final task state. */
export function nativeProgress(events: StreamEvent[], runId?: string): ProgressItem[] | undefined {
  const results = new Map<string, ContentBlock>();
  for (const event of events)
    for (const block of event.message?.content ?? [])
      if (block.type === 'tool_result' && block.tool_use_id) results.set(block.tool_use_id, block);
  let snapshot: ProgressItem[] | undefined;
  const tasks = new Map<string, ProgressItem>();
  for (const event of events) {
    if (event.item?.type === 'todo_list') snapshot = items(event.item.items);
    if (event.type !== 'assistant') continue;
    for (const block of event.message?.content ?? []) {
      if (block.type !== 'tool_use') continue;
      const response = block.id ? results.get(block.id) : undefined;
      if (response?.is_error) continue;
      const input = block.input ?? {};
      if (block.name === 'update_plan') snapshot = items(input.plan);
      if (block.name === 'TodoWrite') snapshot = items(input.todos);
      if (block.name === 'TaskCreate' && response) {
        const text = resultText(response);
        let id = text.match(/Task\s*#(\S+)\s+created/i)?.[1];
        try {
          const parsed = JSON.parse(text);
          id = String(parsed.task?.id ?? parsed.id ?? id ?? '');
        } catch {
          /* Claude may return a plain-text task receipt. */
        }
        if (id && typeof input.subject === 'string')
          tasks.set(id, { text: input.subject, status: 'pending', completed: false });
      }
      if (block.name === 'TaskUpdate' && response && typeof input.taskId === 'string') {
        const previous = tasks.get(input.taskId);
        if (input.status === 'deleted') tasks.delete(input.taskId);
        else if (previous)
          tasks.set(input.taskId, {
            text: typeof input.subject === 'string' ? input.subject : previous.text,
            status: typeof input.status === 'string' ? input.status : previous.status,
            completed: input.status ? input.status === 'completed' : previous.completed,
          });
      }
      if (block.name === 'TaskList' && response) {
        const text = resultText(response);
        try {
          const parsed = JSON.parse(text);
          const list = Array.isArray(parsed) ? parsed : parsed.tasks;
          if (Array.isArray(list) && items(list)) {
            tasks.clear();
            list.forEach((task) => tasks.set(String(task.id), items([task])![0]));
          }
        } catch {
          const rows = [
            ...text.matchAll(/^#(\S+)\s+\[(pending|in_progress|completed)\]\s+(.+)$/gm),
          ];
          if (rows.length) {
            tasks.clear();
            for (const row of rows)
              tasks.set(row[1], {
                text: row[3],
                status: row[2],
                completed: row[2] === 'completed',
              });
          }
        }
      }
    }
  }
  if (tasks.size) snapshot = [...tasks.values()];
  if (runId && snapshot?.some((item) => item.text.includes('[harness-bootstrap ')))
    snapshot = snapshot.filter((item) => item.text.includes(`[harness-bootstrap ${runId}]`));
  return snapshot;
}
