#!/usr/bin/env node
// Self-contained dev metrics recorder: stage/step timing, checks, and the generated
// Stage/Step Metrics report sections. Review-findings/tests/debt derivation lives in
// the sibling quality.mjs; shared constants and generic helpers are their own files.
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
  STAGE_REPORT_MARKERS,
  STEP_REPORT_MARKERS,
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
import { deriveQuality, qualitySummary } from './quality.mjs';

const names = [
  'dir',
  'ticket',
  'coverage',
  'stage',
  'id',
  'title',
  'order',
  'plan-ref',
  'depends-on',
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
  'author',
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
function validateState(d) {
  need(
    (d.lifecycle ?? LIFECYCLE) === LIFECYCLE,
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
  const ids = new Set();
  const unique = (id) => {
    need(typeof id === 'string' && id && !ids.has(id), `Invalid/duplicate ID: ${id}`);
    ids.add(id);
  };
  const attempts = new Map();
  const units = [...d.stages, ...d.steps];
  for (const unit of units) {
    unique(unit.id);
    member(unit.status, ['pending', 'active', 'waiting', 'completed']);
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
function deriveMetrics(d, now) {
  const intervals = d.intervals.filter((i) => i.ended_at !== null);
  const sum = (predicate) =>
    intervals.filter(predicate).reduce((n, i) => n + seconds(i.started_at, i.ended_at), 0);
  const work = sum((i) => i.kind === 'work');
  const wait = sum((i) => i.kind === 'wait');
  const attempts = new Map(
    [...d.stages, ...d.steps].flatMap((s) => s.attempts.map((a) => [a.id, a]))
  );
  const checked = d.steps
    .map((s) =>
      d.checks.filter((c) => c.step?.id === s.id && ['passed', 'failed'].includes(c.result))
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

/** Validate, re-derive metrics and per-unit flags, and atomically persist stat.json. */
function save() {
  validateState(data);
  for (const stage of data.stages)
    stage.flags = flagsOf(
      stage,
      data.checks.filter((c) => c.stage_id === stage.id)
    );
  for (const step of data.steps)
    step.flags = flagsOf(
      step,
      data.checks.filter((c) => c.step?.id === step.id)
    );
  data.metrics = deriveMetrics(data, utc());
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
 * Attribution for new records: the current stage attempt, plus the current
 * step attempt when a step is active.
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
 * Mirrors the interval kind onto the active stage/step status.
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
 * @param {object} unit Stage or step.
 * @param {string} trigger 'initial' or a retry trigger.
 * @param {string} now UTC timestamp.
 */
function attempt(unit, trigger, now) {
  if (last(unit)?.ended_at === null)
    Object.assign(last(unit), { ended_at: now, outcome: 'superseded' });
  unit.attempts.push({ id: randomUUID(), started_at: now, ended_at: null, trigger, outcome: null });
  unit.status = 'active';
  data.started_at ??= now;
  data.completed_at = null;
}

/** Shared column-definition prose for the Stage/Step Metrics section header. */
function columnNotes(unit) {
  return `**Elapsed** = wall-clock time from the ${unit}'s first start to its completion (includes any wait). **Work** = summed observed work intervals (active effort) within that span. **Wait** = summed observed wait intervals (blocked on developer input, approval, or an external dependency) within that span. Work + Wait can read less than Elapsed when time went unclassified, or more after a retry reopened the ${unit}. Durations are shown as \`Xh Ym Zs\`, rounded to the nearest second; open intervals are excluded from Elapsed/Work/Wait. **Flags** surfaces non-initial attempt triggers (🔁 retried/rework, 🔀 scope change, 🔓 reopened) and any failed check (⚠️), derived from recorded data — never a new judgment call — so a reader can scan for problem ${unit}s without parsing every row.`;
}

/**
 * Splice `sectionText` into `existing` at `markers`, or append it if the markers are
 * absent. A `legacy` marker pair (from reports generated before the stage/step
 * split) is migrated in place: the new section, including its new markers, replaces
 * the legacy block.
 */
function spliceSection(existing, heading, markers, sectionText, legacy) {
  const marker = existing.includes(markers.start)
    ? markers
    : legacy && existing.includes(legacy.start)
      ? legacy
      : null;
  if (marker) {
    const start = existing.indexOf(marker.start);
    const end = existing.indexOf(marker.end, start);
    need(end >= 0, 'Unclosed metrics marker');
    // Splice literal content so titles containing replacement patterns remain intact.
    return (
      existing.slice(0, start) +
      sectionText.split(`## ${heading}\n\n`)[1].trimEnd() +
      existing.slice(end + marker.end.length)
    );
  }
  // Preserve existing prose and historic rows, even if an older metrics section exists.
  return existing + '\n' + sectionText;
}

/** Non-initial attempt triggers that count as a flaggable code, keyed by trigger. */
const TRIGGER_FLAGS = {
  verification_failure: 'retried',
  review_feedback: 'rework',
  scope_change: 'scope_change',
  reopened: 'reopened',
};
/** Scannable label for each flag code, used only when rendering the report. */
const FLAG_LABELS = {
  retried: '🔁 retried',
  rework: '🔁 rework',
  scope_change: '🔀 scope change',
  reopened: '🔓 reopened',
  failed_check: '⚠️ failed check',
};

/**
 * Derive scannable problem-flag codes for `unit` from data already recorded —
 * never a new judgment call, only a label over existing attempt triggers and
 * check results. Persisted onto the unit itself by `save()`, and re-rendered as
 * labels in the report's Flags column.
 * @returns {string[]} Flag codes (keys of `FLAG_LABELS`), empty when none apply.
 */
function flagsOf(unit, checks) {
  const flags = new Set();
  for (const a of unit.attempts) if (TRIGGER_FLAGS[a.trigger]) flags.add(TRIGGER_FLAGS[a.trigger]);
  if (checks.some((c) => c.result === 'failed')) flags.add('failed_check');
  return [...flags];
}

/** One Stage/Step Metrics table row for `unit` (a stage or a numbered step). */
function metricsRow(unit, label, intervalsOf, checksOf) {
  const ints = intervalsOf(unit).filter((i) => i.ended_at);
  const sum = (kind) =>
    ints.filter((i) => i.kind === kind).reduce((n, i) => n + seconds(i.started_at, i.ended_at), 0);
  const start = unit.attempts[0]?.started_at;
  const end = unit.status === 'completed' ? last(unit).ended_at : null;
  const checks = checksOf(unit);
  const flags =
    flagsOf(unit, checks)
      .map((f) => FLAG_LABELS[f])
      .join(' ') || '—';
  const cells = [
    label,
    start,
    end,
    humanDuration(end ? seconds(start, end) : null),
    humanDuration(sum('work')),
    humanDuration(sum('wait')),
    'unavailable',
    'unavailable',
    data.coverage,
    unit.attempts.length,
    checks.filter((c) => c.result === 'failed').length,
    flags,
  ];
  return `| ${cells.map(escapeMarkdownCell).join(' | ')} |`;
}

/**
 * Render the Stage/Step Metrics section for `unitName` ('Stage'/'Step').
 * @param {string} [trailer] Extra prose appended after the table, before the end marker.
 * @returns {string} The full `## {unitName} Metrics` section, markers included.
 */
function metricsSection(unitName, rows, markers, unit, trailer = '') {
  const heading = `${unitName} Metrics`;
  const table = `| ${unitName} | Started (UTC) | Completed (UTC) | Elapsed | Work | Wait | Input tokens | Output tokens | Coverage | Attempts | Failed checks | Flags |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}`;
  const summary = `Observed work: ${humanDuration(data.metrics.observed_work_seconds)} · Wait: ${humanDuration(data.metrics.observed_wait_seconds)} · Unclassified: ${humanDuration(data.metrics.unclassified_seconds)}`;
  return `## ${heading}\n\n${markers.start}\nSource: [${FILES.stat}](${FILES.stat}). ${columnNotes(unit)} Token subtotals have ${data.metrics.token_coverage} coverage; ticket usage is not allocated to individual units.\n\n${summary}\n\n${table}${trailer}\n${markers.end}\n`;
}

/** Refresh Stage/Step Metrics in the report file, preserving all surrounding prose. */
function report() {
  const stageRows = data.stages.map((s) =>
    metricsRow(
      s,
      s.id,
      (stage) => data.intervals.filter((i) => i.stage_id === stage.id),
      (stage) => data.checks.filter((c) => c.stage_id === stage.id)
    )
  );
  const stageSection = metricsSection(
    'Stage',
    stageRows,
    STAGE_REPORT_MARKERS,
    'stage',
    `\n\n${qualitySummary(data.quality)}`
  );

  const stepRows = data.steps
    .toSorted((a, b) => a.order - b.order)
    .map((s) =>
      metricsRow(
        s,
        `${s.id}: ${s.title}`,
        (step) => data.intervals.filter((i) => i.step?.id === step.id),
        (step) => data.checks.filter((c) => c.step?.id === step.id)
      )
    );
  const stepSection = metricsSection('Step', stepRows, STEP_REPORT_MARKERS, 'step');

  const file = path.join(dir, FILES.report);
  let content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  content = spliceSection(content, 'Stage Metrics', STAGE_REPORT_MARKERS, stageSection);
  // The pre-split single block was the step table; migrate it in place under the step section.
  content = spliceSection(
    content,
    'Step Metrics',
    STEP_REPORT_MARKERS,
    stepSection,
    LEGACY_REPORT_MARKERS
  );
  atomic(file, content);
}

/** @returns {object} A fresh v2 stat.json document for this lifecycle. */
function initialState(now) {
  return {
    schema_version: 2,
    lifecycle: LIFECYCLE,
    ticket: need(o.ticket, 'init requires --ticket'),
    author: o.author ?? null,
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

/** @returns {object} A check record attributed to the current stage/step attempt. */
function newCheck(now) {
  return {
    id: o.id ?? randomUUID(),
    ...context(),
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
 * Finalize ticket completion. Requires the final stage completed and no
 * unfinished units; full coverage additionally requires every stage completed.
 * Repeating a completion preserves the original timestamp.
 */
function completeLifecycle(now) {
  need(
    data.stages.find((s) => s.id === FINAL_STAGE).status === 'completed',
    `${FINAL_STAGE} stage must be complete`
  );
  need(
    data.stages.every((s) => ['pending', 'completed'].includes(s.status)) &&
      data.steps.every((s) => s.status === 'completed'),
    'Unfinished work remains'
  );
  need(
    data.coverage === 'partial' || data.stages.every((s) => s.status === 'completed'),
    'Full-flow completion requires all stages'
  );
  close(now);
  data.completed_at ??= now;
}

/**
 * Register an approved plan step. An identical replay is a no-op; a
 * conflicting redefinition fails.
 * @param {string} id Stable step ID.
 * @param {object|undefined} unit Existing step with this ID, if any.
 */
function addStep(id, unit) {
  const definition = {
    id,
    title: need(o.title, 'Missing --title'),
    order: Number(need(o.order, 'Missing --order')),
    plan_ref: need(o['plan-ref'], 'Missing --plan-ref'),
    depends_on: o['depends-on']?.split(',') ?? [],
  };
  if (!unit) {
    data.steps.push({ ...definition, status: 'pending', attempts: [] });
    return;
  }
  for (const key of Object.keys(definition))
    need(
      JSON.stringify(unit[key]) === JSON.stringify(definition[key]),
      `Step ${id} already exists with different ${key}`
    );
}

/**
 * Guard a start/retry: only one unit of each kind may be active, steps run
 * only inside implement, and step dependencies must be complete.
 */
function ensureUnitCanStart(unit, isStage) {
  if (!isStage) {
    need(activeStage().id === 'implement', 'Implementation steps run within implement');
    need(
      unit.depends_on.every((id) => data.steps.find((s) => s.id === id)?.status === 'completed'),
      'Incomplete step dependencies'
    );
  }
  const units = isStage ? data.stages : data.steps;
  need(
    !units.some((s) => s !== unit && ['active', 'waiting'].includes(s.status)),
    `Complete the active ${noun} first`
  );
  if (isStage)
    need(
      !data.steps.some((s) => ['active', 'waiting'].includes(s.status)),
      'Complete the active step first'
    );
}

/**
 * Start or retry a stage/step and open its work interval. Repeating a start
 * on an already active unit acts as a checkpoint, not a new attempt.
 */
function startUnit(unit, isStage, now) {
  ensureUnitCanStart(unit, isStage);
  if (verb === 'retry' || unit.status === 'pending') {
    if (verb === 'retry') need(unit.attempts.length, 'Cannot retry a unit that has never started');
    close(now);
    attempt(unit, verb === 'retry' ? member(o.reason, TRIGGERS) : 'initial', now);
  } else need(unit.status !== 'completed', 'Use retry to reopen completed work');
  const activity = isStage ? ACTIVITIES_BY_STAGE[unit.id] : 'implementation';
  interval('work', o.activity ?? activity, now);
}

/**
 * Guard a completion: stages need their steps finished; steps need at least
 * one check and passing latest results for every named check of the current
 * attempt.
 */
function ensureUnitCanComplete(unit, isStage) {
  need(['active', 'waiting'].includes(unit.status), 'Unit has not started');
  if (isStage) {
    need(
      !data.steps.some((s) => ['active', 'waiting'].includes(s.status)) &&
        (unit.id !== 'implement' || data.steps.every((s) => s.status === 'completed')),
      'Finish implementation steps first'
    );
    return;
  }
  const checks = data.checks.filter((c) => c.step?.attempt_id === last(unit).id);
  const latest = new Map(checks.map((c) => [JSON.stringify([c.kind, c.name]), c]));
  need(
    latest.size && [...latest.values()].every((c) => c.result === 'passed'),
    'Step requires passing verification; unresolved checks remain'
  );
}

/** Complete a stage/step; repeating a completion is a no-op. */
function completeUnit(unit, isStage, now) {
  if (unit.status === 'completed') return;
  ensureUnitCanComplete(unit, isStage);
  close(now);
  unit.status = 'completed';
  Object.assign(last(unit), { ended_at: now, outcome: 'completed' });
}

/** Handle `stage`/`step` subcommands: add, start, retry, and complete. */
function handleUnit(now) {
  const isStage = noun === 'stage';
  const id = need(isStage ? o.stage : o.id, 'Missing stage/step ID');
  const unit = (isStage ? data.stages : data.steps).find((s) => s.id === id);
  if (verb === 'add' && !isStage) return addStep(id, unit);
  need(unit, `Unknown ${noun}: ${id}`);
  if (['start', 'retry'].includes(verb)) return startUnit(unit, isStage, now);
  if (verb === 'complete') return completeUnit(unit, isStage, now);
  fail('Expected add, start, retry, or complete');
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
  validateState(data);
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

/** Recompute the quality inventory from the report file's source tables. */
function refreshQuality() {
  const file = path.join(dir, FILES.report);
  data.quality = deriveQuality(
    fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '',
    data.checks
  );
}

/** Handle `quality validate`: fail closed on any open finding, failure, or non-terminal check. */
function validateQualityClosure() {
  need(verb === 'validate', 'Use quality validate');
  refreshQuality();
  need(data.quality.closure_issues.length === 0, data.quality.closure_issues.join('; '));
  need(
    data.quality.tests?.failed === null ||
      data.quality.tests === null ||
      data.quality.tests.failed === 0,
    'Latest test case failures remain'
  );
  const latest = new Map(data.checks.map((c) => [JSON.stringify([c.kind, c.name]), c]));
  need(
    [...latest.values()].every((c) => c.result === 'passed'),
    'Latest recorded checks must pass before closure'
  );
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
    ['stage', handleUnit],
    ['step', handleUnit],
    ['wait', startWait],
    ['resume', () => interval('work', need(o.activity, 'resume requires --activity'))],
    ['checkpoint', checkpointWork],
    ['recover', recoverWork],
    ['check', handleCheck],
    ['usage', importUsage],
    ['complete', completeLifecycle],
    ['report', refreshQuality],
    ['quality', validateQualityClosure],
    ['validate', () => {}],
  ]);
  const handler = need(handlers.get(noun), 'Unknown command');
  return handler(now);
}

process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);
await main().catch((error) => {
  console.error(`timing: ${error.message}`);
  process.exitCode = 1;
});
