import Link from 'next/link';
import {
  Accessibility,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Files,
  FlaskConical,
  Gauge,
  GitPullRequest,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import Footer from '../../components/Footer';
import { repoUrl } from '../../env';
import { seriesDark } from '../../theme';
import {
  BEFORE_AFTER,
  CONSISTENT,
  DEVIATIONS,
  FINDINGS_BY_RESOLUTION,
  FINDINGS_BY_STAGE,
  GAINS,
  HEADLINES,
  STORY_FOLDER,
} from './data';
import LifecycleExplorer from './LifecycleExplorer';
import { DataTable, Legend, pct } from './parts';
import './migration-case.css';

const GAIN_ICONS: Record<string, LucideIcon> = {
  'Static pages': Files,
  'Search engines': Search,
  'AI agents': Bot,
  Security: ShieldCheck,
  Tests: FlaskConical,
  'CI/CD': GitPullRequest,
  Lighthouse: Gauge,
  Accessibility,
};

function FindingsChart() {
  const color = seriesDark[0];
  const most = Math.max(...FINDINGS_BY_STAGE.map((f) => f.value));
  return (
    <figure className="mc-chart">
      <figcaption>Where each of the 58 findings was first caught</figcaption>
      <div className="mc-rows">
        {FINDINGS_BY_STAGE.map((f) => (
          <div className="mc-row" key={f.label}>
            <span className="mc-row-label">{f.label}</span>
            <span className="mc-track" aria-hidden="true">
              <span
                className="mc-seg"
                style={{ width: pct(f.value, most), background: color }}
                title={`${f.label}: ${f.value} findings`}
              />
            </span>
            <span className="mc-row-value">{f.value}</span>
          </div>
        ))}
      </div>
      <DataTable
        caption="Findings by the stage that caught them"
        head={['Stage', 'Findings']}
        rows={FINDINGS_BY_STAGE.map((f) => [f.label, f.value])}
      />
    </figure>
  );
}

function ResolutionChart() {
  const total = FINDINGS_BY_RESOLUTION.reduce((sum, r) => sum + r.value, 0);
  const items = FINDINGS_BY_RESOLUTION.map((r, i) => ({ ...r, color: seriesDark[i] }));
  return (
    <figure className="mc-chart">
      <figcaption>How the {total} findings were closed</figcaption>
      <div className="mc-stack" aria-hidden="true">
        {items.map((r) => (
          <span
            key={r.label}
            className="mc-seg"
            style={{ width: pct(r.value, total), background: r.color }}
            title={`${r.label}: ${r.value}`}
          >
            {r.value / total >= 0.12 ? r.value : ''}
          </span>
        ))}
      </div>
      <Legend items={items.map((r) => ({ label: `${r.label} (${r.value})`, color: r.color }))} />
      <DataTable
        caption="Findings by resolution"
        head={['Resolution', 'Findings']}
        rows={FINDINGS_BY_RESOLUTION.map((r) => [r.label, r.value])}
      />
    </figure>
  );
}

export default function MigrationCase() {
  const story = `${repoUrl}/tree/main/${STORY_FOLDER.split('/').map(encodeURIComponent).join('/')}`;
  return (
    <>
      <main className="container section mc-page">
        <div className="section-heading">
          <span className="mc-eyebrow">MIGRATION CASE</span>
          <h1>Vite to Next.js in a working day, with every decision on record.</h1>
          <p>
            This site moved from a single-page Vite app to a statically exported Next.js site: new
            routing, per-page SEO, a hashed security policy, agent tools, and the tests and docs to
            match. The harness ran it from design to merge. Every number below comes from the
            run&apos;s own records, not from estimates.
          </p>
        </div>

        <ul className="mc-headlines">
          {HEADLINES.map((h) => (
            <li key={h.label}>
              <span className="mc-value">{h.value}</span>
              <span className="mc-label">{h.label}</span>
              <span className="mc-detail">{h.detail}</span>
            </li>
          ))}
        </ul>

        <section className="mc-block" aria-labelledby="mc-gains">
          <h2 id="mc-gains">What the site gained: ready for search engines and agents</h2>
          <p className="mc-lead">
            The framework was never the point. The migration turned a single-page app into a site
            that search engines can index page by page and AI agents can query directly, with the
            tests and gates that keep it that way. One change, eight capabilities.
          </p>
          <ul className="mc-gains">
            {GAINS.map((g) => {
              const Icon = GAIN_ICONS[g.area] ?? Files;
              return (
                <li key={g.area}>
                  <span className="mc-gain-head">
                    <Icon size={18} aria-hidden="true" />
                    <h3>{g.area}</h3>
                  </span>
                  <span className="mc-gain-metric">{g.metric}</span>
                  <dl className="mc-gain-change">
                    <div>
                      <dt>Before</dt>
                      <dd>{g.before}</dd>
                    </div>
                    <div>
                      <dt>After</dt>
                      <dd>{g.after}</dd>
                    </div>
                  </dl>
                  <p>{g.value}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <LifecycleExplorer />

        <section className="mc-block" aria-labelledby="mc-findings">
          <h2 id="mc-findings">Problems surface early, and all of them close</h2>
          <p className="mc-lead">
            Half the findings were caught by the plan audit, before a line of code changed. Every
            finding was closed: fixed, written into the docs, accepted by the developer with a
            reason, or tracked as debt with an owner.
          </p>
          <div className="mc-pair">
            <FindingsChart />
            <ResolutionChart />
          </div>
          <h3 className="mc-subhead">13 deviations from the approved design, each decided</h3>
          <ul className="mc-deviations">
            {DEVIATIONS.map((d) => (
              <li key={d.label}>
                <span className="mc-dev-count">{d.value}</span>
                <span>
                  <strong>{d.label}</strong> — {d.note}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mc-block" aria-labelledby="mc-result">
          <h2 id="mc-result">Before and after</h2>
          <p className="mc-lead">
            Lighthouse 13.4.1, mobile, simulated throttling, the same local setup for both builds.
          </p>
          <table className="mc-compare">
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">Vite</th>
                <th scope="col">Next.js</th>
              </tr>
            </thead>
            <tbody>
              {BEFORE_AFTER.map((row) => (
                <tr key={row.metric}>
                  <th scope="row">
                    {row.metric}
                    {row.note && <span className="mc-note">{row.note}</span>}
                  </th>
                  <td>{row.before}</td>
                  <td>{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mc-block" aria-labelledby="mc-consistent">
          <h2 id="mc-consistent">What stayed consistent</h2>
          <p className="mc-lead">
            A prompt can rewrite a page in minutes. A migration also needs the plan, the gates and
            the record that keep code, tests and docs telling the same story. That is what made a
            change this size safe to merge in one day.
          </p>
          <ul className="mc-consistent">
            {CONSISTENT.map((c) => (
              <li key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mc-block mc-cta" aria-labelledby="mc-next">
          <h2 id="mc-next">Run your own</h2>
          <p className="mc-lead">
            Install the harness, then start a large change with{' '}
            <code className="mono">/design</code> and deliver it with{' '}
            <code className="mono">/dev</code>. Everything behind this page, the design, the
            solution and the implementation report with its metrics, sits together in one story
            folder.
          </p>
          <div className="hero-actions">
            <Link href="/get-started/" className="button button-primary">
              Get started <ArrowRight size={16} />
            </Link>
            <a href={story} className="button button-outline">
              See the whole story <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
