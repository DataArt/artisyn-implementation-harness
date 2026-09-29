import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { GradeResult } from './filesystem.grader.ts';
import { findLaunchReport, gradeStageEReport, normalizeProgressStatus } from './launch-report.ts';

/** Exact-match: the materialization/verification receipts
 * materialize-launch.mjs / finalize-launch.mjs write under
 * `<packageRoot>/state/launch/runs/<run_id>/`.
 */
export function gradeLaunchState(
  packageRoot: string,
  runId: string,
  expectVerified: boolean
): GradeResult {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(runId)) throw new Error('unsafe launch run ID');
    return gradeState(packageRoot, runId, expectVerified);
  } catch (error) {
    return {
      grader: 'state',
      pass: false,
      failures: [`invalid launch state: ${(error as Error).message}`],
    };
  }
}

/** Use the same receipt contract for primary and linked stage runs. */
function verifyReceipt(packageRoot: string, runId: string): string[] {
  const failures: string[] = [];
  try {
    const dir = path.join(packageRoot, 'state/launch/runs', runId);
    const receipt = JSON.parse(fs.readFileSync(path.join(dir, 'materialization.json'), 'utf8'));
    const verification = JSON.parse(fs.readFileSync(path.join(dir, 'verification.json'), 'utf8'));
    if (
      receipt.run_id !== runId ||
      receipt.status !== 'materialized' ||
      verification.run_id !== runId ||
      verification.status !== 'verified' ||
      !/^[a-f0-9]{64}$/.test(receipt.plan_sha256 ?? '') ||
      verification.plan_sha256 !== receipt.plan_sha256
    )
      failures.push(`${runId}: verification does not match the materialized run and plan`);
    if (
      !Array.isArray(receipt.files) ||
      !Array.isArray(receipt.derived_outputs) ||
      !Array.isArray(verification.outputs)
    )
      throw new Error('missing receipt output arrays');
    if (
      !Array.isArray(verification.checks) ||
      !verification.checks.length ||
      verification.checks.some(
        (check: { status?: string; evidence?: string }) =>
          check.status !== 'passed' || typeof check.evidence !== 'string' || !check.evidence.trim()
      )
    )
      failures.push(`${runId}: verification requires passed checks with evidence`);
    const expected = [
      ...receipt.files.filter((file: { temporary_intent?: boolean }) => !file.temporary_intent),
      ...receipt.derived_outputs,
    ].map((file: { target: string }) => file.target);
    const actual = verification.outputs.map((output: { target: string }) => output.target);
    if (
      !expected.length ||
      new Set(expected).size !== expected.length ||
      new Set(actual).size !== actual.length ||
      expected.length !== actual.length ||
      expected.some((target: string) => !actual.includes(target))
    )
      failures.push(`${runId}: verification must cover exactly every permanent output`);
    const projectRoot = path.resolve(packageRoot, '../../..');
    for (const output of verification.outputs) {
      const target = checkedOutputPath(projectRoot, packageRoot, output.target);
      if (
        output.status !== 'verified' ||
        typeof output.evidence !== 'string' ||
        !output.evidence.trim()
      )
        failures.push(`${runId}: missing semantic evidence for ${output.target}`);
      const currentHash = createHash('sha256').update(fs.readFileSync(target)).digest('hex');
      if (currentHash !== output.sha256)
        failures.push(`${runId}: launch output changed after verification: ${output.target}`);
    }
  } catch (error) {
    failures.push(`${runId}: invalid verification receipt: ${(error as Error).message}`);
  }
  return failures;
}

function checkedOutputPath(root: string, packageRoot: string, relative: unknown): string {
  if (
    typeof relative !== 'string' ||
    path.isAbsolute(relative) ||
    relative.includes('\\') ||
    relative.split('/').some((part) => !part || part === '.' || part === '..' || part === '.git')
  )
    throw new Error(`unsafe output path: ${String(relative)}`);
  let target = root;
  for (const part of relative.split('/')) {
    target = path.join(target, part);
    if (fs.lstatSync(target).isSymbolicLink()) throw new Error(`symlink output path: ${relative}`);
  }
  if (
    target === path.resolve(packageRoot) ||
    target.startsWith(path.resolve(packageRoot) + path.sep) ||
    !fs.statSync(target).isFile()
  )
    throw new Error(`invalid output file: ${relative}`);
  return target;
}

