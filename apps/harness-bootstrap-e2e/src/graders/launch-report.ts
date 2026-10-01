import fs from 'node:fs';
import path from 'node:path';
import {
  LAUNCH_REPORTS_DIR,
  LAUNCH_REPORT_SUFFIX,
  LAUNCH_RUNS_DIR,
  LAUNCH_STAGE_COUNT,
} from '../utils/constants.ts';

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

/** Every launch report in the package, newest first. A launch can write
 * several — linked stage plans and verification runs each get one — so order
 * matters to callers that want "the current one".
 */
export function launchReports(packageRoot: string): string[] {
  const dir = path.join(packageRoot, LAUNCH_REPORTS_DIR);
  return (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
    .filter((name) => name.endsWith(LAUNCH_REPORT_SUFFIX))
    .map((name) => path.join(dir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    .map((file) => fs.readFileSync(file, 'utf8'));
}

export function findLaunchReport(packageRoot: string, runId: string): string | undefined {
  return launchReports(packageRoot).find((text) => parseLaunchReport(text).runId === runId);
}

export function latestLaunchReport(packageRoot: string): string | undefined {
  return launchReports(packageRoot)[0];
}

/** The run ID a completed launch reported. Falls back to a lone directory
 * under `state/launch/runs/` when no report names one; anything else is
 * ambiguous and says so, since picking the wrong run would grade the wrong
 * receipts.
 */
export function resolveLaunchRunId(packageRoot: string): string {
  for (const text of launchReports(packageRoot)) {
    const runId = parseLaunchReport(text).runId;
    if (runId) return runId;
  }
  const runsDir = path.join(packageRoot, LAUNCH_RUNS_DIR);
  const runs = fs.existsSync(runsDir) ? fs.readdirSync(runsDir) : [];
  if (runs.length !== 1)
    throw new Error(
      `cannot identify primary launch run from report; run directories: ${JSON.stringify(runs)}`
    );
  return runs[0];
}

export function gradeStageEReport(text: string | undefined, runId: string): string[] {
  if (!text) return [`missing report for partial run ${runId}`];
  const report = parseLaunchReport(text);
  const failures: string[] = [];
  if (!/^in progress\b/.test(report.status))
    failures.push('partial launch report must remain In progress');
  if (
    report.stages.length !== LAUNCH_STAGE_COUNT ||
    report.stages.some((stage, i) => stage.number !== i + 1)
  )
    failures.push(`partial launch report must contain all ${LAUNCH_STAGE_COUNT} stages in order`);
  for (let number = 1; number <= LAUNCH_STAGE_COUNT; number++) {
    const expected = number <= 11 ? 'complete' : number === 12 ? 'in progress' : 'pending';
    if (report.stages.find((stage) => stage.number === number)?.status !== expected)
      failures.push(`partial launch stage ${number} must be ${expected}`);
  }
  return failures;
}
