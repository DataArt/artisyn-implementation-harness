import {
  Slide,
  Section,
  Callout,
  Cols,
  Panel,
  Figure,
  BigQuote,
} from '../../components/primitives';
import { Glyph } from '../../components/glyphs';
import { ContextFolders } from '../../components/ContextFolders';
import { AgentFanout } from '../../charts/AgentFanout';
import { DocReachability } from '../../charts/DocReachability';
import { harness } from '../../data';

export function Context() {
  return (
    <Slide
      title="Context is the main asset, not prompts"
      lead="A prompt lives for one session. Context lives with the repository — it's versioned, reviewed, and inherited by the whole team."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="heard just as often"
          note={
            <p>
              Code shows what the system does, not what it's supposed to do or why. That gap is what
              the{' '}
              <a href="https://specdriven.ai/" target="_blank" rel="noopener noreferrer">
                Spec-Driven Development
              </a>{' '}
              paradigm calls the spec — a machine-readable source of truth that code, tests, and
              docs are all generated and checked against, not a courtesy artifact beside them.
            </p>
          }
        >
          "Claude can read the code as a source of truth, why do we need so much documentation?"
        </BigQuote>
      </Section>

      <Section title="What lives in the repository" collapsible defaultOpen>
        <Figure
          title="Context is two folders next to the code"
          sub="click either block to see what is actually inside — during the talk, the two blocks are the whole story"
        >
          <ContextFolders />
        </Figure>
        <div style={{ height: 16 }} />
        <Callout tone="good">
          The main engineering decision behind the whole construction:{' '}
          <b>what sits in persistent context is the table of contents, not the content</b>. A
          mini-index of every rule is always at hand — the model knows a Swagger rule exists and
          where it lives, but only reads its text when it's actually editing a controller. That's
          exactly why {harness.skillsRules + harness.skillsCommands} rule documents don't bloat
          every session.
        </Callout>
        <div style={{ height: 10 }} />
        <Callout>
          It maps onto the{' '}
          <a href="https://c4model.com/diagrams" target="_blank" rel="noopener noreferrer">
            C4 model
          </a>
          's own levels of detail: <b>HLD is the Container diagram</b>,{' '}
          <b>LLD is the Component diagram</b>, and <b>code is the Code diagram</b> — the same zoom
          levels, just written down instead of drawn.
        </Callout>
      </Section>

      <Section title="Who uses this context" collapsible defaultOpen>
        <Figure
          title="The main agents and how context is split between them"
          sub={`4 of ${harness.agents} shown`}
        >
          <AgentFanout />
        </Figure>
      </Section>

      <Section title="Why this isn't Confluence" collapsible defaultOpen>
        <BigQuote
          attr="asked on every project"
          note={
            <p>
              Because the question isn't where a human reads it, but whether the agent can reach it
              deterministically on every task.
            </p>
          }
        >
          "Why isn't all of this just in Confluence?"
        </BigQuote>
        <div style={{ height: 16 }} />
        <Figure
          title="Reachability: Repository docs vs. Confluence via MCP"
          sub="the question isn't the editor — it's whether the agent can deterministically read and respect the documentation"
        >
          <DocReachability />
        </Figure>
        <div style={{ height: 16 }} />
        <Cols n={2}>
          <Panel title="The traditional flow" tone="bad" icon={<Glyph name="docs" />}>
            <p>
              Lucidchart diagrams and presentations get rewritten by hand into Confluence. It goes
              stale within a week, nobody maintains it, and the team runs around not knowing how
              things are done.
            </p>
            <p className="takeaway__caveat">
              <b>A tool designed to store yesterday's state.</b>
            </p>
          </Panel>
          <Panel title="Documentation in the repository" tone="good" icon={<Glyph name="insync" />}>
            <p>
              It is updated in the same ticket as the code, arrives with a pull, and is reviewed in
              a PR. The agent reads it as context, so staleness stops being a matter of goodwill —
              it shows up as wrong behaviour on the next task.
            </p>
            <p className="takeaway__caveat">
              <b>An iterative process instead of a second, decaying copy.</b>
            </p>
          </Panel>
        </Cols>
        <div style={{ height: 14 }} />
        <Callout>
          The question isn't Confluence versus git — it's{' '}
          <b>whether the documentation is reachable by the agent at all</b>. An MCP connector to a
          wiki is a legitimate answer to that. In our experience it is a weaker one: pointed at
          Confluence, the agent skips parts of the content, and you find out only from the result.
        </Callout>
      </Section>

      <Section title="Why documentation is the same thing as context" collapsible defaultOpen>
        <Cols n={2}>
          <Panel muted title="Updated in the same task as the code">
            <p>
              A ticket isn't considered closed until the docs are brought in line — that's a step in
              the workflow, not a courtesy.
            </p>
          </Panel>
          <Panel muted title="Drift is visible automatically">
            <p>
              A dedicated command compares intent, the description of what was built, and the code
              itself — and surfaces the gap. Stale documentation becomes a visible problem with a
              list of locations.
            </p>
          </Panel>
        </Cols>
      </Section>
    </Slide>
  );
}