function gradeState(packageRoot: string, runId: string, expectVerified: boolean): GradeResult {
  const failures: string[] = [];
  const runDir = path.join(packageRoot, 'state/launch/runs', runId);
  const receiptPath = path.join(runDir, 'materialization.json');
  if (!fs.existsSync(receiptPath)) {
    if (expectVerified) return gradeLinkedLaunchState(packageRoot, runId);
    failures.push(`missing materialization receipt: ${receiptPath}`);
    return { grader: 'state', pass: false, failures };
  }
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  if (receipt.run_id !== runId)
    failures.push(`receipt run_id mismatch: expected ${runId}, got ${receipt.run_id}`);
  if (receipt.status !== 'materialized')
    failures.push(`receipt status is ${receipt.status}, expected materialized`);
  if (!Array.isArray(receipt.files) || !receipt.files.length)
    failures.push('receipt recorded no materialized files');

  const verificationPath = path.join(runDir, 'verification.json');
  const verified = fs.existsSync(verificationPath);
  if (expectVerified && !verified) {
    const partialFailures = gradeExternalGatePartialLaunch(packageRoot, runId, receipt);
    if (partialFailures.length) failures.push(...partialFailures);
  }
  if (expectVerified && verified) failures.push(...verifyReceipt(packageRoot, runId));
  if (!expectVerified && verified)
    failures.push(
      `unexpected verification receipt present (finalize was not run): ${verificationPath}`
    );

  return { grader: 'state', pass: failures.length === 0, failures };
}

/** Accept a truthful Stage E stop only when stages 1–11 and all their recorded
 * outputs are current. This preserves the distinction between a verified
 * partial installation and a finalized launch. */
function gradeExternalGatePartialLaunch(
  packageRoot: string,
  runId: string,
  receipt: {
    run_id?: string;
    status?: string;
    plan_sha256?: string;
    files?: Array<{ target: string; temporary_intent?: boolean }>;
    derived_outputs?: Array<{ target: string }>;
  }
): string[] {
  const failures: string[] = [];
  try {
    const operationsDir = path.join(packageRoot, 'state/operations');
    const operations = (fs.existsSync(operationsDir) ? fs.readdirSync(operationsDir) : [])
      .filter((name) => name.endsWith('.json'))
      .map((name) => JSON.parse(fs.readFileSync(path.join(operationsDir, name), 'utf8')))
      .filter((item) => item.mode === 'launch' && item.run_id === runId);
    if (operations.length !== 1) return [`no unique launch operation for partial run ${runId}`];
    const operation = operations[0];
    if (
      receipt.run_id !== runId ||
      receipt.status !== 'materialized' ||
      !['partial', 'in_progress'].includes(operation.status) ||
      !/^[a-f0-9]{64}$/.test(receipt.plan_sha256 ?? '') ||
      operation.plan_sha256 !== receipt.plan_sha256
    )
      failures.push('partial launch operation does not match its materialization receipt');

    failures.push(...gradeStageEReport(findLaunchReport(packageRoot, runId), runId));
    // The report owns stage progress. Older records also duplicated it in JSON;
    // when that map is present, it must agree rather than override the report.
    if (operation.stages) {
      const keys = [
        '1',
        '2',
        '3',
        'A',
        'B',
        'C',
        'D.1',
        'D.2',
        'D.3',
        'D.4',
        'D.5',
        'E',
        'cleanup',
        'F/G',
      ];
      for (const [index, key] of keys.entries()) {
        const expected = index < 11 ? 'complete' : index === 11 ? 'in progress' : 'pending';
        const actual = normalizeProgressStatus(
          String(operation.stages[key] ?? '').replaceAll('_', ' ')
        );
        if (actual !== expected)
          failures.push(`operation stage ${key} disagrees with the partial report`);
      }
    }
    const reviews = operation.reviews ?? {};
    const local = readCheckpointCheck(operation.checks?.local);
    const legacyLocal = [reviews.author_self_check, reviews.orchestrator_verification];
    if (
      !(local.status === 'passed' && local.evidence) &&
      !legacyLocal.every(
        (check) =>
          check?.status === 'recorded' &&
          typeof check.evidence === 'string' &&
          check.evidence.trim()
      )
    )
      failures.push('partial operation needs recorded local verification evidence');
    const gates = [
      [
        'independent review',
        operation.checks?.independent_review ?? reviews.independent_satellite_review,
      ],
      ['Mermaid', operation.checks?.mermaid ?? reviews.mermaid_gate],
    ];
    for (const [name, value] of gates) {
      const check = readCheckpointCheck(value);
      if (!['pending', 'blocked'].includes(check.status) || !check.evidence)
        failures.push(`partial operation must record the pending ${name} gate and its blocker`);
    }

    if (!Array.isArray(receipt.files) || !Array.isArray(receipt.derived_outputs))
      throw new Error('missing materialization output arrays');
    const expected = [
      ...receipt.files.filter((item: { temporary_intent?: boolean }) => !item.temporary_intent),
      ...receipt.derived_outputs,
    ] as Array<{ target: string }>;
    const recorded = [
      ...(operation.outputs ?? []),
      ...(operation.files ?? []),
      ...(operation.derived_outputs ?? []),
    ] as Array<{
      target: string;
      deployed_sha256?: string;
      sha256?: string;
      status?: string;
      final_review?: string;
    }>;
    const map = new Map(recorded.map((output) => [output.target, output]));
    if (
      !expected.length ||
      new Set(expected.map((output) => output.target)).size !== expected.length ||
      map.size !== recorded.length ||
      map.size !== expected.length ||
      expected.some((output) => !map.has(output.target))
    )
      return [
        ...failures,
        'partial operation must cover exactly every permanent materialized and derived output',
      ];
    const root = path.resolve(packageRoot, '../../..');
    for (const entry of expected) {
      const record = map.get(entry.target)!;
      const digest = record.deployed_sha256 ?? record.sha256;
      const status = record.status?.trim();
      const checked =
        ['locally_verified', 'locally_verified; final_E_gate_pending', 'verified-content'].includes(
          status ?? ''
        ) ||
        (status === 'author-and-orchestrator-checked' && record.final_review === 'pending-stage-E');
      if (!checked || !/^[a-f0-9]{64}$/.test(digest ?? ''))
        failures.push(`partial output lacks local verification evidence: ${entry.target}`);
      const target = checkedOutputPath(root, packageRoot, entry.target);
      if (createHash('sha256').update(fs.readFileSync(target)).digest('hex') !== digest)
        failures.push(`partial launch output changed: ${entry.target}`);
    }
  } catch (error) {
    failures.push(`invalid partial launch evidence: ${(error as Error).message}`);
  }
  return failures;
}

