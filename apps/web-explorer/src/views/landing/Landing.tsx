import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import TerminalScenarios from '../../components/TerminalScenarios';
import HeroPreview from '../../components/HeroPreview';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SectionLink from '../../components/SectionLink';
import { repoUrl, docsUrl } from '../../env';

const bootstrapCommand = '/implementation-harness launch';
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

// First-viewport value statement: the three outcomes a reader should take away before scrolling.
const pillars = [
  {
    icon: <Layers3 size={24} />,
    tone: 'violet',
    title: 'Solution Design',
    text: 'Turn requirements into a structured, reviewable design (HLD/LLD) with architectural context and guardrails.',
  },
  {
    icon: <Code2 size={24} />,
    tone: 'blue',
    title: 'Development',
    text: 'Guide AI and developers through a governed, repeatable implementation flow with quality controls and handoffs.',
  },
  {
    icon: <BookOpen size={24} />,
    tone: 'teal',
    title: 'Knowledge',
    text: 'Design, code and documentation stay consistent with each other — one living knowledge base that humans and AI both rely on.',
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
        <div className="hero-band">
          <section className="landing-hero container" aria-labelledby="hero-heading">
            <motion.div
              className="hero-intro"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <h1 id="hero-heading">
                AI engineering.
                <br />
                <span>Structured by design.</span>
              </h1>
              <p className="hero-copy">
                A portable AI engineering harness that connects solution design, governed
                implementation, and living documentation — keeping decisions, code, and knowledge
                aligned.
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

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <HeroPreview />
            </motion.div>
          </section>

          <section className="container pillars" aria-label="What the harness delivers">
            {pillars.map((pillar) => (
              <article key={pillar.title} className={`pillar pillar-${pillar.tone}`}>
                <div className="pillar-head">
                  <div className="pillar-icon">{pillar.icon}</div>
                  <h2>{pillar.title}</h2>
                </div>
                <p>{pillar.text}</p>
              </article>
            ))}
          </section>
          <div className="container">
            <div className="hero-divider" />
          </div>
        </div>

        <section id="how-it-works" className="section container" aria-labelledby="how-heading">
          <div className="section-heading">
            <span className="eyebrow">01 / HOW IT WORKS</span>
            <h2 id="how-heading">Explore the harness in action.</h2>
            <p>
              Three real flows, condensed: installing the harness, designing a change, and
              implementing it. This is a simulated run—not a live agent execution.
            </p>
          </div>
          <TerminalScenarios />
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
          <Link to="/docs-flow" className="icon-link">
            Explore the full interactive flow <ArrowRight size={15} />
          </Link>
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
