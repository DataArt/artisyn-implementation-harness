#!/usr/bin/env node
// Self-contained design metrics recorder; uses only this flow's constants and helpers.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';

import {
  LIFECYCLE,
  STAGES,
  FINAL_STAGE,
  FILES,
  REPORT_MARKERS,
  LEGACY_REPORT_MARKERS,
  ACTIVITIES_BY_STAGE,
  ACTIVITIES,
  REASONS,
  TRIGGERS,
} from './constants.mjs';

import {
  fail,
  need,
  member,
  utc,
  stamp,
  seconds,
  last,
  atomic,
  escapeMarkdownCell,
  humanDuration,
} from './utils.mjs';

const names = [
  'dir',
  'ticket',
  'coverage',
  'stage',
  'id',
  'activity',
  'reason',
  'detail',
  'kind',
  'name',
  'result',
  'evidence',
  'source',
  'file',
  'created-at',
];
const argv = process.argv.slice(2);
const separator = argv.indexOf('--');
const command = separator < 0 ? [] : argv.slice(separator + 1);
const { values: o, positionals: words } = parseArgs({
  args: separator < 0 ? argv : argv.slice(0, separator),
  allowPositionals: true,
  options: Object.fromEntries(names.map((name) => [name, { type: 'string' }])),
});
const [noun, verb] = words;
let lock, dir, data;
let child;
let caughtSignal = null;
const signalHandler = (signal) => {
  caughtSignal = signal;
  child?.kill(signal);
};

/**
 * Enforce every structural invariant of a stat.json document.
 * Throws on the first violation; never mutates the document.
 * @param {object} d Parsed stat.json contents.
 */
