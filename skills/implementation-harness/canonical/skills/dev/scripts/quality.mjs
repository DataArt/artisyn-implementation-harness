// Report-derived quality inventory. Markdown is the source; summaries are snapshots.
import { createHash } from 'node:crypto';
import {
  FINDING_KINDS,
  FINDING_SEVERITIES,
  FINDING_RESOLUTIONS,
  FINDING_ORIGINS,
  FINDING_CLASSIFICATIONS,
  FINDING_DEVIATION_TYPES,
} from './constants.mjs';

/** @throws {Error} When `ok` is falsy, prefixed so failures are traceable to this module. */
const required = (ok, message) => {
  if (!ok) throw new Error(`Quality: ${message}`);
};
/** Whether a cell holds a real value rather than a placeholder ('—', '-', 'unavailable', 'unknown'). */
const known = (value) => value && !['—', '-', 'unavailable', 'unknown'].includes(value);

// Split GFM cells, preserving escaped pipes and backslashes.
function cells(line) {
  const parts = [''];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\' && ['|', '\\'].includes(line[i + 1])) parts[parts.length - 1] += line[++i];
    else if (line[i] === '|') parts.push('');
    else parts[parts.length - 1] += line[i];
  }
  if (!parts[0].trim()) parts.shift();
  if (!parts.at(-1).trim()) parts.pop();
  return parts.map((s) => s.trim());
}

function table(markdown, heading) {
  // Fenced examples and comments are not records.
  const clean = markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
  const sections = [...clean.matchAll(/^## ([^\n]+)\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].filter(
    (m) => m[1].trim() === heading
  );
  required(sections.length <= 1, `duplicate ${heading} section`);
  if (!sections.length) return null;
  const lines = sections[0][2].split('\n');
  const start = lines.findIndex(
    (line, i) => line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '')
  );
  if (start < 0) return null;
  required(
    !lines
      .slice(start + 2)
      .some(
        (line, i, rest) =>
          line.trim().startsWith('|') && /^\s*\|[\s:|-]+\|\s*$/.test(rest[i + 1] ?? '')
      ),
    `multiple tables in ${heading}`
  );
  const headers = cells(lines[start]);
  required(new Set(headers).size === headers.length, `duplicate ${heading} columns`);
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].trim().startsWith('|'); i++) {
    const values = cells(lines[i]);
    required(
      values.length === headers.length,
      `${heading} row ${i + 1} has wrong cell count (escape literal pipes)`
    );
    rows.push(Object.fromEntries(headers.map((h, j) => [h, values[j]])));
  }
  return { headers, rows };
}
function columns(t, expected, heading) {
  required(
    expected.every((h) => t.headers.includes(h)),
    `${heading} requires columns: ${expected.join(', ')}`
  );
}
function unique(rows, key, pattern) {
  const seen = new Set();
  for (const row of rows) {
    required(
      pattern.test(row[key]) && !seen.has(row[key]),
      `invalid or duplicate ${key}: ${row[key]}`
    );
    seen.add(row[key]);
  }
}
const countBy = (rows, key, values) =>
  Object.fromEntries(values.map((v) => [v, rows.filter((r) => r[key] === v).length]));

