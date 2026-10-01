import fs from 'node:fs';
import path from 'node:path';
import type { CaseReport } from '../cases/_types.ts';
import { persistRuns, reportFile } from '../utils/run-output.ts';

interface RunReport {
  run: string;
  startedAt: string;
  cases: CaseReport[];
}

let report: RunReport | undefined;

/** Accumulates every case executed in this process, rewritten after each one
 * so a crashed or killed run still leaves the results that did complete.
 * Discarded runs record nothing — see `utils/run-output.ts` for which layers
 * persist.
 */
export function recordCaseReport(caseReport: CaseReport): void {
  if (!persistRuns) return;
  const file = reportFile();
  report ??= {
    run: path.basename(path.dirname(file)),
    startedAt: new Date().toISOString(),
    cases: [],
  };
  report.cases.push(caseReport);
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
}