function validate(d) {
  need(
    d.lifecycle === LIFECYCLE,
    'Metrics belong to a different lifecycle; use its own directory and CLI'
  );
  need(
    d.schema_version === 2,
    'Unsupported schema_version; preserve old data and migrate explicitly'
  );
  for (const key of ['stages', 'steps', 'intervals', 'checks', 'usage_samples'])
    need(Array.isArray(d[key]), `Missing ${key}`);
  need(stamp(d.tracking_started_at), 'Missing tracking start');
  need(
    d.ticket && ['from_tracking_start', 'partial'].includes(d.coverage),
    'Invalid ticket/coverage'
  );
  {
    need(d.steps.length === 0, 'Design records stages, not implementation steps');
    need(
      Number.isSafeInteger(d.design_revision) && d.design_revision >= 0,
      'Invalid design revision'
    );
  }
  const ids = new Set();
  const unique = (id) => {
    need(typeof id === 'string' && id && !ids.has(id), `Invalid/duplicate ID: ${id}`);
    ids.add(id);
  };
  const attempts = new Map();
  const units = [...d.stages, ...d.steps];
  for (const unit of units) {
    unique(unit.id);
    member(unit.status, ['pending', 'active', 'waiting', 'completed', 'skipped']);
    if (unit.status === 'skipped')
      need(
        unit.id === 'address-feedback' &&
          unit.attempts.length === 0 &&
          unit.skip_reason &&
          unit.evidence_ref &&
          stamp(unit.skipped_at),
        'Invalid skipped stage'
      );
    need(Array.isArray(unit.attempts), 'Missing attempts');
    for (const attempt of unit.attempts) {
      unique(attempt.id);
      attempts.set(attempt.id, unit);
      need(
        stamp(attempt.started_at) &&
          (attempt.ended_at === null ||
            (stamp(attempt.ended_at) && seconds(attempt.started_at, attempt.ended_at) >= 0)),
        'Invalid attempt timestamps'
      );
      member(attempt.trigger, ['initial', ...TRIGGERS]);
      member(attempt.outcome, [null, 'completed', 'superseded']);
    }
  }
  for (const stage of d.stages) member(stage.id, STAGES);
  for (const step of d.steps) {
    need(
      Number.isInteger(step.order) && step.order >= 0 && step.title && step.plan_ref,
      'Invalid step definition'
    );
    need(
      Array.isArray(step.depends_on) &&
        step.depends_on.every((id) => id !== step.id && d.steps.some((s) => s.id === id)),
      'Invalid step dependencies'
    );
  }
  const refs = (record) => {
    need(
      d.stages.some((s) => s.id === record.stage_id && attempts.get(record.stage_attempt_id) === s),
      'Invalid stage attempt reference'
    );
    if (record.step)
      need(
        d.steps.some((s) => s.id === record.step.id && attempts.get(record.step.attempt_id) === s),
        'Invalid step attempt reference'
      );
  };
  let end = -Infinity;
  for (const interval of d.intervals) {
    unique(interval.id);
    refs(interval);
    need(
      stamp(interval.started_at) &&
        stamp(interval.last_observed_at) &&
        seconds(interval.started_at, interval.last_observed_at) >= 0,
      'Invalid interval checkpoint'
    );
    need(Date.parse(interval.started_at) >= end, 'Overlapping intervals');
    if (interval.ended_at !== null)
      need(
        stamp(interval.ended_at) && seconds(interval.last_observed_at, interval.ended_at) >= 0,
        'Invalid interval end'
      );
    member(interval.kind, ['work', 'wait']);
    member(
      interval.kind === 'work' ? interval.activity : interval.reason,
      interval.kind === 'work' ? ACTIVITIES : REASONS
    );
    need(seconds(d.tracking_started_at, interval.started_at) >= 0, 'Interval predates tracking');
    end = interval.ended_at === null ? Infinity : Date.parse(interval.ended_at);
  }
  for (const check of d.checks) {
    unique(check.id);
    refs(check);
    member(check.kind, ['build', 'test', 'lint', 'typecheck', 'acceptance']);
    member(check.result, ['running', 'passed', 'failed', 'error', 'cancelled', 'interrupted']);
    need(stamp(check.started_at), 'Invalid check start');
    if (check.result === 'running') {
      need(
        check.ended_at === null &&
          check.source === 'command' &&
          check.exit_code === null &&
          check.signal === null,
        'Invalid running check'
      );
      need(stamp(check.last_observed_at), 'Running check needs a checkpoint');
    } else
      need(
        stamp(check.ended_at) && seconds(check.started_at, check.ended_at) >= 0,
        'Invalid check end'
      );
    if (check.last_observed_at !== undefined)
      need(
        stamp(check.last_observed_at) &&
          seconds(check.started_at, check.last_observed_at) >= 0 &&
          (check.ended_at === null || seconds(check.last_observed_at, check.ended_at) >= 0),
        'Invalid check checkpoint'
      );
    need(
      Number.isSafeInteger(check.design_revision) &&
        check.design_revision >= 0 &&
        check.design_revision <= d.design_revision,
      'Invalid check revision'
    );
    need(check.name && check.evidence_ref && check.source, 'Missing check name/evidence/source');
    need(check.exit_code === null || Number.isInteger(check.exit_code), 'Invalid exit code');
    need(check.signal === null || typeof check.signal === 'string', 'Invalid signal');
  }
  const samples = new Set();
  for (const sample of d.usage_samples) {
    need(
      sample.sample_id &&
        sample.source &&
        sample.session_id &&
        sample.scope === 'ticket' &&
        sample.measurement === 'delta',
      'Usage requires ticket-scoped, non-overlapping runtime deltas'
    );
    const key = JSON.stringify([sample.source, sample.session_id, sample.sample_id]);
    need(!samples.has(key), 'Duplicate usage sample');
    samples.add(key);
    for (const key of ['input_tokens', 'output_tokens'])
      need(
        sample[key] === null || (Number.isSafeInteger(sample[key]) && sample[key] >= 0),
        `Invalid ${key}`
      );
  }
  for (const key of ['tracking_started_at', 'started_at', 'completed_at', 'ticket_created_at'])
    need(d[key] === null || stamp(d[key]), `Invalid ${key}`);
  if (d.ticket_created_at)
    need(
      d.ticket_created_source && seconds(d.ticket_created_at, d.tracking_started_at) >= 0,
      'Creation timestamp needs attribution and must not be in the future'
    );
  need(
    d.started_at === null || seconds(d.tracking_started_at, d.started_at) >= 0,
    'Work predates tracking'
  );
  if (d.completed_at)
    need(
      d.started_at && seconds(d.started_at, d.completed_at) >= 0,
      'Invalid completion timestamp'
    );
  need(
    d.stages.length === STAGES.length && STAGES.every((id) => d.stages.some((s) => s.id === id)),
    'Missing lifecycle stages'
  );
  for (const group of [d.stages, d.steps])
    need(
      group.filter((s) => ['active', 'waiting'].includes(s.status)).length <= 1,
      'Multiple active units'
    );
  for (const unit of units) {
    const running = unit.attempts.filter((a) => a.ended_at === null);
    need(
      running.length <= 1 && (running.length === 1) === ['active', 'waiting'].includes(unit.status),
      'Attempt/status mismatch'
    );
    if (unit.status === 'completed')
      need(last(unit)?.outcome === 'completed', 'Missing completed attempt');
  }
}
/**
 * Recalculate the derived metrics summary from the raw records.
 * @param {object} d Validated stat.json contents.
 * @param {string} now Current UTC timestamp.
 * @returns {object} Fresh `metrics` block; unknown telemetry stays null.
 */
