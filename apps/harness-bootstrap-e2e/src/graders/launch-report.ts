import fs from 'node:fs';
import path from 'node:path';

/** The report is Markdown: status icons and bullet/table metadata are presentation. */
export function reportField(text: string, label: string): string | undefined {
  const plain = text.replace(/\*\*/g, '');
  return (
    plain.match(new RegExp(`^\\s*(?:-\\s*)?${label}\\s*:\\s*(.+)$`, 'im'))?.[1]?.trim() ??
    plain.match(new RegExp(`^\\|\\s*${label}\\s*\\|\\s*([^|]+)\\|`, 'im'))?.[1]?.trim()
  );
}

export function normalizeProgressStatus(value: string): string {
  return value
    .replace(/[✅🔄⏳`]/gu, '')
    .trim()
    .toLowerCase()
    .replace(/^completed$/, 'complete');
}

export function parseLaunchReport(text: string) {
  const runId = reportField(text, 'Run ID(?:\\s*/\\s*native Task IDs)?')?.match(
    /`?([A-Za-z0-9_-]+)/
  )?.[1];
  const progress = text.split(/^## Progress\s*$/m)[1]?.split(/^##\s/m)[0] ?? text;
  const stages = [...progress.matchAll(/^\|\s*(\d+)\s*\|\s*[^|]+\|\s*([^|]+)\|[^\n]*$/gm)].map(
    (row) => ({ number: Number(row[1]), status: normalizeProgressStatus(row[2]) })
  );
  return { runId, status: normalizeProgressStatus(reportField(text, 'Status') ?? ''), stages };
}

export function findLaunchReport(packageRoot: string, runId: string): string | undefined {
  const dir = path.join(packageRoot, 'state/launch/reports');
  return (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
    .filter((name) => name.endsWith('-launch.md'))
    .map((name) => fs.readFileSync(path.join(dir, name), 'utf8'))
    .find((text) => parseLaunchReport(text).runId === runId);
}

export function gradeStageEReport(text: string | undefined, runId: string): string[] {
  if (!text) return [`missing report for partial run ${runId}`];
  const report = parseLaunchReport(text);
  const failures: string[] = [];
  if (!/^in progress\b/.test(report.status))
    failures.push('partial launch report must remain In progress');
  if (report.stages.length !== 14 || report.stages.some((stage, i) => stage.number !== i + 1))
    failures.push('partial launch report must contain all 14 stages in order');
  for (let number = 1; number <= 14; number++) {
    const expected = number <= 11 ? 'complete' : number === 12 ? 'in progress' : 'pending';
    if (report.stages.find((stage) => stage.number === number)?.status !== expected)
      failures.push(`partial launch stage ${number} must be ${expected}`);
  }
  return failures;
}
