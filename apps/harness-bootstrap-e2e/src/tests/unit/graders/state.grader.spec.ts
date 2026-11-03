import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { afterEach, expect, it } from 'vitest';
import { gradeLaunchState } from '../../../graders/state.grader.ts';
import { LAUNCH_STAGE_COUNT } from '../../../utils/constants.ts';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-state-'));
  roots.push(root);
  const pkg = path.join(root, '.agents/skills/harness-bootstrap');
  fs.mkdirSync(pkg, { recursive: true });
  return { root, pkg };
}
function receipts(root: string, pkg: string, id = 'run') {
  const dir = path.join(pkg, 'state/launch/runs', id);
  fs.mkdirSync(dir, { recursive: true });
  const target = `${id}.md`;
  fs.writeFileSync(path.join(root, target), 'adapted output');
  const receipt = {
    run_id: id,
    status: 'materialized',
    plan_sha256: hash('plan'),
    files: [{ target }],
    derived_outputs: [] as { target: string }[],
  };
  const verification = {
    run_id: id,
    status: 'verified',
    plan_sha256: hash('plan'),
    outputs: [
      {
        target,
        status: 'verified',
        sha256: hash('adapted output'),
        evidence: 'Checked INTENT and links',
      },
    ],
    checks: [{ status: 'passed', evidence: 'All applicable checks passed' }],
  };
  const save = () => {
    fs.writeFileSync(path.join(dir, 'materialization.json'), JSON.stringify(receipt));
    fs.writeFileSync(path.join(dir, 'verification.json'), JSON.stringify(verification));
  };
  save();
  return { dir, target, receipt, verification, save };
}
it('accepts current verified outputs and rejects edited outputs', () => {
  const { root, pkg } = fixture();
  const run = receipts(root, pkg);
  expect(gradeLaunchState(pkg, 'run', true).pass).toBe(true);
  fs.writeFileSync(path.join(root, run.target), 'edited after verification');
  expect(gradeLaunchState(pkg, 'run', true).failures.join(' ')).toContain(
    'changed after verification'
  );
});
it.each(['status', 'run', 'plan', 'checks', 'evidence', 'coverage', 'duplicate', 'output-status'])(
  'rejects invalid %s in verification',
  (kind) => {
    const { root, pkg } = fixture();
    const run = receipts(root, pkg);
    switch (kind) {
      case 'status':
        run.verification.status = 'pending';
        break;
      case 'run':
        run.verification.run_id = 'other';
        break;
      case 'plan':
        run.verification.plan_sha256 = hash('other');
        break;
      case 'checks':
        run.verification.checks = [];
        break;
      case 'evidence':
        run.verification.outputs[0].evidence = '';
        break;
      case 'coverage':
        run.receipt.derived_outputs.push({ target: 'missing.md' });
        break;
      case 'duplicate':
        run.verification.outputs.push(run.verification.outputs[0]);
        break;
      case 'output-status':
        run.verification.outputs[0].status = 'pending';
        break;
    }
    run.save();
    expect(gradeLaunchState(pkg, 'run', true).pass).toBe(false);
  }
);
it('returns a failure instead of throwing on malformed receipt JSON', () => {
  const { root, pkg } = fixture();
  const run = receipts(root, pkg);
  fs.writeFileSync(path.join(run.dir, 'verification.json'), '{');
  expect(gradeLaunchState(pkg, 'run', true).pass).toBe(false);
  fs.writeFileSync(path.join(run.dir, 'materialization.json'), '{');
  expect(gradeLaunchState(pkg, 'run', true).pass).toBe(false);
});
it('rejects traversal and symlink outputs even with matching hashes', () => {
  const { root, pkg } = fixture();
  const run = receipts(root, pkg);
  run.receipt.files[0].target = '../outside.md';
  run.verification.outputs[0].target = '../outside.md';
  run.save();
  expect(gradeLaunchState(pkg, 'run', true).failures.join(' ')).toContain('unsafe output path');
  run.receipt.files[0].target = 'alias.md';
  run.verification.outputs[0].target = 'alias.md';
  fs.symlinkSync(path.join(root, run.target), path.join(root, 'alias.md'));
  run.save();
  expect(gradeLaunchState(pkg, 'run', true).failures.join(' ')).toContain('symlink output path');
});
it('preserves materialization-only assertions', () => {
  const { root, pkg } = fixture();
  const run = receipts(root, pkg);
  expect(gradeLaunchState(pkg, 'run', false).pass).toBe(false);
  fs.unlinkSync(path.join(run.dir, 'verification.json'));
  expect(gradeLaunchState(pkg, 'run', false).pass).toBe(true);
  expect(gradeLaunchState(pkg, 'run', true).pass).toBe(false);
});
it('uses the same verification contract for linked stage receipts', () => {
  const { root, pkg } = fixture();
  const stages = ['a', 'b', 'c'].map((stage) => receipts(root, pkg, `run-${stage}`));
  const reportDir = path.join(pkg, 'state/launch/reports');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, 'latest-launch.md'),
    '| Status | 🔄 In progress |\nRun ID / native Task IDs: `run`\n' +
      Array.from(
        { length: LAUNCH_STAGE_COUNT },
        (_, i) =>
          `| ${i + 1} | Stage | ${i < 11 ? '✅ Complete' : i === 11 ? '🔄 In progress' : '⏳ Pending'} | |`
      ).join('\n')
  );
  fs.mkdirSync(path.join(pkg, 'state/operations'));
  fs.writeFileSync(
    path.join(pkg, 'state/operations/launch.json'),
    JSON.stringify({
      mode: 'launch',
      run_id: 'run',
      status: 'in_progress',
      blockers: ['Independent review and Mermaid rendering unavailable'],
      stage_receipts: stages.map((stage) =>
        path.relative(root, path.join(stage.dir, 'materialization.json'))
      ),
      outputs: stages.flatMap((stage) => stage.verification.outputs),
    })
  );
  expect(gradeLaunchState(pkg, 'run', true).pass).toBe(true);
  stages[0].verification.outputs = [];
  stages[0].save();
  expect(gradeLaunchState(pkg, 'run', true).failures.join(' ')).toContain(
    'exactly every permanent output'
  );
});