function derive(d, now) {
  const intervals = d.intervals.filter((i) => i.ended_at !== null);
  const sum = (predicate) =>
    intervals.filter(predicate).reduce((n, i) => n + seconds(i.started_at, i.ended_at), 0);
  const work = sum((i) => i.kind === 'work');
  const wait = sum((i) => i.kind === 'wait');
  const attempts = new Map(
    [...d.stages, ...d.steps].flatMap((s) => s.attempts.map((a) => [a.id, a]))
  );
  const checked = d.stages
    .map((s) =>
      d.checks.filter((c) => c.stage_id === s.id && ['passed', 'failed'].includes(c.result))
    )
    .filter((c) => c.length);
  const tokenSum = (key) =>
    d.usage_samples.some((s) => s[key] !== null)
      ? d.usage_samples.reduce((n, s) => n + (s[key] ?? 0), 0)
      : null;
  return {
    as_of: now,
    lead_time_seconds:
      d.completed_at && d.ticket_created_at ? seconds(d.ticket_created_at, d.completed_at) : null,
    cycle_time_seconds:
      d.completed_at && d.started_at ? seconds(d.started_at, d.completed_at) : null,
    observed_work_seconds: work,
    observed_wait_seconds: wait,
    open_work_seconds: d.intervals
      .filter((i) => i.ended_at === null && i.kind === 'work')
      .reduce((n, i) => n + seconds(i.started_at, i.last_observed_at), 0),
    open_wait_seconds: d.intervals
      .filter((i) => i.ended_at === null && i.kind === 'wait')
      .reduce((n, i) => n + seconds(i.started_at, now), 0),
    wait_seconds_to_date:
      wait +
      d.intervals
        .filter((i) => i.ended_at === null && i.kind === 'wait')
        .reduce((n, i) => n + seconds(i.started_at, now), 0),
    // Open work is bounded by its checkpoint; open waits are intentionally still ongoing.
    unclassified_seconds: Math.max(
      0,
      seconds(d.tracking_started_at, d.completed_at ?? now) -
        work -
        wait -
        d.intervals
          .filter((i) => i.ended_at === null)
          .reduce(
            (n, i) => n + seconds(i.started_at, i.kind === 'wait' ? now : i.last_observed_at),
            0
          )
    ),
    rework_seconds: sum(
      (i) =>
        i.kind === 'work' &&
        ['verification_failure', 'review_feedback', 'scope_change'].includes(
          attempts.get(i.step?.attempt_id ?? i.stage_attempt_id)?.trigger
        )
    ),
    blocked_seconds: sum(
      (i) => i.kind === 'wait' && ['external_dependency', 'environment'].includes(i.reason)
    ),
    approval_wait_seconds: sum((i) => i.kind === 'wait' && i.reason === 'approval'),
    failed_checks: d.checks.filter((c) => c.result === 'failed').length,
    first_pass_verification_rate: checked.length
      ? checked.filter((checks) => {
          const first = new Map();
          for (const c of checks) {
            const key = JSON.stringify([c.kind, c.name]);
            if (!first.has(key)) first.set(key, c);
          }
          return [...first.values()].every((c) => c.result === 'passed');
        }).length / checked.length
      : null,
    human_reported_seconds: d.metrics?.human_reported_seconds ?? null,
    tokens: d.usage_samples.length
      ? { input_tokens: tokenSum('input_tokens'), output_tokens: tokenSum('output_tokens') }
      : null,
    token_coverage: d.usage_samples.length ? 'partial' : 'unavailable',
  };
}
/** Validate, re-derive metrics, and atomically persist stat.json. */
function save() {
  validate(data);
  data.metrics = derive(data, utc());
  atomic(path.join(dir, FILES.stat), JSON.stringify(data, null, 2) + '\n');
}
/** @returns {object|undefined} The single open interval, if any. */
const open = () => data.intervals.find((i) => i.ended_at === null);
/** Close the open interval, bounding its checkpoint and end at `now`. */
function close(now = utc()) {
  const i = open();
  if (i) {
    i.last_observed_at = now;
    i.ended_at = now;
  }
}
/** @returns {object} The active or waiting stage; throws when none is. */
function activeStage() {
  return need(
    data.stages.find((s) => ['active', 'waiting'].includes(s.status)),
    'Start a stage first'
  );
}
/**
 * Attribution for new records: the current stage attempt. The step slot stays
 * null in the design flow, which records stages only.
 * @returns {{stage_id: string, stage_attempt_id: string, step: object|null}}
 */
