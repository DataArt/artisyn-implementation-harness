import { Slide, Section, Figure, BigQuote } from '../../components/primitives';
import { RetroFeedback } from '../../charts/RetroFeedback';

export function Retro() {
  return (
    <Slide
      title="What's worth doing regularly: collecting feedback at retro"
      lead="One practice you can take wholesale. Not about tools — about regularly checking where the team is headed and what state it's in."
    >
      <Section collapsible defaultOpen>
        <BigQuote
          attr="said at the end of a quarter, not at a retro"
          note={
            <p>
              A retro collects what to fix in the process by default. What the change feels like to
              the people living in it is a second, separate output — and it only exists if somebody
              asks the question on purpose.
            </p>
          }
        >
          "Nobody ever asked whether any of this actually works for us."
        </BigQuote>
      </Section>

      <Section title="How it's set up" collapsible defaultOpen>
        <Figure
          title="Retro produces two different outputs"
          sub="the second output only appears if feedback is collected explicitly"
        >
          <RetroFeedback />
        </Figure>
      </Section>
    </Slide>
  );
}