function partialFixture(format: 'compact' | 'structured' | 'legacy' = 'compact') {
  const { root, pkg } = fixture();
  const run = receipts(root, pkg);
  fs.unlinkSync(path.join(run.dir, 'verification.json'));
  run.receipt.derived_outputs.push({ target: 'AGENTS.md' });
  fs.writeFileSync(path.join(root, 'AGENTS.md'), 'root instructions');
  fs.writeFileSync(path.join(run.dir, 'materialization.json'), JSON.stringify(run.receipt));
  const dir = path.join(pkg, 'state/launch/reports');
  fs.mkdirSync(dir, { recursive: true });
  const reportPath = path.join(dir, 'latest-launch.md');
  const metadata =
    format === 'legacy'
      ? '| Status | 🔄 In progress |\nRun ID / native Task IDs: `run`'
      : '- Run ID: `run`\n- Status: In progress — Stage E externally blocked';
  let report =
    metadata +
    '\n## Progress\n' +
    Array.from(
      { length: LAUNCH_STAGE_COUNT },
      (_, i) =>
        `| ${i + 1} | Stage | ${i < 11 ? 'Complete' : i === 11 ? 'In progress' : 'Pending'} | evidence |`
    ).join('\n');
  if (format === 'legacy') report = report.replaceAll('| Complete |', '| ✅ Complete |');
  fs.writeFileSync(reportPath, report);
  fs.mkdirSync(path.join(pkg, 'state/operations'));
  const operation = {
    mode: 'launch',
    run_id: 'run',
    status: 'partial',
    plan_sha256: run.receipt.plan_sha256,
    outputs: [
      {
        target: run.target,
        sha256: hash('adapted output'),
        status: 'locally_verified; final_E_gate_pending',
      },
      {
        target: 'AGENTS.md',
        sha256: hash('root instructions'),
        status: 'locally_verified; final_E_gate_pending',
      },
    ],
    checks: {
      local: 'passed: checked tokens, configuration and links',
      independent_review: 'blocked: reviewer dispatch unavailable',
      mermaid: 'blocked: Chromium cannot start in sandbox',
    },
  };
  const save = () => {
    const record =
      format === 'legacy'
        ? {
            mode: operation.mode,
            run_id: operation.run_id,
            status: 'in_progress',
            plan_sha256: operation.plan_sha256,
            files: [
              {
                target: run.target,
                deployed_sha256: operation.outputs[0].sha256,
                status: 'verified-content',
              },
            ],
            derived_outputs: [
              {
                target: 'AGENTS.md',
                sha256: operation.outputs[1].sha256,
                status: 'author-and-orchestrator-checked',
                final_review: 'pending-stage-E',
              },
            ],
            reviews: {
              author_self_check: { status: 'recorded', evidence: 'INTENT applied' },
              orchestrator_verification: {
                status: 'recorded',
                evidence: 'Checked all local outputs',
              },
              independent_satellite_review: {
                status: 'pending',
                blocker: 'Reviewer dispatch unavailable',
              },
              mermaid_gate: { status: 'pending', blocker: 'Chromium sandbox failure' },
            },
          }
        : format === 'structured'
          ? {
              ...operation,
              outputs: operation.outputs.map((output) => ({
                ...output,
                status: 'locally_verified',
              })),
              checks: Object.fromEntries(
                Object.entries(operation.checks).map(([name, value]) => {
                  const [status, evidence] = value.split(': ');
                  return [name, { status, evidence }];
                })
              ),
            }
          : operation;
    fs.writeFileSync(path.join(pkg, 'state/operations/launch.json'), JSON.stringify(record));
  };
  save();
  return { root, pkg, operation, reportPath, save };
}