function context() {
  const stage = activeStage();
  const step = data.steps.find((s) => ['active', 'waiting'].includes(s.status));
  return {
    stage_id: stage.id,
    stage_attempt_id: last(stage).id,
    step: step ? { id: step.id, attempt_id: last(step).id } : null,
  };
}
/**
 * Open or extend an interval. Repeating the open interval's exact context only
 * moves its checkpoint; anything else closes it and starts a new interval.
 * Mirrors the interval kind onto the active stage status.
 * @param {'work'|'wait'} kind
 * @param {string} value Activity (work) or reason (wait).
 * @param {string} [now] UTC timestamp.
 */
function interval(kind, value, now = utc()) {
  member(value, kind === 'work' ? ACTIVITIES : REASONS);
  const refs = context();
  const current = open();
  const key = kind === 'work' ? 'activity' : 'reason';
  if (
    current &&
    current.kind === kind &&
    current[key] === value &&
    current.stage_attempt_id === refs.stage_attempt_id &&
    current.step?.attempt_id === refs.step?.attempt_id &&
    (kind === 'work' || current.detail === (o.detail ?? null))
  )
    current.last_observed_at = now;
  else {
    close(now);
    data.intervals.push({
      id: randomUUID(),
      ...refs,
      kind,
      [key]: value,
      ...(kind === 'wait' ? { detail: o.detail ?? null } : {}),
      started_at: now,
      ended_at: null,
      last_observed_at: now,
    });
  }
  activeStage().status = kind === 'work' ? 'active' : 'waiting';
  const step = data.steps.find((s) => ['active', 'waiting'].includes(s.status));
  if (step) step.status = kind === 'work' ? 'active' : 'waiting';
}
/**
 * Begin a new attempt on a unit, superseding an unfinished one. Any new
 * attempt clears ticket completion; the first sets the observed start.
 * A non-initial trigger bumps the design revision (invalidating the prior
 * approval) and returns a completed publish stage to pending.
 * @param {object} unit Stage.
 * @param {string} trigger 'initial' or a retry trigger.
 * @param {string} now UTC timestamp.
 */
function attempt(unit, trigger, now) {
  if (last(unit)?.ended_at === null)
    Object.assign(last(unit), { ended_at: now, outcome: 'superseded' });
  unit.attempts.push({ id: randomUUID(), started_at: now, ended_at: null, trigger, outcome: null });
  unit.status = 'active';
  if (trigger !== 'initial') {
    data.design_revision++;
    const publish = data.stages.find((s) => s.id === 'publish');
    if (unit.id !== 'publish' && publish.status === 'completed') publish.status = 'pending';
  }
  data.started_at ??= now;
  data.completed_at = null;
}
/**
 * Whether the current design revision is approved: its latest "Design
 * approval" acceptance passed in this revision, and every named check
 * recorded in this revision passes at its latest run.
 * @returns {boolean}
 */
function designApproved() {
  const approval = data.checks.findLast(
    (c) => c.kind === 'acceptance' && c.name === 'Design approval'
  );
  if (!approval || approval.result !== 'passed') return false;
  if (approval.design_revision !== data.design_revision) return false;
  const latest = new Map(
    data.checks
      .filter((c) => c.design_revision === data.design_revision)
      .map((c) => [JSON.stringify([c.kind, c.name]), c])
  );
  return [...latest.values()].every((c) => c.result === 'passed');
}
/**
 * Render the generated metrics block into the report file, replacing only the
 * marker-delimited region and preserving all surrounding prose.
 */
