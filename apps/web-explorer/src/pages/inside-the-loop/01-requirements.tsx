import { useState } from 'react';
import { Slide, Section, Callout, Figure, Legend, BigQuote } from '../../components/primitives';
import { SplitFlip } from '../../charts/SplitFlip';
import { BaDesktopFlow } from '../../charts/BaDesktopFlow';
import { Modal } from '../../components/Modal';
import { series } from '../../theme';

export function Requirements() {
  const [showShift, setShowShift] = useState(false);
  return (
    <Slide
      title="Mental Model Shift: it used to be 10% planning and 90% code"
      lead="The main shift in an engineer's work isn't that code gets written faster — it's that the center of gravity moved from implementation to planning. And that shift is felt by everyone the ticket passes through, not only by developers."
    >
      <Section>
        <BigQuote
          attr="said on this project, and on two others"
          note={
            <>
              <p>
                It is the sound of the{' '}
                <button type="button" className="inline-link" onClick={() => setShowShift(true)}>
                  process
                </button>{' '}
                flipping over. Implementation used to come before planning; now planning comes
                before implementation — so the visible part of the work looks like overhead to
                anyone measuring the old half.
              </p>
            </>
          }
        >
          "I'd have done this in 15 minutes"
        </BigQuote>
      </Section>

      <Section title="How the engineer's time got reallocated" collapsible defaultOpen>
        <Figure
          title="Where the workday goes"
          sub="the ratio is approximate — it's the team's sense of it, not a tracker measurement"
        >
          <SplitFlip />
          <Legend
            items={[
              {
                color: series[0],
                label: 'Planning: requirements, acceptance criteria, solution plan, review',
              },
              { color: series[1], label: 'Implementation' },
            ]}
          />
        </Figure>
        <div style={{ height: 14 }} />
        <Callout>
          The "Now" bar is shorter than "Before," not just re-split —{' '}
          <b>the build itself takes less time</b>, so even at 90% planning the whole ticket lands
          sooner.{' '}
          <a
            href="https://claude.com/blog/the-ai-native-sdlc-playbook"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anthropic's own SDLC playbook
          </a>{' '}
          makes the same argument from the outside: once the model writes code fast,{' '}
          <b>"code is no longer the bottleneck"</b> — it moves to the steps on either side of it,
          "mainly plan, review/test, and deploy, which still run at human speed."
        </Callout>
        <div style={{ height: 10 }} />
        <Callout tone="warn">
          It shows up in other words too — <i>"I know the code better than any doc,"</i>{' '}
          <i>"it's faster to just write it than to sit chatting with the model,"</i>{' '}
          <i>"there's too much documentation to keep up with."</i> Different sentences, same
          objection: the harness's cost is paid up front and in full view, and its payoff shows up
          later, quietly, as fewer surprises.
        </Callout>
        <div style={{ height: 10 }} />
        <Callout tone="warn">
          The flip has a price, and it is the same one every time:{' '}
          <b>a badly written plan produces a badly built implementation</b>. The plan is no longer a
          document that gets recounted at a meeting — it gets executed. A sloppy process used to
          cost one meeting; now it is reproduced in every task.
        </Callout>
      </Section>

      <Section title="Where the ticket comes from" collapsible>
        <h3 className="section-title-lg">
          Where the ticket comes from: context first, implementation second
        </h3>
        <p className="lead-sm">
          The same shape, one step earlier in the chain. If only development adopts this, the queue
          simply moves to whoever writes the tickets.
        </p>
        <div style={{ height: 14 }} />
        <Figure
          title="How a ticket is born in Claude Desktop"
          sub="discovery docs as project knowledge → BA skills → structured story with acceptance criteria"
        >
          <BaDesktopFlow />
        </Figure>
        <div style={{ height: 14 }} />
        <Callout>
          Two skills do the work: one drives the flow and splits epics into detailed stories, the
          other saturates those stories with the right context. The context itself is{' '}
          <b>not the repository's</b> — it is the documentation that accumulated during discovery,
          kept where the requirements are written.
        </Callout>
      </Section>
      {showShift && (
        <Modal onClose={() => setShowShift(false)}>
          <img
            src={`${import.meta.env.BASE_URL}images/ai-workflow-shift.png`}
            alt="Before/after: a person reviewing finished code next to an idle agent, versus a person directing HLD, conventions, docs, and a scoped ticket that an agent executes into code"
          />
          <p className="modal__caption">
            <b>Before:</b> a person reviews finished code, and the artifacts around it collect dust.{' '}
            <b>After:</b> a person directs the artifacts, and the agent executes them into code.
          </p>
        </Modal>
      )}
    </Slide>
  );
}
