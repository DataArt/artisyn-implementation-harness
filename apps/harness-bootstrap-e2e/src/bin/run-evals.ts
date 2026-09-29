#!/usr/bin/env tsx
/** Runs named eval cases and prints one structured JSON report per case —
 * the format BOOT and PATCH results should converge on regardless of which
 * test framework drove them, so model/version/token/cost metadata can be
 * layered on later without changing consumers.
 */
import { runEvalCase, type EvalCase } from '../testkit/eval-case.ts';
import { boot001Claude } from '../cases/integration/boot-001-claude.case.ts';
import { boot002Codex } from '../cases/integration/boot-002-codex.case.ts';
import { boot003Both } from '../cases/integration/boot-003-both.case.ts';
import { boot004Idempotent } from '../cases/integration/boot-004-idempotent.case.ts';
import { boot005PreserveExistingSettings } from '../cases/integration/boot-005-preserve-existing-settings.case.ts';
import { boot006ClaudeScratch } from '../cases/e2e/boot-006-claude-scratch.case.ts';
import { boot007CodexScratch } from '../cases/e2e/boot-007-codex-scratch.case.ts';
import { patch001PrepareApply } from '../cases/e2e/patch-001-prepare-apply.case.ts';

const registry: Record<string, EvalCase> = {
  'BOOT-001': boot001Claude,
  'BOOT-002': boot002Codex,
  'BOOT-003': boot003Both,
  'BOOT-004': boot004Idempotent,
  'BOOT-005': boot005PreserveExistingSettings,
  'BOOT-006': boot006ClaudeScratch,
  'BOOT-007': boot007CodexScratch,
  'PATCH-001': patch001PrepareApply,
};

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length)
    throw new Error(
      `Usage: run-evals.ts <case-id> [case-id ...]\nKnown: ${Object.keys(registry).join(', ')}`
    );
  let failed = false;
  for (const id of ids) {
    const evalCase = registry[id];
    if (!evalCase)
      throw new Error(`Unknown case: ${id}. Known: ${Object.keys(registry).join(', ')}`);
    const report = await runEvalCase(evalCase);
    console.log(JSON.stringify(report));
    if (!report.passed) failed = true;
  }
  if (failed) process.exitCode = 1;
}

await main();