function report() {
  const rows = data.stages.map((s) => {
    const ints = data.intervals.filter((i) => i.stage_id === s.id && i.ended_at);
    const sum = (kind) =>
      ints
        .filter((i) => i.kind === kind)
        .reduce((n, i) => n + seconds(i.started_at, i.ended_at), 0);
    const start = s.attempts[0]?.started_at;
    const end = s.status === 'completed' ? last(s).ended_at : null;
    return `| ${[s.id + ' (' + s.status + ')', start, end, humanDuration(end ? seconds(start, end) : null), humanDuration(sum('work')), humanDuration(sum('wait')), 'unavailable', 'unavailable', data.coverage, s.attempts.length, data.checks.filter((c) => c.stage_id === s.id && c.result === 'failed').length].map(escapeMarkdownCell).join(' | ')} |`;
  });
  const heading = 'Stage Metrics';
  const unitName = 'Stage';
  const columnNotes = `**Elapsed** = wall-clock time from the stage's first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the stage. Durations are shown as \`Xh Ym Zs\`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait.`;
  const section = `## ${heading}\n\n${REPORT_MARKERS.start}\nSource: [${FILES.stat}](${FILES.stat}). ${columnNotes} Token subtotals have ${data.metrics.token_coverage} coverage; ticket usage is not allocated to individual units.\n\nObserved work: ${humanDuration(data.metrics.observed_work_seconds)} · Wait to date: ${humanDuration(data.metrics.wait_seconds_to_date)} (closed ${humanDuration(data.metrics.observed_wait_seconds)} + current ${humanDuration(data.metrics.open_wait_seconds)}) · Unclassified: ${humanDuration(data.metrics.unclassified_seconds)}\n\n| ${unitName} | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n${REPORT_MARKERS.end}\n`;
  const file = path.join(dir, FILES.report);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const marker = existing.includes(REPORT_MARKERS.start)
    ? REPORT_MARKERS
    : existing.includes(LEGACY_REPORT_MARKERS.start)
      ? LEGACY_REPORT_MARKERS
      : null;
  if (marker) {
    const start = existing.indexOf(marker.start);
    const end = existing.indexOf(marker.end, start);
    need(end >= 0, 'Unclosed metrics marker');
    // Splice literal content so titles containing replacement patterns remain intact.
    atomic(
      file,
      existing.slice(0, start) +
        section.split(`## ${heading}\n\n`)[1].trimEnd() +
        existing.slice(end + marker.end.length)
    );
  } else {
    // Preserve existing prose and historic rows, even if an older metrics section exists.
    atomic(file, existing + '\n' + section);
  }
}

/** @returns {object} A fresh v2 stat.json document for this lifecycle. */
function initialState(now) {
  return {
    schema_version: 2,
    lifecycle: LIFECYCLE,
    design_revision: 0,
    ticket: need(o.ticket, 'init requires --ticket'),
    tracking_started_at: now,
    ticket_created_at: o['created-at'] ?? null,
    ticket_created_source: o['created-at']
      ? need(o.source, '--created-at requires --source')
      : null,
    started_at: null,
    completed_at: null,
    coverage: member(o.coverage ?? 'from_tracking_start', ['from_tracking_start', 'partial']),
    stages: STAGES.map((id) => ({ id, status: 'pending', attempts: [] })),
    steps: [],
    intervals: [],
    checks: [],
    usage_samples: [],
    metrics: {},
  };
}

/** @returns {object} A check record attributed to the current stage attempt and design revision. */
function newCheck(now) {
  return {
    id: o.id ?? randomUUID(),
    ...context(),
    design_revision: data.design_revision,
    name: o.name,
    kind: o.kind,
    started_at: now,
    ended_at: now,
    result: o.result,
    evidence_ref: o.evidence,
    source: o.source,
    exit_code: null,
    signal: null,
  };
}

/**
 * Finalize design completion. Requires publish completed, current-revision
 * approval, and no unfinished stages; full coverage additionally requires
 * every stage completed or the authorized feedback skip. Repeating a
 * completion preserves the original timestamp.
 */
function completeLifecycle(now) {
  need(
    data.stages.find((s) => s.id === FINAL_STAGE).status === 'completed',
    `${FINAL_STAGE} stage must be complete`
  );
  need(designApproved(), 'Design completion requires recorded approval');
  need(
    data.stages.every((s) => ['pending', 'completed', 'skipped'].includes(s.status)) &&
      data.steps.every((s) => s.status === 'completed'),
    'Unfinished work remains'
  );
  need(
    data.coverage === 'partial' ||
      data.stages.every((s) => s.status === 'completed' || s.status === 'skipped'),
    'Full-flow completion requires all stages'
  );
  close(now);
  data.completed_at ??= now;
}

