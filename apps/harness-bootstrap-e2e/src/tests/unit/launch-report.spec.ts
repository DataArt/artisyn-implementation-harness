import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { latestLaunchReport, resolveLaunchRunId } from '../../graders/launch-report.ts';
import { LAUNCH_REPORTS_DIR, LAUNCH_RUNS_DIR } from '../../utils/constants.ts';

const roots: string[] = [];
function packageRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-report-test-'));
  roots.push(root);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function writeReport(root: string, name: string, body: string): void {
  const dir = path.join(root, LAUNCH_REPORTS_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), body);
}

function writeRunDirs(root: string, ...ids: string[]): void {
  for (const id of ids) fs.mkdirSync(path.join(root, LAUNCH_RUNS_DIR, id), { recursive: true });
}

describe('resolveLaunchRunId', () => {
  it('reads the run ID the report declares', () => {
    const root = packageRoot();
    writeReport(root, `2026-10-01-launch.md`, '- Run ID: `boot-42`\n');
    expect(resolveLaunchRunId(root)).toBe('boot-42');
  });

  it('prefers the newest report when several exist', () => {
    const root = packageRoot();
    writeReport(root, 'old-launch.md', '- Run ID: `older`\n');
    const dir = path.join(root, LAUNCH_REPORTS_DIR);
    const older = path.join(dir, 'old-launch.md');
    fs.utimesSync(older, new Date(2000, 0, 1), new Date(2000, 0, 1));
    writeReport(root, 'new-launch.md', '- Run ID: `newer`\n');
    expect(resolveLaunchRunId(root)).toBe('newer');
    expect(latestLaunchReport(root)).toContain('newer');
  });

  it('falls back to a lone run directory when no report names one', () => {
    const root = packageRoot();
    writeRunDirs(root, 'only-run');
    expect(resolveLaunchRunId(root)).toBe('only-run');
  });

  it('refuses to guess between several run directories, naming them', () => {
    const root = packageRoot();
    writeRunDirs(root, 'run-a', 'run-b');
    expect(() => resolveLaunchRunId(root)).toThrow(/run-a/);
    expect(() => resolveLaunchRunId(root)).toThrow(/cannot identify primary launch run/);
  });

  it('reports the empty case rather than returning undefined', () => {
    expect(() => resolveLaunchRunId(packageRoot())).toThrow(/cannot identify primary launch run/);
  });
});
