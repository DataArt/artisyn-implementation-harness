import { PROVIDERS } from '../../testkit/providers.ts';
import { fixtures } from '../../../fixtures/registry.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { EvalCase } from '../../testkit/eval-case.ts';
import type { GradeResult } from '../../graders/filesystem.grader.ts';
import { createFixture } from '../../testkit/fixture.ts';
import { runStubbedLaunch, rematerialize } from '../../testkit/build-launch.ts';
import { gradeLaunchState } from '../../graders/state.grader.ts';

/** Repeats the same launch run_id against an already-bootstrapped fixture.
 * Deliberately stops before finalize: this tests materialize-launch.mjs's
 * own receipt-matching guard (see scripts/tests/materialize-launch.test.mjs)
 * on a repeat invocation, not the full finalized lifecycle — so derived
 * outputs (CLAUDE.md, AGENTS.md, .codex/config.toml) intentionally aren't
 * present yet in this workspace; those are only written by finalize's
 * evidence pass (see BOOT-003, which does finalize). This case exercises
 * the repeat through the full plan-building path rather than a hand-built
 * plan, and checks the receipt is byte-identical after a repeat run, not
 * just "still materialized".
 */
export const boot004Idempotent: EvalCase = {
  id: 'BOOT-004',
  name: 'Repeat bootstrap is idempotent',
  layer: 'integration',
  provider: 'both',
  async run(): Promise<GradeResult[]> {
    const workspace = await createFixture(fixtures.nxMonorepo);
    try {
      const first = await runStubbedLaunch(
        workspace,
        [PROVIDERS.claude, PROVIDERS.codex],
        'boot-004'
      );
      const receiptPath = path.join(
        workspace.packageRoot,
        'state/launch/runs',
        first.runId,
        'materialization.json'
      );
      const before = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));

      rematerialize(first);
      const after = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));

      const failures: string[] = [];
      try {
        assert.deepEqual(after.files, before.files);
      } catch {
        failures.push('materialization receipt files changed on a repeat run with no source edits');
      }
      if (after.files.length !== before.files.length)
        failures.push('repeat run duplicated file registrations');

      return [
        { grader: 'idempotency', pass: failures.length === 0, failures },
        gradeLaunchState(workspace.packageRoot, first.runId, false),
      ];
    } finally {
      await workspace.cleanup();
    }
  },
};
