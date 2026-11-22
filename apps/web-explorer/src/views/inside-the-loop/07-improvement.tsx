import { Slide, Section, Callout, Figure, FieldNote, BigQuote } from '../../components/primitives';
import { BarChart } from '../../charts/BarChart';
import { Funnel } from '../../charts/Funnel';
import { SkillLifecycle } from '../../charts/SkillLifecycle';
import { SkillIsRequirements } from '../../charts/SkillIsRequirements';
import { reflectionsByMonth, skillFunnel } from '../../data';

export function ContinuousImprovement() {
  return (
    <Slide
      title="Continuous improvement: reflections → triage → skills"
      lead="One developer's stumble becomes part of the next generation of code — for everyone."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="the sentence every skill starts from"
          note={
            <p>
              A reflection is what that sentence turns into once it is written down instead of
              repeated.
            </p>
          }
        >
          "It made the same mistake again."
        </BigQuote>
      </Section>

      <Section title="What a skill is" collapsible defaultOpen>
        <Figure
          title="A skill isn't training the model — it's our requirements"
          sub="on the left, what it already knows without us; on the right, what it doesn't and can't know"
        >
          <SkillIsRequirements />
        </Figure>
        <div style={{ height: 14 }} />
        <Callout>
          The model already knows how to code — teaching it SOLID is pointless, it knows SOLID. A
          skill captures something else: <b>this specific project's expectations</b> — where things
          live, which file belongs where, what we migrate with, what's forbidden, what order the
          steps go in. How many ifs ended up inside a method is not what a skill is for. That's why
          skills <b>aren't written up front "by the book"</b>: there's nowhere to get them from
          except your own work.
        </Callout>
      </Section>

      <Section title="How it works" collapsible defaultOpen>
        <Figure
          title="The lifecycle of a skill"
          sub='from "that surprised me" to a rule that&apos;s followed automatically — stages of the evolve skill'
        >
          <SkillLifecycle />
        </Figure>
        <div style={{ height: 14 }} />
        <Callout>
          Two details decide whether this stays honest. <b>Triage has two exits</b>: if the rule
          already exists it is updated there and then, and only a genuinely new one is written into{' '}
          <code>draft/</code>. And <b>a draft is not a skill yet</b> — it sits for about a week
          before <code>/evolve adopt</code> turns it into one, because a rule extracted in the heat
          of one ticket usually turns out to describe that ticket rather than the project. What
          survives a week is what was actually a convention.
        </Callout>
      </Section>

      <Section title="The funnel over 5 months" collapsible defaultOpen>
        <Figure title="From reflection to rule">
          <Funnel stages={skillFunnel} />
        </Figure>
      </Section>

      <Section title="The learning curve" collapsible defaultOpen>
        <Figure
          title="Reflections by month"
          sub="the curve is falling — and that's good news, not a loss of discipline"
        >
          <BarChart data={reflectionsByMonth} height={210} />
        </Figure>
        <div style={{ height: 14 }} />
        <FieldNote
          title="How the harness behaves in practice"
          teaser="the harness does nothing on its own — systematic reflections turn friction into permanent skills"
        >
          <p>
            On its own, an AI harness is static. Its effectiveness depends entirely on disciplined
            reflections: when developers systematically log surprises, cluster them into triage, and
            promote them into skills, recurring bugs vanish.
          </p>
          <p>
            Without regular reflections, engineers find themselves constantly wrestling with code
            generation instead of directing it.
          </p>
        </FieldNote>
        <div style={{ height: 14 }} />
        <Callout tone="good">
          In April–May we kept tripping constantly — 66 reflections in two months. By August, 10.
          That doesn't mean we stopped writing them. It means{' '}
          <b>the conventions are already encoded</b> and there's nothing left to trip over. Exactly
          the effect all of this was built for: the scaffolding shrinks over time.
        </Callout>
      </Section>
    </Slide>
  );
}
