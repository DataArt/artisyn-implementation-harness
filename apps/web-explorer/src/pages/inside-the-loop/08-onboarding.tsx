import { Slide, Section, BigQuote } from '../../components/primitives';
import { OnboardingCompare } from '../../charts/OnboardingCompare';
import { OnboardingChannels } from '../../charts/OnboardingChannels';

export function Onboarding() {
  return (
    <Slide
      title="Onboarding: one source now, not many"
      lead="Standard onboarding used to mean a call with a colleague and a README read start to finish. In the agent flow, both of those turn into a call to the agent."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="onboarding, the way it used to work"
          note={
            <p>
              Two seniors carrying the conventions in their heads, handing them over by mouth, one
              new hire at a time, for a couple of months each — and repeating the whole thing for
              the next person. Those same conventions now sit in the repository, in skills — a new
              person reads them straight from there instead of waiting for someone to explain it by
              hand.
            </p>
          }
        >
          "Don't worry — in a couple of months you'll know how we do things here."
        </BigQuote>
      </Section>

      <Section collapsible defaultOpen>
        <p>
          In traditional setups, code conventions live as tacit knowledge shared among a few senior
          engineers, requiring endless manual corrections on PRs for each new hire.
        </p>
        <p>
          With the harness, what seniors establish is preserved directly into repo skills — so new
          team members instantly adhere to the same conventions, without anyone having to teach them
          by hand.
        </p>
      </Section>

      <Section title="Where conventions live, before and after" collapsible defaultOpen>
        <OnboardingCompare />
      </Section>

      <Section title="One channel, not three" collapsible defaultOpen>
        <OnboardingChannels />
      </Section>
    </Slide>
  );
}
