import { test } from 'node:test';
import assert from 'node:assert/strict';

const load = () => import('./lighthouse.mjs');

const audit = (score, scoreDisplayMode = 'binary', details) => ({
  score,
  scoreDisplayMode,
  ...(details && { details }),
});
const TOOLS = {
  type: 'list',
  items: [
    { type: 'list-section', value: { type: 'table', items: [{ tool: 'search_documentation' }] } },
  ],
};

/** A minimal Lighthouse result that passes every assertion. */
function lhr(overrides = {}) {
  const audits = {
    'document-title': audit(1),
    'is-crawlable': audit(1),
    'robots-txt': audit(null, 'notApplicable'),
    'agent-accessibility-tree': audit(1),
    'webmcp-form-coverage': audit(1, 'notApplicable'),
    'webmcp-registered-tools': audit(1, 'informative', TOOLS),
    'webmcp-schema-validity': audit(1),
    'cumulative-layout-shift': audit(1, 'numeric'),
    'llms-txt': audit(null, 'notApplicable'),
    ...overrides.audits,
  };
  return {
    categories: {
      performance: { score: overrides.performance ?? 0.97 },
      seo: {
        score: overrides.seo ?? 1,
        auditRefs: ['document-title', 'is-crawlable', 'robots-txt'].map((id) => ({ id })),
      },
      'agentic-browsing': {
        auditRefs: [
          'agent-accessibility-tree',
          'webmcp-form-coverage',
          'webmcp-registered-tools',
          'webmcp-schema-validity',
          'cumulative-layout-shift',
          'llms-txt',
        ].map((id) => ({ id })),
      },
    },
    audits,
  };
}

const indexable = { path: '/get-started/', index: true };
const noindex = { path: '/comic/', index: false };

test('lighthouse evaluate: a clean report has no violations', async () => {
  const { evaluate } = await load();
  assert.deepEqual(evaluate(lhr(), indexable), []);
});

test('lighthouse evaluate: an indexable page below SEO 100 fails, naming the audit', async () => {
  const { evaluate } = await load();
  const violations = evaluate(lhr({ seo: 0.92, audits: { 'robots-txt': audit(0) } }), indexable);
  assert.ok(violations.some((v) => v.includes('robots-txt')));
});

test('lighthouse evaluate: a failed agentic audit or no registered tools fails', async () => {
  const { evaluate } = await load();
  assert.ok(
    evaluate(lhr({ audits: { 'llms-txt': audit(0) } }), indexable).some((v) =>
      v.includes('llms-txt')
    )
  );
  assert.ok(
    evaluate(lhr({ audits: { 'agent-accessibility-tree': audit(0) } }), indexable).some((v) =>
      v.includes('agent-accessibility-tree')
    )
  );
  assert.notDeepEqual(
    evaluate(
      lhr({
        audits: { 'webmcp-registered-tools': audit(1, 'informative', { type: 'list', items: [] }) },
      }),
      indexable
    ),
    []
  );
});

test('lighthouse evaluate: a noindex page may fail is-crawlable only', async () => {
  const { evaluate } = await load();
  assert.deepEqual(evaluate(lhr({ seo: 0.66, audits: { 'is-crawlable': audit(0) } }), noindex), []);
  assert.notDeepEqual(
    evaluate(
      lhr({ seo: 0.5, audits: { 'is-crawlable': audit(0), 'document-title': audit(0) } }),
      noindex
    ),
    []
  );
});

test('lighthouse evaluate: performance is asserted only with a minimum', async () => {
  const { evaluate } = await load();
  assert.deepEqual(evaluate(lhr({ performance: 0.5 }), indexable), []);
  assert.notDeepEqual(evaluate(lhr({ performance: 0.5 }), indexable, { minPerformance: 90 }), []);
  assert.deepEqual(evaluate(lhr({ performance: 0.95 }), indexable, { minPerformance: 90 }), []);
});
