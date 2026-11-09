import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  Code2,
  Copy,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import LifecycleDemo from '../components/LifecycleDemo';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionLink from '../components/SectionLink';
import { repoUrl, docsUrl } from '../env';

const bootstrapCommand = '/harness-bootstrap launch';
const capabilities = [
  {
    icon: <Workflow size={23} />,
    title: 'Structured lifecycles',
    text: 'Repeatable Design and Development workflows — beyond ad-hoc prompts.',
  },
  {
    icon: <Layers3 size={23} />,
    title: 'Agents and skills',
    text: 'Reusable engineering conventions and specialized, lifecycle-aware assistance.',
  },
  {
    icon: <ShieldCheck size={23} />,
    title: 'Architecture awareness',
    text: 'Decisions and implementations checked against established constraints.',
  },
  {
    icon: <Sparkles size={23} />,
    title: 'Continuous learning',
    text: 'Reflections that carry useful lessons into future work.',
  },
];

export default function Landing() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const location = useLocation();
  const copyBootstrap = async () => {
    try {
      await navigator.clipboard.writeText(bootstrapCommand);
      setCopyError(false);
      setCopied(true);
    } catch {
      setCopyError(true);
      setCopied(false);
    }
  };

  // Header's SectionLink navigates here with { scrollTo: id } when a nav
  // anchor is clicked from another page (see components/Header.tsx) — pick
  // that up once this page has actually rendered.
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (scrollTo) document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
  }, [location.state]);

  return (
    <div className="app-shell">
      <Header />

      <main id="top">
        <section className="hero container" aria-labelledby="hero-heading">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="pill-label">
              <span className="pill-dot" /> OPEN SOURCE · AI ENGINEERING
            </div>
            <h1 id="hero-heading">
              AI engineering.
              <br />
              <span>Structured by design.</span>
            </h1>
            <p className="hero-copy">
              A portable implementation harness that guides coding assistants through defined
              lifecycles, applies architectural conventions, and carries learning into the next
              task.
            </p>
            <div className="hero-actions">
              <SectionLink id="how-it-works" className="button button-primary">
                Explore the lifecycle <ArrowRight size={18} />
              </SectionLink>
              <a
                className="button button-outline"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code2 size={17} /> View on GitHub
              </a>
            </div>
          </motion.div>
          <div className="hero-preview">
            <div className="code-head mono">
              <span className="preview-dot" /> WORKFLOW PREVIEW <span className="spacer" /> ARTISYN
              / 001
            </div>
            <div className="code-rows mono">
              <p>
                <span className="term-prompt">$</span> /design TKT-123
              </p>
              <p>
                <span className="terminal-check">✓</span> Load project architecture
              </p>
              <p>
                <span className="terminal-check">✓</span> Apply engineering conventions
              </p>
              <p>
                <span className="terminal-check">✓</span> Validate design approach
              </p>
              <p className="code-highlight">
                <span className="terminal-chevron">›</span> Prepare output for review{' '}
                <span className="cursor" />
              </p>
            </div>
            <div className="code-foot">
              <Braces size={15} /> Context in · Structured decisions out <span>SIMULATED</span>
            </div>
          </div>
          <div className="hero-divider" />
        </section>

        <section id="how-it-works" className="section container" aria-labelledby="how-heading">
          <div className="section-heading">
            <span className="eyebrow">01 / HOW IT WORKS</span>
            <h2 id="how-heading">Explore the harness in action.</h2>
            <p>
              Choose a lifecycle, inspect each phase, and see how context, architectural checks, and
              feedback connect. This is an illustrative walkthrough—not a live agent run.
            </p>
          </div>
          <LifecycleDemo />
        </section>

        <section id="capabilities" className="section container" aria-labelledby="cap-heading">
          <div className="section-heading">
            <span className="eyebrow">02 / CORE CONCEPTS</span>
            <h2 id="cap-heading">More than an AI prompt.</h2>
            <p>
              A system for repeatable engineering work, context continuity, and architectural
              coherence.
            </p>
          </div>
          <div className="cap-grid">
            {capabilities.map((cap) => (
              <article key={cap.title} className="cap-card">
                <div className="cap-icon">{cap.icon}</div>
                <h3>{cap.title}</h3>
                <p>{cap.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="section container" aria-labelledby="arch-heading">
          <div className="section-heading">
            <span className="eyebrow">03 / THE OPERATING MODEL</span>
            <h2 id="arch-heading">Human intent. AI execution. Governed context.</h2>
            <p>
              Humans own objectives and consequential decisions; assistants work inside approved
              boundaries and rely on project knowledge.
            </p>
          </div>
          <div
            className="model-strip"
            aria-label="Human intent leads to AI assistant, then lifecycle, then knowledge base"
          >
            <div>
              <span className="model-num">01</span>
              <strong>Engineer</strong>
              <small>Intent & review</small>
            </div>
            <ArrowRight aria-hidden="true" />
            <div>
              <span className="model-num">02</span>
              <strong>AI assistant</strong>
              <small>Claude Code</small>
            </div>
            <ArrowRight aria-hidden="true" />
            <div>
              <span className="model-num">03</span>
              <strong>Harness lifecycle</strong>
              <small>/design · /dev</small>
            </div>
            <ArrowRight aria-hidden="true" />
            <div>
              <span className="model-num">04</span>
              <strong>Knowledge base</strong>
              <small>Architecture · Skills</small>
            </div>
          </div>
        </section>

        <section id="docs-flow" className="section container" aria-labelledby="docs-heading">
          <div className="section-heading">
            <span className="eyebrow">04 / DOCUMENTATION FLOW</span>
            <h2 id="docs-heading">Docs are born with the work, not written separately.</h2>
            <p>
              Architecture drifts from the code the moment docs are updated by hand, on a different
              schedule. The harness treats documentation as a lifecycle output, not an afterthought:
              every unit of work — a ticket, the task behind a feature, fix, or design — produces
              its own working drafts first, and only settled outcomes graduate to a permanent home.
              Rationale, rejected alternatives, and open questions stay behind; they never graduate.
            </p>
          </div>
          <div
            className="model-strip"
            aria-label="A ticket's working drafts graduate automatically to permanent documentation"
          >
            <div>
              <span className="model-num">01</span>
              <strong>Ticket</strong>
              <small>Stories/[TICKET]/</small>
            </div>
            <ArrowRight aria-hidden="true" />
            <div>
              <span className="model-num">02</span>
              <strong>Working drafts</strong>
              <small>design/ · solution/ · impl/</small>
            </div>
            <ArrowRight aria-hidden="true" />
            <div>
              <span className="model-num">03</span>
              <strong>Automatic graduation</strong>
              <small>/design publish · /dev document</small>
            </div>
            <ArrowRight aria-hidden="true" />
            <div>
              <span className="model-num">04</span>
              <strong>Permanent docs</strong>
              <small>HLD · LLD · Engineering Guide · READMEs</small>
            </div>
          </div>
        </section>

        <section
          id="get-started"
          className="section container final-section"
          aria-labelledby="start-heading"
        >
          <div>
            <span className="eyebrow">05 / GET STARTED</span>
            <h2 id="start-heading">Start with a single command.</h2>
            <p>
              Use the harness in a project, then explore the detailed engineering workflows in the
              documentation.
            </p>
          </div>
          <div className="start-panel">
            <div className="mono command-line">
              <span>$</span> {bootstrapCommand}
            </div>
            <button
              type="button"
              className="copy-btn"
              onClick={copyBootstrap}
              aria-label="Copy bootstrap command"
            >
              {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {copyError && (
            <div className="copy-hint" role="status">
              Automatic copy was unavailable. Select the command above to copy it manually.
            </div>
          )}
          <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="icon-link">
            <BookOpen size={16} /> Read the documentation <ArrowUpRight size={15} />
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
