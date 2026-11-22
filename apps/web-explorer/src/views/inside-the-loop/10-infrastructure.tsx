import {
  Slide,
  Section,
  Callout,
  Quote,
  Figure,
  Tiles,
  BigQuote,
} from '../../components/primitives';
import { TechGrid, stack } from '../../components/TechGrid';
import { InfraFlow } from '../../charts/InfraFlow';

export function Infrastructure() {
  return (
    <Slide
      title="Infrastructure: the same harness, pointed at IaC"
      lead="Everything so far has been about product code, which makes it easy to file away as a developer story. It wasn't only one: the infrastructure of this project went through the same harness — the same planning, the same review, the same documentation step. That is one data point, from one project, and it is the only one we have."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="the objection we got, more than once"
          note={
            <p>
              And the answer is <b>no</b>. The harness is applicable anywhere the work is software
              development, whatever the team's traditions, ceremonies, or stack. Infrastructure is
              code — it follows the same rules and conventions, serves the same workload as
              application code, and is part of the software being built, not a separate discipline
              with its own exemption. Infrastructure is simply the case we can show you.
            </p>
          }
        >
          "Your harness doesn't apply to us — different tools, different ceremonies, a completely
          different flow."
        </BigQuote>
      </Section>

      <Section title="What it was actually pointed at" collapsible defaultOpen>
        <TechGrid items={stack.platform} />
        <div style={{ height: 14 }} />
        <Tiles
          items={[
            { value: '1.9', unit: 'k', label: 'Lines of IaC', note: 'the whole platform, as code' },
            { value: '0', label: 'Clicks in a cloud console', note: 'nothing provisioned by hand' },
            { value: '2', label: 'Commands a human runs', note: 'plan and apply' },
          ]}
        />
      </Section>

      <Section title="Why it transfers" collapsible defaultOpen>
        <Figure
          title="The infrastructure cycle next to the product one"
          sub="four of the five steps are the same step — the fifth is where accountability sits"
        >
          <InfraFlow />
        </Figure>
        <div style={{ height: 14 }} />
        <Callout tone="good">
          Infrastructure as code is the easy case, not the hard one.{' '}
          <b>It is code — so everything already said applies to it unchanged</b>: conventions live
          in a skill, the plan is written before the change, the diff goes through review, the
          documentation is updated in the same ticket. A <code>plan</code> step — Terraform's or
          CDK's — is simply the most literal version of a step the harness makes every cycle do
          anyway: show what you intend to change before changing it.
        </Callout>
      </Section>

      <Section title="What this does to the objection" collapsible defaultOpen>
        <Quote attr="how it was put to us">
          That works for application code. Infrastructure is different — we're not sitting there
          writing features, we're doing something else entirely.
        </Quote>
        <div style={{ height: 16 }} />
        <Callout>
          What we can say is what we found here, and no more than that.{' '}
          <b>Nothing in the harness turned out to be specific to TypeScript</b> — what it needed was
          that the steps had names, the conventions were written down, and done meant something
          other than one person's judgment. The IaC tool already had all three, so nothing had to be
          adapted. Whether that is also true of your work is a question we can't answer for you —
          but it is a cheaper question to test than it sounds, and writing the flow down is worth
          doing either way.
        </Callout>
      </Section>
    </Slide>
  );
}
