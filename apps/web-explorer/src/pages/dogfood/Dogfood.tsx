import { ArrowRight, FileDiff, GitBranch, Network, PackageCheck } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import GraphExplorer from './GraphExplorer';
import './dogfood.css';

/**
 * "Eating our own dog food": this repo is the canonical source of the harness
 * and also its first consumer. The figures in `example` are the real numbers
 * from the 4.2.0 release (OKF-compatible knowledge base) applied to this repo.
 */

const loop = [
  {
    icon: <GitBranch size={20} />,
    title: 'Canonical',
    command: 'skills/implementation-harness/canonical/',
    text: 'Changes land in the canonical package first, the same files every project installs from.',
  },
  {
    icon: <PackageCheck size={20} />,
    title: 'Patch prepare',
    command: '/implementation-harness patch prepare',
    text: 'Direct canonical edits become a portable bundle: unified diffs against recorded bases, each one verified by hash.',
  },
  {
    icon: <FileDiff size={20} />,
    title: 'Patch apply',
    command: '/implementation-harness patch apply',
    text: "The bundle is rendered with this repo's own values and merged three ways. Local customizations are kept and recorded, never overwritten.",
  },
  {
    icon: <Network size={20} />,
    title: 'Reindex graph',
    command: '/implementation-harness reindex-graph',
    text: 'The operational graph is rebuilt. When the docs format changed, migrate runs after a dry run the developer confirms.',
  },
];

const example = [
  { value: '50', label: 'canonical files in the 4.2.0 bundle, every diff verified' },
  { value: '26', label: 'outputs applied here; 4 docs kept local wording' },
  { value: '220', label: 'docs migrated to the OKF 0.2 frontmatter' },
  { value: '205 → 205', label: 'docs in the graph before and after' },
  { value: '217 → 217', label: 'authored edges kept; none merged or orphaned' },
  { value: '0', label: 'files changed when migrate ran a second time' },
];

export default function Dogfood() {
  return (
    <div className="app-shell">
      <Header />
      <main className="container df-page">
        <section className="df-intro">
          <p className="eyebrow">DOGFOOD</p>
          <h1>We run the harness on the harness.</h1>
          <p className="df-lead">
            "Eating your own dog food" means using your own product the way your users do. This repo
            is the canonical source of the Implementation Harness and also its first consumer. Every
            release reaches this repo through the same patch flow that updates any other project, so
            problems show up here before they show up anywhere else.
          </p>
        </section>

        <section className="df-loop" aria-label="The delivery loop">
          {loop.map((step, i) => (
            <div className="df-loop-item" key={step.title}>
              <article className="df-step">
                <div className="df-step-icon">{step.icon}</div>
                <span className="df-step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <code>{step.command}</code>
                <p>{step.text}</p>
              </article>
              {i < loop.length - 1 && <ArrowRight className="df-arrow" size={20} aria-hidden />}
            </div>
          ))}
        </section>

        <section className="df-example" aria-label="Worked example">
          <div className="df-example-head">
            <p className="eyebrow">WORKED EXAMPLE</p>
            <h2>4.2.0: the OKF-compatible knowledge base</h2>
            <p>
              The release changed the docs format itself, so this repo's own docs were the first to
              migrate. The graph had to come through unchanged.
            </p>
          </div>
          <div className="df-stats">
            {example.map((s) => (
              <div className="df-stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="df-note">
            Running it here first also caught bugs in the new migrate command, such as code-block
            comments turning into empty headings, before any other project met them. They are fixed
            in 4.2.0 itself.
          </p>
        </section>

        <section className="df-graph" aria-label="Graph Explorer">
          <div className="df-graph-head">
            <p className="eyebrow">GRAPH EXPLORER</p>
            <h2>The graph the migration had to keep</h2>
            <p>
              This repo's operational graph after the migration: every doc a dot, ringed by tier
              from Product at the centre out to Stories, and every authored edge a line between
              them. Same docs, same edges, before and after.
            </p>
          </div>
          <GraphExplorer />
        </section>
      </main>
      <Footer />
    </div>
  );
}