/**
 * Skip the address-feedback stage after recorded approval, with attributed
 * evidence and no fabricated attempt. Identical replays are no-ops;
 * conflicting replays fail.
 */
function skipFeedback(unit, now) {
  need(unit.id === 'address-feedback', 'Only address-feedback may be skipped');
  need(designApproved(), 'Skipping feedback requires recorded Design approval');
  need(['pending', 'skipped'].includes(unit.status), 'Cannot skip started feedback');
  need(o.reason && o.evidence, 'skip requires --reason and --evidence');
  if (unit.status === 'skipped') {
    need(
      unit.skip_reason === o.reason && unit.evidence_ref === o.evidence,
      'Conflicting skip replay'
    );
    return;
  }
  Object.assign(unit, {
    status: 'skipped',
    skip_reason: o.reason,
    evidence_ref: o.evidence,
    skipped_at: now,
  });
}

/**
 * On a review-gate retry, restore skipped feedback to pending, moving the
 * skip record into `skip_history`.
 */
function reopenFeedback(unit) {
  if (unit.id !== 'review-gate' || verb !== 'retry') return;
  const feedback = data.stages.find((s) => s.id === 'address-feedback');
  if (feedback.status !== 'skipped') return;
  (feedback.skip_history ??= []).push({
    reason: feedback.skip_reason,
    evidence_ref: feedback.evidence_ref,
    skipped_at: feedback.skipped_at,
  });
  feedback.status = 'pending';
  delete feedback.skip_reason;
  delete feedback.evidence_ref;
  delete feedback.skipped_at;
}

/**
 * Trigger for a new stage attempt: retries use the explicit reason, and
 * feedback's first start is inherently rework.
 * @returns {string}
 */
function stageTrigger(unit) {
  if (verb === 'retry') return member(o.reason, TRIGGERS);
  return unit.id === 'address-feedback' ? 'review_feedback' : 'initial';
}

/**
 * Start or retry a design stage and open its work interval. Repeating a start
 * on an already active stage acts as a checkpoint, not a new attempt.
 */
function startStage(unit, now) {
  need(unit.status !== 'skipped', 'Retry review-gate before starting previously skipped feedback');
  need(
    !data.stages.some((s) => s !== unit && ['active', 'waiting'].includes(s.status)),
    'Complete the active stage first'
  );
  if (verb === 'retry' || unit.status === 'pending') {
    if (verb === 'retry') need(unit.attempts.length, 'Cannot retry a stage that has never started');
    reopenFeedback(unit);
    close(now);
    attempt(unit, stageTrigger(unit), now);
  } else need(unit.status !== 'completed', 'Use retry to reopen completed work');
  interval('work', o.activity ?? ACTIVITIES_BY_STAGE[unit.id], now);
}

/**
 * Complete a stage; repeating a completion is a no-op. Publish additionally
 * requires current-revision approval.
 */
function completeStage(unit, now) {
  if (unit.status === 'completed') return;
  need(['active', 'waiting'].includes(unit.status), 'Stage has not started');
  if (unit.id === 'publish') need(designApproved(), 'Publish requires recorded Design approval');
  close(now);
  unit.status = 'completed';
  Object.assign(last(unit), { ended_at: now, outcome: 'completed' });
}

/** Handle `stage` subcommands: start, retry, skip, and complete. */
function handleStage(now) {
  const id = need(o.stage, 'Missing stage ID');
  const unit = need(
    data.stages.find((s) => s.id === id),
    `Unknown stage: ${id}`
  );
  if (verb === 'skip') return skipFeedback(unit, now);
  if (['start', 'retry'].includes(verb)) return startStage(unit, now);
  if (verb === 'complete') return completeStage(unit, now);
  fail('Expected start, retry, skip, or complete');
}

/**
 * Take the exclusive writer lock or fail; never removes another writer's lock.
 * @returns {string} Lock file path, released in main's `finally`.
 */
function acquireLock() {
  const lockPath = path.join(dir, FILES.lock);
  try {
    lock = fs.openSync(lockPath, 'wx');
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, started_at: utc() }));
  } catch (error) {
    if (error.code === 'EEXIST')
      fail(
        `Metrics writer locked: ${lockPath}. If interrupted, verify its PID is no longer running before removing this lock.`
      );
    throw error;
  }
  return lockPath;
}

