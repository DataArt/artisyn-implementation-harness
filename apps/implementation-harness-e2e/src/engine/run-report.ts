import fs from 'node:fs';
import type { CaseReport } from '../cases/_types.ts';
import { persistRuns, reportFile } from '../utils/run-output.ts';

/** Writes the case's result beside the workspaces it ran against, in that
 * case's own `runs/<datetime>-<case-id>/` directory. Discarded runs record
 * nothing — see `utils/run-output.ts` for which layers persist.
 */
export function recordCaseReport(report: CaseReport): void {
  if (!persistRuns) return;
  fs.writeFileSync(reportFile(report.case), `${JSON.stringify(report, null, 2)}\n`);
}
