import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  Copy,
  Github,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import LifecycleDemo from './components/LifecycleDemo';

const repoUrl =
  import.meta.env.VITE_REPO_URL || 'https://github.com/dataart/artisyn-implementation-harness';
const docsUrl = import.meta.env.VITE_DOCS_URL || `${repoUrl}/tree/main/docs/Harness`;
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

export default function App() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
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
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Artisyn home">
            <img src="/brand/artisyn-mark.svg" alt="" width="34" height="34" />
            <span>
              artisyn<span className="brand-muted"> / explorer</span>
            </span>
          </a>
          <nav aria-label="Main navigation" className="main-nav">
            <a href="#how-it-works">How it works</a>
            <a href="#capabilities">Capabilities</a>
            <a href={docsUrl} target="_blank" rel="noopener noreferrer">
              Docs <ArrowUpRight size={13} />
            </a>
          </nav>
          <a className="header-github" href={repoUrl} target="_blank" rel="noopener noreferrer">
            <Github size={17} />
            <span>GitHub</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

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
              <a className="button button-primary" href="#how-it-works">
                Explore the lifecycle <ArrowRight size={18} />
              </a>
              <a
                className="button button-outline"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={17} /> View on GitHub
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

        <section
          id="get-started"
          className="section container final-section"
          aria-labelledby="start-heading"
        >
          <div>
            <span className="eyebrow">04 / GET STARTED</span>
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
          <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="inline-link">
            <BookOpen size={16} /> Read the documentation <ArrowUpRight size={15} />
          </a>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>Artisyn · Implementation Harness</span>
          <span>Built to explain the harness. Not a live execution environment.</span>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">
            Open source <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>
    </div>
  );
}