it.each(['compact', 'structured', 'legacy'] as const)(
  'accepts equivalent %s partial checkpoints with current hashes',
  (format) => {
    const { pkg } = partialFixture(format);
    expect(gradeLaunchState(pkg, 'run', true)).toEqual({
      grader: 'state',
      pass: true,
      failures: [],
    });
  }
);
it.each(['compact', 'structured'] as const)(
  'accepts %s completed review with Mermaid still blocked',
  (format) => {
    const item = partialFixture(format);
    item.operation.checks.independent_review = 'passed: independent reviewer issued go';
    item.save();
    expect(gradeLaunchState(item.pkg, 'run', true).pass).toBe(true);
  }
);

it.each([
  'hash',
  'coverage',
  'duplicate',
  'status',
  'plan',
  'local',
  'review',
  'review-failed',
  'review-no-evidence',
  'no-pending-gate',
  'mermaid',
  'output-status',
  'report-stage',
  'report-complete',
  'report-run',
])('rejects invalid partial checkpoint %s', (kind) => {
  const item = partialFixture();
  switch (kind) {
    case 'hash':
      fs.writeFileSync(path.join(item.root, 'AGENTS.md'), 'changed');
      break;
    case 'coverage':
      item.operation.outputs.pop();
      break;
    case 'duplicate':
      item.operation.outputs.push(item.operation.outputs[0]);
      break;
    case 'status':
      item.operation.status = 'applied';
      break;
    case 'plan':
      item.operation.plan_sha256 = hash('other');
      break;
    case 'local':
      item.operation.checks.local = 'failed: unresolved tokens';
      break;
    case 'review':
      item.operation.checks.independent_review = '';
      break;
    case 'review-failed':
      item.operation.checks.independent_review = 'failed: reviewer issued no-go';
      break;
    case 'review-no-evidence':
      item.operation.checks.independent_review = 'passed';
      break;
    case 'no-pending-gate':
      item.operation.checks.independent_review = 'passed: independent reviewer issued go';
      item.operation.checks.mermaid = 'passed: rendered and reviewed all diagrams';
      break;
    case 'mermaid':
      item.operation.checks.mermaid = 'blocked';
      break;
    case 'output-status':
      item.operation.outputs[0].status = 'pending';
      break;
    case 'report-stage':
      fs.writeFileSync(
        item.reportPath,
        fs
          .readFileSync(item.reportPath, 'utf8')
          .replace('| 4 | Stage | Complete', '| 4 | Stage | Pending')
      );
      break;
    case 'report-complete':
      fs.writeFileSync(
        item.reportPath,
        fs.readFileSync(item.reportPath, 'utf8').replace('Status: In progress', 'Status: Complete')
      );
      break;
    case 'report-run':
      fs.writeFileSync(
        item.reportPath,
        fs.readFileSync(item.reportPath, 'utf8').replace('`run`', '`other`')
      );
      break;
  }
  item.save();
  expect(gradeLaunchState(item.pkg, 'run', true).pass).toBe(false);
});