/** Load and validate stat.json, or build the initial state for a first init. */
function loadState(now) {
  const file = path.join(dir, FILES.stat);
  if (noun === 'init' && !fs.existsSync(file)) {
    data = initialState(now);
    return;
  }
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
  validate(data);
}

/** Move the open interval's checkpoint; a no-op when nothing is open. */
function checkpointWork(now) {
  const current = open();
  if (current) current.last_observed_at = now;
}

/**
 * Recover from an interrupted session: close open work at its last checkpoint
 * and mark persisted `running` checks `interrupted` so they demand a rerun.
 */
function recoverWork() {
  const current = open();
  if (current?.kind === 'work') current.ended_at = current.last_observed_at;
  for (const check of data.checks.filter((c) => c.result === 'running')) {
    check.result = 'interrupted';
    check.ended_at = check.last_observed_at;
    check.evidence_ref = `Execution interrupted; last observed at ${check.last_observed_at}; rerun required`;
  }
  // Explicit waits survive session gaps; resume closes them.
}

/** Import one runtime usage sample; identical replays are ignored, conflicts fail. */
function importUsage() {
  const sample = JSON.parse(fs.readFileSync(need(o.file, 'usage requires --file'), 'utf8'));
  const existing = data.usage_samples.find(
    (s) =>
      s.source === sample.source &&
      s.session_id === sample.session_id &&
      s.sample_id === sample.sample_id
  );
  if (existing) {
    need(JSON.stringify(existing) === JSON.stringify(sample), 'Conflicting usage sample');
    return;
  }
  data.usage_samples.push(sample);
}

/**
 * Detect a replayed check event ID; on a match, reproduce the recorded exit
 * code without executing or recording anything.
 * @returns {boolean} True when the event was a replay.
 */
function replayCheck() {
  const previous = data.checks.find((c) => o.id && c.id === o.id);
  if (!previous) return false;
  const current = context();
  need(
    previous.name === o.name &&
      previous.kind === o.kind &&
      (!o.result || previous.result === o.result) &&
      previous.step?.attempt_id === current.step?.attempt_id &&
      previous.stage_attempt_id === current.stage_attempt_id,
    'Conflicting check event ID'
  );
  process.exitCode = previous.exit_code ?? (previous.result === 'passed' ? 0 : 1);
  console.log(JSON.stringify({ duplicate: o.id }));
  return true;
}

/** Record externally observed check evidence; never executes a command. */
function recordManualCheck(check) {
  need(!command.length, 'record does not execute a command');
  member(o.result, ['passed', 'failed', 'error', 'cancelled']);
  need(o.evidence && o.source, 'Manual check requires --evidence and --source');
  data.checks.push(check);
  return 0;
}

/**
 * Persist progress once per second while a wrapped command runs, so recovery
 * can bound the observed work even after a hard kill.
 * @returns {{stop: function(): void, verify: function(): void}}
 */
function startHeartbeat(check) {
  let error;
  const timer = setInterval(() => {
    try {
      const now = utc();
      checkpointWork(now);
      check.last_observed_at = now;
      save();
    } catch (caught) {
      error = caught;
      child?.kill('SIGTERM');
    }
  }, 1000);
  return {
    stop() {
      clearInterval(timer);
    },
    verify() {
      if (error) throw error;
    },
  };
}

/**
 * Spawn the wrapped verification command without a shell.
 * @returns {Promise<{error?: string, code?: number, signal?: string}>}
 */
function spawnVerification() {
  return new Promise((resolve) => {
    child = spawn(command[0], command.slice(1), { stdio: 'inherit', shell: false });
    child.once('error', (error) => resolve({ error: error.message }));
    child.once('close', (code, signal) => resolve({ code, signal }));
  });
}

/** Map a child outcome to a stored check result. */
function checkResult(outcome, signal) {
  if (outcome.error) return 'error';
  if (signal) return 'cancelled';
  return outcome.code === 0 ? 'passed' : 'failed';
}

/** Map a child outcome to the exit code this process forwards. */
function checkExitCode(outcome, signal) {
  if (outcome.error) return 127;
  if (signal === 'SIGINT') return 130;
  if (signal) return 143;
  return outcome.code;
}

