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

/** HTML comments delimiting the generated block in the report file. */
export const REPORT_MARKERS = Object.freeze({
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