export function deriveQuality(markdown, checks = [], asOf = new Date().toISOString()) {
  const ft = table(markdown, 'Review Findings');
  const dt = table(markdown, 'Tech Debt');
  const tt = table(markdown, 'Test Results');
  const issues = [];
  let findings = null,
    debt = null,
    tests = null;
  if (ft) {
    columns(
      ft,
      [
        'ID',
        'Stage',
        'Origin',
        'Kind',
        'Deviation type',
        'Severity',
        'Classification',
        'Finding',
        'Evidence',
        'Resolution',
        'TD',
        'Decision',
      ],
      'Review Findings'
    );
    unique(ft.rows, 'ID', /^RF-\d+$/);
    for (const row of ft.rows) {
      for (const [key, values] of Object.entries({
        Stage: ['plan', 'implement', 'test', 'document'],
        Kind: FINDING_KINDS,
        Severity: FINDING_SEVERITIES,
        Classification: FINDING_CLASSIFICATIONS,
        Resolution: FINDING_RESOLUTIONS,
      }))
        required(values.includes(row[key]), `${row.ID}: invalid ${key}: ${row[key]}`);
      const origins = row.Origin.split(';').map((s) => s.trim());
      required(
        origins.length &&
          new Set(origins).size === origins.length &&
          origins.every((v) => FINDING_ORIGINS.includes(v)),
        `${row.ID}: invalid Origin`
      );
      required(
        row.Kind === 'deviation'
          ? FINDING_DEVIATION_TYPES.includes(row['Deviation type'])
          : row['Deviation type'] === '—',
        `${row.ID}: invalid Deviation type`
      );
      required(
        known(row.Finding) && known(row.Evidence),
        `${row.ID}: finding and evidence required`
      );
      if (row.Resolution === 'open') issues.push(`${row.ID}: open`);
      else if (!known(row.Decision)) issues.push(`${row.ID}: missing resolution evidence/decision`);
      if (row.Resolution === 'tech-debt') {
        const linked = dt?.rows.find((d) => d['#'] === row.TD);
        if (!linked || !known(linked.Owner) || !known(linked['Next action']))
          issues.push(`${row.ID}: debt needs linked TD row, owner and next action`);
      } else if (known(row.TD)) {
        required(
          dt?.rows.some((d) => d['#'] === row.TD),
          `${row.ID}: unknown TD link`
        );
      }
    }
    const pr = ft.rows.filter((r) =>
      r.Origin.split(';')
        .map((s) => s.trim())
        .includes('pr-review')
    );
    findings = {
      total: ft.rows.length,
      by_kind: countBy(ft.rows, 'Kind', FINDING_KINDS),
      by_severity: countBy(ft.rows, 'Severity', FINDING_SEVERITIES),
      by_classification: countBy(ft.rows, 'Classification', FINDING_CLASSIFICATIONS),
      by_resolution: countBy(ft.rows, 'Resolution', FINDING_RESOLUTIONS),
      deviations_by_type: countBy(
        ft.rows.filter((r) => r.Kind === 'deviation'),
        'Deviation type',
        FINDING_DEVIATION_TYPES
      ),
      pr_review: {
        total: pr.length,
        by_kind: countBy(pr, 'Kind', FINDING_KINDS),
        by_severity: countBy(pr, 'Severity', FINDING_SEVERITIES),
      },
    };
  } else issues.push('Review Findings ledger unavailable; consolidate legacy sections explicitly');
  if (dt) {
    columns(dt, ['#', 'Description', 'Type', 'Tracker'], 'Tech Debt');
    unique(dt.rows, '#', /^TD-\d+$/);
    for (const row of dt.rows) {
      required(
        known(row.Description) && known(row.Type),
        `${row['#']}: missing debt description/type`
      );
      if (known(row.Finding))
        required(
          ft?.rows.some((f) => f.ID === row.Finding),
          `${row['#']}: unknown finding link`
        );
    }
    debt = {
      total: dt.rows.length,
      ticketed: dt.rows.filter((r) => known(r.Tracker)).length,
      unticketed: dt.rows.filter((r) => !known(r.Tracker)).length,
    };
  }
  if (tt && ['Written', 'Passed', 'Failed', 'Skipped'].some((h) => tt.headers.includes(h))) {
    columns(tt, ['Project', 'Written', 'Passed', 'Failed', 'Skipped', 'Evidence'], 'Test Results');
    unique(tt.rows, 'Project', /\S/);
    const total = (key) => {
      const values = tt.rows.map((row) => {
        const value = row[key];
        if (!known(value)) return null;
        required(
          /^\d+$/.test(value) && Number.isSafeInteger(Number(value)),
          `${row.Project}: ${key} must be an integer or unavailable`
        );
        required(known(row.Evidence), `${row.Project}: measured test counts need evidence`);
        return Number(value);
      });
      return values.length && values.every((v) => v !== null)
        ? values.reduce((a, b) => a + b, 0)
        : null;
    };
    tests = {
      written: total('Written'),
      passed: total('Passed'),
      failed: total('Failed'),
      skipped: total('Skipped'),
      scopes: tt.rows.length,
    };
    for (const row of tt.rows)
      if (/^\d+$/.test(row.Failed) && Number(row.Failed) > 0)
        issues.push(`${row.Project}: latest test case failures remain`);
  }
  const runs = checks.filter((c) => c.kind === 'test');
  return {
    version: 1,
    as_of: asOf,
    source: '2-report.md',
    // Hash only source tables, excluding generated metrics that change on refresh.
    source_sha256: createHash('sha256')
      .update(JSON.stringify([ft, dt, tt]))
      .digest('hex'),
    findings,
    tech_debt: debt,
    tests,
    test_runs: {
      recorded: runs.length,
      failed: runs.filter((c) => c.result === 'failed').length,
      errors: runs.filter((c) => c.result === 'error').length,
      interrupted: runs.filter((c) => ['running', 'interrupted', 'cancelled'].includes(c.result))
        .length,
    },
    closure_issues: issues,
  };
}

export function qualitySummary(q) {
  const show = (n) => n ?? 'unavailable';
  return `Quality (recorded inventory): findings ${show(q.findings?.total)} · open ${show(q.findings?.by_resolution.open)} · PR findings ${show(q.findings?.pr_review.total)} · critical ${show(q.findings?.by_severity.critical)} · debt ${show(q.tech_debt?.total)} · tests written ${show(q.tests?.written)} · latest failed cases ${show(q.tests?.failed)} · failed test runs ${q.test_runs.failed}. Counts describe recorded coverage, not a quality score; kind/severity/resolution breakdowns are in [stat.json](stat.json).`;
}
