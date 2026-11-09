import { Slide, Section, Callout, Figure, BigQuote } from '../../components/primitives';
import { Glyph } from '../../components/glyphs';
import { HarnessExplorer } from '../../charts/HarnessExplorer';

export function Harness() {
  return (
    <Slide
      title="Harness: a system, not an assistant"
      lead="The agent doesn't work as one undifferentiated assistant. It works as a structure: six workflow cycles, a learning loop they all feed into, and a hard boundary on what the agent is not allowed to do."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="asked before anyone's seen the diagram"
          note={
            <p>
              A harness is what a{' '}
              <a
                href="https://resources.altium.com/p/what-is-wire-harness-design"
                target="_blank"
                rel="noopener noreferrer"
              >
                wire harness
              </a>{' '}
              is in a car: not one wire, but the bundle of them — routed, labeled, and connected the
              same way every time so each component gets the right signal. Prompting Claude directly
              is one wire. The harness is the whole loom: the cycles, checkpoints, and rules that
              route context to the model consistently, task after task, instead of you re-wiring the
              connection by hand every time.
            </p>
          }
        >
          "What is the harness? Why can't I just prompt Claude directly?"
        </BigQuote>
        <div style={{ height: 14 }} />
        <Callout>
          This isn't a bespoke pattern —{' '}
          <a
            href="https://www.anthropic.com/engineering/harness-design-long-running-apps"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anthropic's own harness-design guidance
          </a>{' '}
          for long-running agent work argues the same structure: decompose the work into phases with
          clear checkpoints, and <b>separate the agent doing the work from the agent judging it</b>{' '}
          — which is exactly why Review sits apart from Development instead of grading its own
          output.
        </Callout>
      </Section>

      <Section title="The encoded process" collapsible defaultOpen>
        <Figure
          title="The harness as an operating layer"
          sub="a ticket picks up project context on the way in, cycles through plan → implement → test → document, and feeds what it learns back into that context"
        >
          <img
            className="figure__screenshot"
            src={`${import.meta.env.BASE_URL}images/implementation-harness-diagram.png`}
            alt="Implementation Harness diagram: a Jira ticket flows into Project Context (architecture, decisions and history, existing codebase, standards), which feeds the Plan → Implement → Test → Document cycle driven by rules, workflow, tools, and quality checks; the harness includes rules and guardrails, workflow logic, tool access, and quality gates; feedback, new decisions, and learnings flow back into Project Context"
          />
        </Figure>
        <div style={{ height: 14 }} />
        <Callout>
          This is the wire-harness analogy, drawn: <b>routed, labeled, and connected</b> the same
          way every time. Context doesn't arrive fresh each session — it's wired in from a fixed set
          of sources, run through the same cycle, and updated by the same feedback path, so the next
          ticket inherits exactly what the last one learned.
        </Callout>
      </Section>

      <Section title="What the harness is made of, end to end" collapsible defaultOpen>
        <Figure
          title="How the cycles connect"
          sub="click any block — its phases expand below the diagram. Review, QA, and Data (grey/yellow) are covered elsewhere in the deck — out of scope for this pillar"
        >
          <HarnessExplorer />
        </Figure>
      </Section>

      <Section title="Implicit Deny" collapsible defaultOpen>
        <div className="bans">
          {[
            ['cloud CLI', 'cloud resources and access'],
            ['terraform/cdk apply', 'infrastructure'],
            ['git commit', 'repository history'],
            ['yarn nx', 'builds and generators'],
          ].map(([cmd, what]) => (
            <div className="bans__row" key={cmd}>
              <span className="bans__icon">
                <Glyph name="forbidden" size={20} />
              </span>
              <code>{cmd}</code>
              <span className="bans__what">{what}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 14 }} />
        <Callout>
          These commands are blocked for the agent at the settings level.{' '}
          <b>It proposes the command — a human runs it.</b> This isn't about trusting the model;
          it's about who's accountable for the consequences.
        </Callout>
      </Section>

      <Section
        title="Experience which can be shared across the organization"
        collapsible
        defaultOpen
      >
        <Callout tone="good">
          The best practices and harness design built on this project aren't staying here — they're
          already <b>actively being adopted on a few other projects</b>, and evaluated every day as
          those projects put them to use.
          <div style={{ height: 16 }} />
          The bootstrap mechanism that ports this into any other project sits under the{' '}
          <b>Artisyn</b> umbrella, released as a versioned package and installed with one command.
        </Callout>
      </Section>
    </Slide>
  );
}
