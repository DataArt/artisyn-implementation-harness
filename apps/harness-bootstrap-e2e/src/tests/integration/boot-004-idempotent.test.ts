import { result } from '../../graders/grading.ts';
import type { GradeContext, GraderBinding } from '../../graders/_types.ts';
import { PROVIDERS } from '../../utils/providers.ts';
import { fixtures } from '../../../fixtures/_registry.ts';
import assert from 'node:assert/strict';
import path from 'node:path';
import type { EvalCase } from './eval-case.ts';
import { readJson } from '../../utils/fs.ts';
import { LAUNCH_RUNS_DIR, MATERIALIZATION_FILE } from '../../utils/constants.ts';
import { createFixture, type Workspace } from '../../utils/fixture.ts';
import { runStubbedLaunch, rematerialize } from '../../utils/build-launch.ts';
import { launchState } from '../../graders/_registry.ts';

const WORKSPACE = 'workspace';
const RECEIPT_BEFORE = 'receiptBefore';
const RECEIPT_AFTER = 'receiptAfter';

interface Receipt {
  files: unknown[];
}

const idempotency = (): GraderBinding => (c) => {
  const before = c.artifacts.get(RECEIPT_BEFORE) as Receipt;
  const after = c.artifacts.get(RECEIPT_AFTER) as Receipt;
  const failures: string[] = [];
  try {
    assert.deepEqual(after.files, before.files);
  } catch {
    failures.push('materialization receipt files changed on a repeat run with no source edits');
  }
  if (after.files.length !== before.files.length)
    failures.push('repeat run duplicated file registrations');
  return result('idempotency', failures);
};

async function setup(): Promise<GradeContext> {
  const workspace = await createFixture(fixtures.nxMonorepo, 'BOOT-004');
  const artifacts = new Map<string, unknown>();
  artifacts.set(WORKSPACE, workspace);

  const providers = [PROVIDERS.claude, PROVIDERS.codex];
  const first = await runStubbedLaunch(workspace, providers, 'boot-004');
  const receiptPath = path.join(
    workspace.packageRoot,
    LAUNCH_RUNS_DIR,
    first.runId,
    MATERIALIZATION_FILE
  );
  artifacts.set(RECEIPT_BEFORE, readJson<Receipt>(receiptPath));
  rematerialize(first);
  artifacts.set(RECEIPT_AFTER, readJson<Receipt>(receiptPath));

  return {
    workspaces: [workspace],
    root: workspace.root,
    packageRoot: workspace.packageRoot,
    fixture: workspace.fixture,
    containers: workspace.fixture.containers.map((container) => container.name),
    providers,
    runId: first.runId,
    artifacts,
  };
}

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
  setup,
  graders: [idempotency(), launchState({ verified: false })],
  cleanup: (context) => (context.artifacts.get(WORKSPACE) as Workspace).cleanup(),
};
