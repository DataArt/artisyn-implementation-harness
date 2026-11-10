import { BookOpen, Layers, Repeat, ArrowRightLeft, ShieldCheck, Gauge } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { DocsFlowMap } from '../../charts/DocsFlowMap';

/**
 * Interactive expansion of Landing's "Documentation Flow" strip. Content is
 * sourced from two real Engineering Guide docs, not invented:
 * docs/Engineering Guide/Documentation/01 Principles.md (the principles
 * grid) and docs/Engineering Guide/Lifecycles/05 Documents Flow.md (the
 * diagram — same nodes, edges, and classDef colors as that doc's own
 * Mermaid chart, brought to life with DocsFlowMap).
 */

const principles = [
  {
    icon: <Layers size={22} />,
    title: 'Separation of concerns',
    text: 'Each document covers one concern, and goes where its audience looks: architecture to docs/, operations to Engineering Guide, local setup to the app README.',
  },
  {
    icon: <Gauge size={22} />,
    title: 'Keep it simple',
    text: 'Write the minimum that is unambiguous. One sentence over three, a table over three paragraphs. Delete any sentence whose removal does not change the meaning.',
  },
  {
    icon: <Repeat size={22} />,
    title: "Don't repeat yourself",
    text: 'Each concept lives in exactly one place. Everywhere else: one sentence and a link. When the source changes, one edit is enough.',
  },
  {
    icon: <ArrowRightLeft size={22} />,
    title: 'Progressive disclosure',
    text: 'Root context files point; they do not inline. A line that says "read X for Y" stays accurate indefinitely — inlined content drifts the moment the source changes.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Certainty principle',
    text: 'HLD, LLD, and NFR docs state only settled outcomes — no open questions, no TODO placeholders. Uncertainty stays in the working Story until it is resolved.',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Diagram-first',
    text: 'Every doc carries at least one Mermaid diagram. Never write as prose what can be a diagram; never write as bullets what can be a table.',
  },
];

export default function DocsFlow() {
  return (
    <div className="app-shell">
      <Header />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 96 }}>
        <div className="section-heading" style={{ maxWidth: 780 }}>
          <span className="eyebrow">DOCUMENTATION PRINCIPLES &amp; FLOW</span>
          <h1 style={{ fontSize: 'clamp(32px,4.5vw,48px)', margin: '15px 0' }}>
            Docs are a lifecycle output, not an afterthought.
          </h1>
          <p>
            Architecture drifts from the code the moment docs are updated by hand, on a different
            schedule, by someone who has to remember to do it. This harness treats documentation as
            something every ticket produces automatically — working drafts first, then only the
            settled outcomes graduate to a permanent home. Click any node below to see what it
            actually holds.
          </p>
        </div>

        <div className="cap-grid" style={{ marginTop: 36, marginBottom: 56 }}>
          {principles.map((p) => (
            <article key={p.title} className="cap-card">
              <div className="cap-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>

        <div className="section-heading" style={{ maxWidth: 780 }}>
          <span className="eyebrow">THE PIPELINE</span>
          <h2>From a ticket to a settled fact.</h2>
          <p>
            Every tier here is real: the exact folder names, the exact skill commands, the exact
            permanent-doc destinations this harness actually uses — not a simplified illustration.
            The dashed edges are the two feedback loops: a deviation that gets authorized feeds back
            into the HLD, and a gap <code>/where-we-are</code> surfaces becomes the next ticket.
          </p>
        </div>
        <DocsFlowMap />
      </main>
      <Footer />
    </div>
  );
}
