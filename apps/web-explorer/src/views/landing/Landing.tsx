import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import TerminalScenarios from './TerminalScenarios';
import HeroPreview from './HeroPreview';
import Footer from '../../components/Footer';
import { repoUrl, docsUrl } from '../../env';
import { ROUTE_PATHS } from '../../paths';
import CopyCommand from './CopyCommand';
import FadeIn from './FadeIn';
import { CAPABILITIES, PILLARS } from './capabilities';

const bootstrapCommand = '/implementation-harness launch';
const capabilityIcons = [
  <Workflow key="w" size={23} />,
  <Layers3 key="l" size={23} />,
  <ShieldCheck key="s" size={23} />,
  <Sparkles key="sp" size={23} />,
];
const pillarIcons = [
  <Layers3 key="l" size={24} />,
  <Code2 key="c" size={24} />,
  <BookOpen key="b" size={24} />,
];

export default function Landing() {
  return (
    <>
      <main id="top">
        <div className="hero-band">
          <section className="landing-hero container" aria-labelledby="hero-heading">
            <FadeIn className="hero-intro" y={14} duration={0.45}>
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
                <a href="#how-it-works" className="button button-primary">
                  Explore the lifecycle <ArrowRight size={18} />
                </a>
                <a
                  className="button button-outline"
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code2 size={17} /> View on GitHub
                </a>
              </div>
            </FadeIn>

            <FadeIn y={18} duration={0.5} delay={0.1}>
              <HeroPreview />
            </FadeIn>
          </section>

          <section className="container pillars" aria-label="What the harness delivers">
            {PILLARS.map((pillar, i) => (
              <article key={pillar.title} className={`pillar pillar-${pillar.tone}`}>
                <div className="pillar-head">
                  <div className="pillar-icon">{pillarIcons[i]}</div>
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
            {CAPABILITIES.map((cap, i) => (
              <article key={cap.title} className="cap-card">
                <div className="cap-icon">{capabilityIcons[i]}</div>
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
          <Link href={ROUTE_PATHS.knowledgeFlow} className="icon-link">
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
          <CopyCommand command={bootstrapCommand} />
          <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="icon-link">
            <BookOpen size={16} /> Read the documentation <ArrowUpRight size={15} />
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