/** Normalize structured checks and earlier human-readable checkpoint strings. */
function readCheckpointCheck(value: unknown): { status: string; evidence: string } {
  if (typeof value === 'string') {
    const split = value.indexOf(':');
    return {
      status: (split < 0 ? value : value.slice(0, split)).trim().toLowerCase(),
      evidence: split < 0 ? '' : value.slice(split + 1).trim(),
    };
  }
  if (value && typeof value === 'object') {
    const check = value as { status?: unknown; evidence?: unknown; blocker?: unknown };
    const evidence = check.evidence ?? check.blocker;
    return {
      status: typeof check.status === 'string' ? check.status.toLowerCase() : '',
      evidence: typeof evidence === 'string' ? evidence.trim() : '',
    };
  }
  return { status: '', evidence: '' };
}

/** Launches may use linked A/B/C materialization runs followed by an aggregate
 * plan. Accept that shape only when the report is still honestly in progress at
 * external Stage E gates, stage receipts verify A/B/C, and every recorded output
 * hash still matches disk. This validates bootstrap artifacts without claiming
 * satellite review or Mermaid rendering passed.
 */
function gradeLinkedLaunchState(packageRoot: string, primaryRunId: string): GradeResult {
  const failures: string[] = [];
  const operationFiles: string[] = [];
  const centralOperation = path.join(packageRoot, 'state/launch/operation.json');
  if (fs.existsSync(centralOperation)) operationFiles.push(centralOperation);
  const operationsDir = path.join(packageRoot, 'state/operations');
  if (fs.existsSync(operationsDir))
    operationFiles.push(
      ...fs
        .readdirSync(operationsDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.join(operationsDir, file))
    );
  const operations = operationFiles
    .map((file) => {
      const operation = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (file === centralOperation && !operation.mode) operation.mode = 'launch';
      return operation;
    })
    .filter(
      (operation) =>
        operation.mode === 'launch' &&
        (operation.run_id === primaryRunId || operation.run_id?.startsWith(`${primaryRunId}-`))
    );
  if (operations.length !== 1)
    return {
      grader: 'state',
      pass: false,
      failures: [
        `expected one launch operation linked to ${primaryRunId}, found ${operations.length}`,
      ],
    };

  const operation = operations[0];
  const report = findLaunchReport(packageRoot, primaryRunId);
  failures.push(...gradeStageEReport(report, primaryRunId));
  if (!['partial', 'in_progress'].includes(operation.status))
    failures.push(`linked launch operation status is ${operation.status}, expected partial`);

  const blockerText = (Array.isArray(operation.blockers) ? operation.blockers : [])
    .map((blocker: unknown) => (typeof blocker === 'string' ? blocker : JSON.stringify(blocker)))
    .join('\n')
    .toLowerCase();
  const reviewAccepted = operation.review?.verdict === 'go';
  if (!reviewAccepted && !/review/.test(blockerText))
    failures.push(
      'partial launch must record a pending review or an accepted independent-review verdict'
    );
  if (!/(mermaid|mmdc)/.test(blockerText) && !/(mermaid|mmdc)/i.test(report ?? ''))
    failures.push('partial launch must record the outstanding Mermaid rendering gate');

  const projectRoot = path.resolve(packageRoot, '../../..');
  const packageRelativePath = path.relative(projectRoot, packageRoot).split(path.sep).join('/');
  const stageIds = new Set<string>();
  const receiptEntries = [
    ...(operation.stage_finalizers ?? []).map((entry: { receipt?: string }) => entry.receipt),
    ...(operation.stage_materialization_receipts ?? []),
    ...(operation.stage_receipts ?? []),
  ].filter((value): value is string => typeof value === 'string');
  for (const receiptRelative of receiptEntries) {
    const receiptPath = receiptRelative.startsWith(packageRelativePath + '/')
      ? path.resolve(projectRoot, receiptRelative)
      : path.resolve(packageRoot, receiptRelative);
    if (!receiptPath.startsWith(path.resolve(packageRoot) + path.sep)) {
      failures.push(`unsafe stage receipt path: ${receiptRelative}`);
      continue;
    }
    const stageId = path.basename(path.dirname(receiptPath));
    const stageSuffix = stageId.startsWith(primaryRunId)
      ? stageId.slice(primaryRunId.length)
      : stageId;
    const stage = stageSuffix.match(/^-?([ABC])(?:-|$)/i)?.[1]?.toUpperCase();
    if (!stage || !fs.existsSync(receiptPath)) continue;
    const verificationPath = path.join(path.dirname(receiptPath), 'verification.json');
    if (!fs.existsSync(verificationPath)) continue;
    const receiptFailures = verifyReceipt(packageRoot, stageId);
    if (receiptFailures.length) failures.push(...receiptFailures);
    else stageIds.add(stage);
  }
  for (const stage of ['A', 'B', 'C'])
    if (!stageIds.has(stage))
      failures.push(`no current verified materialization receipt for stage ${stage}`);

  const recordedOutputs = [
    ...(operation.outputs ?? []),
    ...(operation.files ?? []),
    ...(operation.derived_outputs ?? []),
  ];
  if (!recordedOutputs.length) failures.push('launch operation records no output hashes');
  for (const output of recordedOutputs) {
    const outputPath = output.path ?? output.target;
    const target = checkedOutputPath(projectRoot, packageRoot, outputPath);
    const expectedHash = output.actual ?? output.actual_sha256 ?? output.sha256;
    if (!target.startsWith(projectRoot + path.sep) || !fs.existsSync(target)) {
      failures.push(`launch output is missing or unsafe: ${outputPath}`);
      continue;
    }
    if (typeof expectedHash !== 'string') {
      failures.push(`launch output has no recorded hash: ${outputPath}`);
      continue;
    }
    const currentHash = createHash('sha256').update(fs.readFileSync(target)).digest('hex');
    if (currentHash !== expectedHash)
      failures.push(`launch output changed after verification: ${outputPath}`);
  }

  return { grader: 'state', pass: failures.length === 0, failures };
}
