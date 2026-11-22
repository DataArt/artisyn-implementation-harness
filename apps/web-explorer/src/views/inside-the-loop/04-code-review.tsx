import {
  Slide,
  Section,
  Callout,
  Quote,
  Cols,
  Panel,
  Figure,
  BigQuote,
} from '../../components/primitives';
import { RelayLoop } from '../../charts/RelayLoop';
import { Glyph } from '../../components/glyphs';
import { XrayAnatomy } from '../../charts/XrayAnatomy';
import { ReviewChain } from '../../charts/ReviewChain';
import { FindingTriageViz } from '../../charts/FindingTriageViz';

export function CodeReview() {
  return (
    <Slide
      title="Code review stopped being review and became knowledge transfer"
      lead="Agents don't just write code — they can review it too, checking it against requirements and architecture docs about as well as a person would. Looked at from any angle, what's left for the human is picking the trade-off. By and large, code review turns into knowledge transfer."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="code review, before"
          note={
            <p>
              The loaded half of review — taste, naming, holy wars — is the half that moved to the
              machine. What is left is the half worth a person’s attention.
            </p>
          }
        >
          "Who are you to tell me how to do it?"
        </BigQuote>
      </Section>

      <Section title="What changed" collapsible defaultOpen>
        <Figure
          title="Who is in the chain, before and after"
          sub="the substitution is not human → robot; it is human → robot + human"
        >
          <ReviewChain />
        </Figure>
      </Section>

      <Section title="X-Ray" collapsible defaultOpen>
        <Cols n={2}>
          <Panel title="Before" tone="bad" icon={<Glyph name="workload" />}>
            <p>
              The reviewer spent their attention on formatting, naming, "you forgot to handle that
              error," "where's the Swagger decorator." By the time they got to architectural
              questions they were tired — or never got there.
            </p>
            <p>
              And "code review" was a loaded term: whoever reviewed well started holy wars, long
              threads, and "who are you to tell me how to do it."
            </p>
          </Panel>
          <Panel title="Now" tone="good" icon={<Glyph name="understood" />}>
            <p>
              <code>/x-ray</code> catches the routine stuff before a human even opens the diff. The
              human discusses the decision: why this way and not another; what the alternatives
              were; what it means for the neighboring layer. It's a conversation, not an inspection.
            </p>
            <p>
              What is left for people is <b>a friendly exchange of knowledge</b> — the negative part
              of the job moved to the machine.
            </p>
          </Panel>
        </Cols>
        <p>
          For team members not involved in line-by-line coding (such as architects or cross-module
          leads), structured <code>/x-ray</code> review files provide an immediate mental model of
          changes across the system.
        </p>
        <p>
          Instead of getting bogged down in syntax, code review focuses on what was built, why, and
          how architectural boundaries were preserved.
        </p>
      </Section>

      <Section title="What /x-ray is made of" collapsible defaultOpen>
        <Figure
          title="One command — three passes over the diff"
          sub="click a pass to see what it actually looks for"
        >
          <XrayAnatomy />
        </Figure>
        <div style={{ height: 16 }} />
        <a
          className="reportlink"
          href="./xray-report-example.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>
            <span className="reportlink__label">Open a real /x-ray report</span>{' '}
            <span className="reportlink__sub">— ND-277, interactive HTML, opens in a new tab</span>
          </span>
          <span className="reportlink__arrow">↗</span>
        </a>
      </Section>

      <Section
        title="Not every finding is a problem: human direction in triage"
        collapsible
        defaultOpen
      >
        <Figure
          title="Triage: AI flags raw structural anomalies, humans decide real severity"
          sub="severity is a property of the environment and business context, which only people hold"
        >
          <FindingTriageViz />
        </Figure>
        <div style={{ height: 16 }} />
        <Cols n={2}>
          <Panel title="What the agent detects" tone="warn" icon={<Glyph name="review" />}>
            <p>
              The agent spots structural divergences, potential data flow anomalies, or unhandled
              cases. Its reasoning is often structurally sound — but it operates without runtime,
              release sequence, or environment awareness.
            </p>
          </Panel>
          <Panel title="What the human decides" tone="good" icon={<Glyph name="understood" />}>
            <p>
              The engineer supplies the missing context: knowing whether a state is safe in dev, an
              intentional migration phase, or an accepted trade-off.
            </p>
            <p className="takeaway__caveat">
              <b>The finding is real; the verdict belongs to the human.</b>
            </p>
          </Panel>
        </Cols>
      </Section>

      <Section
        title="Where this scheme breaks — and it's not about the tech"
        collapsible
        defaultOpen
      >
        <Figure title="What a review looks like once the human drops out">
          <RelayLoop />
        </Figure>
        <div style={{ height: 14 }} />
        <Callout tone="bad">
          Formally there are two engineers in the chain. In practice — <b>two couriers</b>. The
          reviewer forwarded the whole report, the developer fed the same report back to the model,
          the model fixed it and sent it back, and the whole thing went around again. The code may
          even have gotten better. <b>But no knowledge transfer happened in either direction</b> —
          and that's precisely what we set the review up for. And there's nobody left to decide
          which findings are even worth fixing: deciding requires reading.
        </Callout>
      </Section>

      <Section title="What we did about it — and what we didn't" collapsible defaultOpen>
        <Cols n={2}>
          <Panel title="What we did" tone="good" icon={<Glyph name="review" />}>
            <p>
              <b>The review is triggered by whoever approves it, not by the code's author.</b>{' '}
              Different heads — already a minimal guarantee that a second person actually looked at
              the diff.
            </p>
            <p>
              <b>Every finding gets an explicit decision</b>: fix it / leave it as optional / mark
              it a false positive. An engineer makes that call, and it's recorded in the story
              report. The classification is the trace that proves a human actually read it.
            </p>
            <p>
              <b>Findings don't die in PR comments.</b> Story report → reflection → skill. From
              there the rule enforces itself, for everyone.
            </p>
          </Panel>
          <Panel
            title="What we didn't do — but probably should"
            tone="warn"
            icon={<Glyph name="target" />}
          >
            <p>
              <b>An engagement gate.</b> Before closing a finding, the person answers one short
              question generated from that same finding: <i>under what input does this show up?</i>{' '}
              or <i>which rule does this break?</i>
            </p>
            <p>
              This isn't bureaucracy or an exam. It's{' '}
              <b>the cheapest possible check that the report was actually opened</b> — and it
              instantly catches "forwarded without looking."
            </p>
            <p>
              We haven't done this. We're presenting it as a hypothesis — and as an example that a{' '}
              <b>harness can be extended toward people, not just agents</b>. Rules aren't written
              only for the model.
            </p>
          </Panel>
        </Cols>
      </Section>

      <Section title="An honest limitation" collapsible defaultOpen>
        <Quote attr="from a team discussion">
          Code review usually happens between two people, not among everyone. The knowledge transfer
          ends up as a line segment between two points, not one-to-many.
        </Quote>
        <div style={{ height: 16 }} />
        <Callout tone="good">
          What closes the gap isn't a meeting — it's that <b>everything ends up in documentation</b>
          : review findings flow into the story report, from there into a reflection, from there
          into a skill. From that point on, either a human can go open and read it, or an agent can
          read it on their behalf and answer with substance.{' '}
          <b>That's how "one-to-one" turns into "one-to-many."</b>
        </Callout>
      </Section>
    </Slide>
  );
}
