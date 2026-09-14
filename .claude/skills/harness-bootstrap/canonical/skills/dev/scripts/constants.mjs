// Constants for the dev metrics CLI; no dependency on another flow.

/** Lifecycle this recorder owns; stat.json files from other lifecycles are rejected. */
export const LIFECYCLE = 'dev';

/** The lifecycle's stages, in flow order. */
export const STAGES = Object.freeze([
  'context',
  'ceremony',
  'plan',
  'implement',
  'test',
  'document',
]);

/** Stage whose completion gates ticket completion. */
export const FINAL_STAGE = 'document';

/** File names this recorder owns inside the ticket directory. */
export const FILES = Object.freeze({
  stat: 'stat.json',
  report: '2-report.md',
  lock: '.dev-metrics.lock',
});

/** HTML comments delimiting the generated Stage Metrics block in the report file. */
export const STAGE_REPORT_MARKERS = Object.freeze({
  start: '<!-- dev-metrics-stage:start -->',
  end: '<!-- dev-metrics-stage:end -->',
});

/** HTML comments delimiting the generated Step Metrics block in the report file. */
export const STEP_REPORT_MARKERS = Object.freeze({
  start: '<!-- dev-metrics-step:start -->',
  end: '<!-- dev-metrics-step:end -->',
});

/** Pre-split marker pair from reports generated before the stage/step split; migrated in place by `report`. */
export const LEGACY_REPORT_MARKERS = Object.freeze({
  start: '<!-- dev-metrics:start -->',
  end: '<!-- dev-metrics:end -->',
});

/** Default work activity opened when each stage starts. */
export const ACTIVITIES_BY_STAGE = Object.freeze({
  context: 'investigation',
  ceremony: 'planning',
  plan: 'planning',
  implement: 'implementation',
  test: 'verification',
  document: 'documentation',
});

/** Allowed work-interval activities. */
export const ACTIVITIES = Object.freeze([
  'investigation',
  'planning',
  'implementation',
  'verification',
  'review',
  'documentation',
]);

/** Allowed wait-interval reasons. */
export const REASONS = Object.freeze([
  'approval',
  'user_input',
  'external_dependency',
  'environment',
]);

/** Allowed retry triggers for reopening a stage or step. */
export const TRIGGERS = Object.freeze([
  'verification_failure',
  'review_feedback',
  'scope_change',
  'reopened',
]);

/** Allowed `## Review Findings` Kind values. */
export const FINDING_KINDS = Object.freeze([
  'deviation',
  'bug',
  'design',
  'improve',
  'security',
  'performance',
  'docs',
]);

/** Allowed `## Review Findings` Severity values. */
export const FINDING_SEVERITIES = Object.freeze(['critical', 'high', 'medium', 'low', 'info']);

/** Allowed `## Review Findings` Resolution values. */
export const FINDING_RESOLUTIONS = Object.freeze([
  'open',
  'fixed',
  'accepted',
  'tech-debt',
  'doc-updated',
]);

/** Allowed `## Review Findings` Origin values (semicolon-separated per row). */
export const FINDING_ORIGINS = Object.freeze([
  'plan-audit',
  'implementation-review',
  'pr-review',
  'hld-audit',
  'doc-consistency',
]);

/** Allowed `## Review Findings` Classification values. */
export const FINDING_CLASSIFICATIONS = Object.freeze([
  'introduced',
  'pre-existing',
  'ruled-out',
  'advisory',
]);

/** Allowed `## Review Findings` Deviation type values (only when Kind is `deviation`). */
export const FINDING_DEVIATION_TYPES = Object.freeze(['contradiction', 'extension', 'omission']);
