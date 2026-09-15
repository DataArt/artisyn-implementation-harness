// Constants for the design metrics CLI; no dependency on another flow.

/** Lifecycle this recorder owns; stat.json files from other lifecycles are rejected. */
export const LIFECYCLE = 'design';

/** The lifecycle's stages, in flow order. */
export const STAGES = Object.freeze([
  'frame',
  'research',
  'evaluate',
  'solution',
  'review-gate',
  'address-feedback',
  'publish',
]);

/** Stage whose completion gates ticket completion. */
export const FINAL_STAGE = 'publish';

/** File names this recorder owns inside the design directory. */
export const FILES = Object.freeze({
  stat: 'stat.json',
  report: 'Report.md',
  lock: '.design-metrics.lock',
});

/** HTML comments delimiting the generated block in the report file. */
export const REPORT_MARKERS = Object.freeze({
  start: '<!-- design-metrics:start -->',
  end: '<!-- design-metrics:end -->',
});

/** Marker pair emitted by earlier versions; report refresh migrates it in place. */
export const LEGACY_REPORT_MARKERS = Object.freeze({
  start: '<!-- dev-metrics:start -->',
  end: '<!-- dev-metrics:end -->',
});

/** Default work activity opened when each stage starts. */
export const ACTIVITIES_BY_STAGE = Object.freeze({
  frame: 'planning',
  research: 'investigation',
  evaluate: 'review',
  solution: 'documentation',
  'review-gate': 'review',
  'address-feedback': 'review',
  publish: 'documentation',
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

/** Allowed retry triggers for reopening a stage. */
export const TRIGGERS = Object.freeze([
  'verification_failure',
  'review_feedback',
  'scope_change',
  'reopened',
]);
