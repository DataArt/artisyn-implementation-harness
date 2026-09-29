import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
// @ts-expect-error -- plain ESM .mjs, no type declarations published
import { buildPlan } from '../../../../.canonical-implementation-harness/scripts/plan-provider-launch.mjs';
import { installSkillPackage, type Workspace } from './fixture.ts';

export type Provider = 'claude' | 'codex';

export interface LaunchResult {
  workspace: Workspace;
  providers: Provider[];
  runId: string;
  plan: unknown;
  planFile: string;
  skills: string[];
}

const sha256 = (data: Buffer) => crypto.createHash('sha256').update(data).digest('hex');

function run(script: string, args: string[], workspace: Workspace) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  if (result.status !== 0)
    throw new Error(
      `${path.basename(script)} ${args.join(' ')} failed in ${workspace.root}:\n${result.stderr}${result.stdout}`
    );
  return result;
}

/** Full selection over every real canonical skill/agent this package ships,
 * mirroring scripts/tests/provider-launch.test.mjs's own fixture recipe —
 * BOOT-* cases exercise the actual current package, not a trimmed stand-in.
 */
function fullSelection(workspace: Workspace, providers: Provider[], runId: string) {
  const skills = fs.readdirSync(path.join(workspace.packageRoot, 'canonical/skills'));
  const agents = fs
    .readdirSync(path.join(workspace.packageRoot, 'canonical/agents'))
    .map((template) => ({ template, name: template === 'layer' ? 'web' : template }));
  return {
    run_id: runId,
    providers,
    skills,
    agents,
    knowns: {
      PROJECT_NAME: {
        value: 'E2E Fixture Project',
        source: 'fixture',
        status: 'verified' as const,
      },
    },
  };
}

/** Runs the deterministic half of launch — Q&A and INTENT derivation are
 * skill judgment and are deliberately NOT simulated here; a plan's `knowns`
 * stand in for a completed Q&A instead. See src/agent-runners for the real
 * agent path this can't substitute for.
 */
export async function runStubbedLaunch(
  workspace: Workspace,
  providers: Provider[],
  runId = 'e2e'
): Promise<LaunchResult> {
  installSkillPackage(workspace, providers[0] ?? 'claude');
  const selection = fullSelection(workspace, providers, runId);
  const plan = buildPlan(workspace.root, workspace.packageRoot, selection);
  const planFile = path.join(workspace.root, `plan-${runId}.json`);
  fs.writeFileSync(planFile, JSON.stringify(plan));
  const materializeScript = path.join(workspace.packageRoot, 'scripts/materialize-launch.mjs');
  run(
    materializeScript,
    ['--root', workspace.root, '--package', workspace.packageRoot, '--plan', planFile, '--check'],
    workspace
  );
  run(
    materializeScript,
    ['--root', workspace.root, '--package', workspace.packageRoot, '--plan', planFile, '--write'],
    workspace
  );
  return { workspace, providers, runId, plan, planFile, skills: selection.skills };
}

/** Re-runs materialize-launch.mjs against the exact plan a prior
 * runStubbedLaunch call already froze — never rebuilds a fresh plan for an
 * existing run_id, since a real repeat plan would legitimately observe
 * already-materialized targets and freeze different `expected_target_sha256`
 * values, which materialize-launch.mjs correctly refuses to reconcile under
 * the same run_id (see materialize-launch.test.mjs's "different plan" check).
 * A genuine repeat *invocation* of an already-completed run is what BOOT-004
 * models: same plan, run again, expect a no-op.
 */
export function rematerialize(result: LaunchResult): void {
  const { workspace, planFile } = result;
  const materializeScript = path.join(workspace.packageRoot, 'scripts/materialize-launch.mjs');
  run(
    materializeScript,
    ['--root', workspace.root, '--package', workspace.packageRoot, '--plan', planFile, '--check'],
    workspace
  );
  run(
    materializeScript,
    ['--root', workspace.root, '--package', workspace.packageRoot, '--plan', planFile, '--write'],
    workspace
  );
}

/** Completes the golden path by simulating the agent's INTENT/verify step
 * with synthetic evidence (same technique provider-launch.test.mjs uses):
 * strips project tokens and records each output as independently verified,
 * so finalize-launch.mjs's real hash/consistency checks still run for real.
 */
export function finalizeStubbedLaunch(result: LaunchResult): void {
  const { workspace, runId } = result;
  const receiptPath = path.join(
    workspace.packageRoot,
    'state/launch/runs',
    runId,
    'materialization.json'
  );
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  const plan = result.plan as { derived_outputs?: Array<{ target: string }> };
  for (const item of plan.derived_outputs ?? [])
    fs.writeFileSync(
      path.join(workspace.root, item.target),
      'Fixture guidance after evidence review\n'
    );
  const evidence = {
    plan_sha256: receipt.plan_sha256,
    outputs: [] as Array<{ target: string; sha256: string; status: string; evidence: string }>,
    checks: [
      { status: 'passed', evidence: 'Synthetic fixture integrity check, not a real launch.' },
    ],
  };
  type ReceiptFile = { target: string; temporary_intent?: boolean };
  for (const item of [
    ...receipt.files.filter((f: ReceiptFile) => !f.temporary_intent),
    ...receipt.derived_outputs,
  ] as ReceiptFile[]) {
    const file = path.join(workspace.root, item.target);
    fs.writeFileSync(
      file,
      fs.readFileSync(file, 'utf8').replace(/\{\{[A-Za-z_][A-Za-z0-9_:.-]*\}\}/g, 'fixture')
    );
    evidence.outputs.push({
      target: item.target,
      sha256: sha256(fs.readFileSync(file)),
      status: 'verified',
      evidence: 'Synthetic adapted fixture',
    });
  }
  const evidenceFile = path.join(workspace.root, `evidence-${runId}.json`);
  fs.writeFileSync(evidenceFile, JSON.stringify(evidence));
  const finalizeScript = path.join(workspace.packageRoot, 'scripts/finalize-launch.mjs');
  run(
    finalizeScript,
    [
      '--root',
      workspace.root,
      '--package',
      workspace.packageRoot,
      '--run',
      runId,
      '--evidence',
      evidenceFile,
      '--check',
    ],
    workspace
  );
  run(
    finalizeScript,
    [
      '--root',
      workspace.root,
      '--package',
      workspace.packageRoot,
      '--run',
      runId,
      '--evidence',
      evidenceFile,
      '--write',
    ],
    workspace
  );
}
