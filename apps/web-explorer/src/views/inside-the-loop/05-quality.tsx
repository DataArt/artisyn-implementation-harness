import {
  Slide,
  Section,
  Bullets,
  Callout,
  Cols,
  Panel,
  Figure,
  Legend,
  BigQuote,
} from '../../components/primitives';
import { StackedRow } from '../../charts/StackedRow';
import { SolidSkillViz } from '../../charts/SolidSkillViz';
import { EncodedSupervisionViz } from '../../charts/EncodedSupervisionViz';
import { Glyph } from '../../components/glyphs';
import { stepOutcomes } from '../../data';

export function CodeQuality() {
  return (
    <Slide
      title="Code quality: the criterion changed"
      lead="Anyone who's worked with AI has noticed the machine writes remarkably good code, and fast — more so when the task is well specified. That pushed the quality bar onto more formal ground, resting on three rules."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="the old quality bar, in one sentence"
          note={
            <p>
              There was no consistent bar — code swung from gold-plated to slapped together
              depending on who was rushed that day. Three signals a machine can check took its
              place.
            </p>
          }
        >
          "Either gold-plate it, or just slap it together."
        </BigQuote>
      </Section>

      <Section title="The quality criterion changed" collapsible defaultOpen>
        <p className="lead-sm">
          If the approach is followed, <b>it doesn't matter how many "ifs" are in there</b>. The old
          criterion — "does the reviewer like this code" — was replaced by three checks a machine
          can run. They are checks, not commandments: they say when to stop arguing about taste, not
          what good engineering is.
        </p>
        <div style={{ height: 16 }} />
        <Cols n={3}>
          <Panel title="The agent can work with this code" icon={<Glyph name="understood" />}>
            <p>
              The main reader of code is no longer only a human. If an agent can reconstruct the
              intent from the code without hints, the code is readable. If it gets confused,{' '}
              <b>that's a defect — even when everything works</b>.
            </p>
            <p>
              Understanding isn't the finish line — <b>changing it has to be just as easy</b>. That
              means the code is actually broken into clean components and layers, not one tangled
              piece: touching one thing shouldn't mean touching everything.
            </p>
          </Panel>
          <Panel title="Code matches documentation" icon={<Glyph name="insync" />}>
            <p>
              Drift here isn't cosmetic: the agent pulls context for the next task from the
              documentation. Once they diverge — <b>the entry point into the task is broken</b>, and
              from there it will confidently do the wrong thing.
            </p>
          </Panel>
          <Panel title="Tests exist and pass" icon={<Glyph name="tested" />}>
            <p>
              Not about coverage for the sake of a percentage. A test is{' '}
              <b>the only way to verify the code does what was wanted</b> without rereading it line
              by line.
            </p>
          </Panel>
        </Cols>
        <div style={{ height: 16 }} />
        <Callout>
          Where the code doesn't follow best practices, it's usually simply because there was no
          need to — not because someone missed it.
        </Callout>
        <div style={{ height: 14 }} />
        <Callout tone="warn">
          <b>Known failure patterns:</b> left alone, the agent defaults to fallbacks and "just in
          case" checks nobody asked for, and it likes to dump everything into one file instead of
          splitting it up. Most of the human's job here is watching the file layout and making sure
          the agent actually cleans up its own mess.
        </Callout>
      </Section>

      <Section title="What a skill actually carries" collapsible defaultOpen>
        <Figure
          title="Skills as quality standards: activating latent SOLID architecture"
          sub="the model knows all patterns, but takes the lazy path unless the skill explicitly demands high standards"
        >
          <SolidSkillViz />
        </Figure>
        <div style={{ height: 16 }} />
        <Cols n={2}>
          <Panel title="The model knows more than it uses" icon={<Glyph name="understood" />}>
            <p>
              It knows SOLID. It knows the patterns — better than a very large share of developers.
              What it does not have is <b>experience of which one is right here</b>, so by default
              it takes the path of least resistance: not the worst it could do, and nowhere near the
              best. <b>It is lazy unless you tell it not to be.</b>
            </p>
            <p>
              A skill is the thing that pulls the level of expertise up. Not by teaching it
              principles — by stating what we expect: project structure, the right files in the
              right places, no duplicated code.
            </p>
          </Panel>
          <Panel title="So write the scope into the skill" icon={<Glyph name="target" />}>
            <p>
              For each skill it is worth describing its <b>scope</b> — and which patterns and
              algorithms are wanted inside that scope.
            </p>
            <p>
              Concretely: if you want the BFF written along SOLID lines, put a line in the skill
              saying "where you can, and where it isn't an anti-pattern, use SOLID while planning."
              Left unsaid, it will pick some existing variant and move on.
            </p>
            <p className="takeaway__caveat">
              <b>Didn't like what came out? That goes straight into a skill or a reflection</b> —
              that is the entire maintenance loop.
            </p>
          </Panel>
        </Cols>
      </Section>

      <Section
        title="Familiar work needs less attention. New work needs your hands on it"
        collapsible
        defaultOpen
      >
        <Figure
          title="Encoded vs. Unencoded Ground: where hands-on supervision belongs"
          sub="teach the robot by hand on new ground once → capture into skills → unlock low-touch repetition"
        >
          <EncodedSupervisionViz />
        </Figure>
      </Section>

      <Section title="Process health — measured" collapsible defaultOpen>
        <Figure
          title="330 implementation steps across all stories"
          sub="the unit is one step inside a ticket, taken from the plans and reports — not a ticket, and not a project-level milestone"
        >
          <StackedRow segments={stepOutcomes} />
          <Legend items={stepOutcomes.map((s) => ({ color: s.color, label: s.label }))} />
        </Figure>
        <div style={{ height: 14 }} />
        <Bullets
          items={[
            <>
              <b>88% of steps went exactly as planned.</b> This is a metric of predictability, not
              speed — and for management, it matters more.
            </>,
            <>
              The remaining 12% is exactly what turned into reflections and later skills. Friction
              doesn't disappear — it gets converted.
            </>,
            <>
              <b>
                Two different things are pooled in "blocked", and only one of them is about the
                agent.
              </b>{' '}
              A step can stall because the model went sideways — or because the frontend is waiting
              on an API, the branch grew new fields overnight, or someone is waiting on a policy
              answer by email. The second kind was there before AI and will outlive it; read this
              chart as "how predictable the work inside a ticket is", not as "how often the agent
              stumbles".
            </>,
          ]}
        />
      </Section>
    </Slide>
  );
}