/**
 * Record the finished command's outcome on the check.
 * @returns {number} Exit code to forward.
 */
function applyCheckOutcome(check, outcome) {
  check.exit_code = outcome.code ?? null;
  check.signal = outcome.signal ?? caughtSignal;
  check.result = checkResult(outcome, check.signal);
  check.source = 'command';
  check.evidence_ref = outcome.error ?? `Command exit recorded for ${o.name}`;
  // Arguments/output can contain secrets: do not persist them.
  return checkExitCode(outcome, check.signal);
}

/**
 * Run a wrapped verification command: persist the check as `running` first,
 * heartbeat during execution, then record the outcome and restore the prior
 * work activity. A termination signal closes work without restarting it.
 * @returns {Promise<number>} Exit code to forward.
 */
async function executeCheck(check, now) {
  need(!verb && command.length, 'Use check -- <executable> <args>, or check record');
  const previousActivity = open()?.kind === 'work' ? open().activity : 'verification';
  interval('work', 'verification', now);
  Object.assign(check, {
    result: 'running',
    ended_at: null,
    last_observed_at: now,
    source: 'command',
    evidence_ref: `Command started for ${o.name}`,
  });
  data.checks.push(check);
  save(); // Persist before spawning so recovery cannot reuse an older passing check.
  const heartbeat = startHeartbeat(check);
  let exit;
  try {
    exit = applyCheckOutcome(check, await spawnVerification());
  } finally {
    heartbeat.stop();
    child = null;
  }
  heartbeat.verify();
  check.ended_at = utc();
  check.last_observed_at = check.ended_at;
  close(check.ended_at);
  if (!check.signal) interval('work', previousActivity, check.ended_at);
  return exit;
}

/**
 * Handle `check` (execute) and `check record` (manual evidence).
 * @returns {Promise<boolean>} True when a replayed event ended the command early.
 */
async function handleCheck(now) {
  member(o.kind, ['build', 'test', 'lint', 'typecheck', 'acceptance']);
  need(o.name, 'check requires --name');
  if (replayCheck()) return true;
  const check = newCheck(now);
  const exit = verb === 'record' ? recordManualCheck(check) : await executeCheck(check, now);
  save();
  process.exitCode = exit;
  return false;
}

/** Handle `wait start`: open an explicit wait interval. */
function startWait() {
  need(verb === 'start', 'Unknown command');
  interval('wait', o.reason);
}

/** Persist mutations, refresh the report when asked, and print the summary line. */
function finishCommand() {
  if (noun !== 'validate') save();
  if (noun === 'report') report();
  console.log(
    JSON.stringify({ command: words.join(' '), ticket: data.ticket, metrics: data.metrics })
  );
}

/** Entry point: lock, load, guard interrupted checks, dispatch, release. */
async function main() {
  dir = path.resolve(need(o.dir, 'Every command requires --dir <ticket impl directory>'));
  need(words.length <= 2, 'Unexpected positional arguments');
  if (noun === 'init') fs.mkdirSync(dir, { recursive: true });
  const lockPath = acquireLock();
  try {
    const now = utc();
    loadState(now);
    need(
      !data.checks.some((c) => c.result === 'running') ||
        ['recover', 'report', 'validate'].includes(noun),
      'Interrupted verification found; run recover before recording new work'
    );
    if (await dispatchCommand(now)) return;
    finishCommand();
  } finally {
    fs.closeSync(lock);
    fs.unlinkSync(lockPath);
    lock = undefined;
  }
}

/**
 * Route the parsed command to its handler.
 * @returns {unknown} Truthy when the handler already finished the command.
 */
function dispatchCommand(now) {
  const handlers = new Map([
    [
      'init',
      () => need(data.ticket === o.ticket, 'Ticket does not match existing stat.json') && false,
    ],
    ['stage', handleStage],
    ['wait', startWait],
    ['resume', () => interval('work', need(o.activity, 'resume requires --activity'))],
    ['checkpoint', checkpointWork],
    ['recover', recoverWork],
    ['check', handleCheck],
    ['usage', importUsage],
    ['complete', completeLifecycle],
    ['report', () => {}],
    ['validate', () => {}],
  ]);
  const handler = need(handlers.get(noun), 'Unknown command');
  return handler(now);
}

process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);
await main().catch((error) => {
  console.error(`design-metrics: ${error.message}`);
  process.exitCode = 1;
});
