import { Section, Figure, Callout, Cols, Panel, KeyPoints } from './primitives';
import { OnboardingChannels } from '../charts/OnboardingChannels';
import { XrayAnatomy } from '../charts/XrayAnatomy';
import { SkillLifecycle } from '../charts/SkillLifecycle';
import { useNavigation } from '../pages/inside-the-loop/InsideTheLoopNav';

const pillars = [
  {
    number: '1',
    title: 'Context engineering',
    subtitle: 'Capture what the agent needs',
    points: [
      [
        'Curate for relevance',
        'Use clear instructions and representative examples. Keep context focused on the task.',
      ],
      [
        'Load details when needed',
        'Keep repo docs discoverable. Retrieve relevant files through a small set of well-defined tools.',
      ],
      [
        'Preserve working knowledge',
        'Save decisions and progress. Compact history and isolate focused sub-tasks.',
      ],
    ],
    links: [{ id: 'context', label: 'Context in practice' }],
  },
  {
    number: '2',
    title: 'Team adoption',
    subtitle: 'Build inside the loop',
    points: [
      [
        'Own the problem and outcome',
        'Engineers frame the customer need, shape the plan and judge trade-offs.',
      ],
      [
        'Make the harness a team practice',
        'Shared workflows connect tools and checks. Grow tooling from recurring friction.',
      ],
      [
        'Onboard people and every session',
        'Repo docs and skills explain how work happens. People and agents start with shared context.',
      ],
    ],
    links: [
      { id: 'harness', label: 'Harness' },
      { id: 'onboarding', label: 'Onboarding' },
    ],
  },
  {
    number: '3',
    title: 'Verify and learn',
    subtitle: 'Make PR review knowledge transfer',
    points: [
      [
        'Check the implementation',
        'Agent review and tests surface issues against requirements and architecture.',
      ],
      [
        'Discuss the reasoning',
        'Humans decide which findings matter and explain the choices to each other.',
      ],
      [
        'Feed learning back into the repo',
        'Capture decisions in the story report. Promote recurring lessons into docs, skills and checks.',
      ],
    ],
    links: [
      { id: 'code-review', label: 'PR review' },
      { id: 'improvement', label: 'Learning loop' },
    ],
  },
];

export function EngineeringLoop() {
  const { goToId } = useNavigation();

  return (
    <>
      <Section title="The team’s engineering loop">
        <p className="slide__lead">
          Shared context, guided execution and review that improves the next task.
        </p>
      </Section>
      <div className="engineering-loop">
        <div className="engineering-loop__pillars">
          {pillars.map((pillar) => (
            <section
              className="engineering-loop__pillar"
              key={pillar.number}
              aria-labelledby={`pillar-${pillar.number}`}
            >
              <span className="engineering-loop__number">/ {pillar.number}</span>
              <h2 id={`pillar-${pillar.number}`}>{pillar.title}</h2>
              <p className="engineering-loop__subtitle">{pillar.subtitle}</p>
              <dl className="engineering-loop__points">
                {pillar.points.map(([title, body]) => (
                  <div key={title}>
                    <dt>{title}</dt>
                    <dd>{body}</dd>
                  </div>
                ))}
              </dl>
              <div className="engineering-loop__links" aria-label={`${pillar.title} detail slides`}>
                {pillar.links.map((link) => (
                  <button
                    type="button"
                    className="inline-link"
                    key={link.id}
                    onClick={() => goToId(link.id)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="engineering-loop__feedback">
          <span className="engineering-loop__return" aria-hidden="true">
            ↶
          </span>
          <p>
            <strong>Each review improves the next task.</strong> Decisions and lessons return to the
            shared context and harness.
          </p>
        </div>
        <p className="engineering-loop__direction">
          <strong>Adoption direction: the forward deployed engineer.</strong> Stay close to the
          customer, translate domain needs into working software and own delivery.
        </p>
      </div>

      <Section
        title="1 / Context engineering: the repository becomes working knowledge"
        collapsible
        defaultOpen
      >
        <p>
          An agent needs the intent behind the code: what the customer is trying to achieve, which
          decisions the team has already made, and how to tell whether a change is right. Context
          engineering is the ongoing work of selecting that information for each step.
        </p>
        <Callout>
          The key principle is to <b>define an authoritative source for each type of context</b>,
          govern its lifecycle, and connect everything into one navigable context topology.
        </Callout>
        <Figure
          title="One repository, different levels of detail"
          sub="Keep a small map available, then open the material that the task actually needs."
        >
          <div className="engineering-loop__context">
            <div>
              <span>Always available</span>
              <h3>The project map</h3>
              <p>Purpose, boundaries, rule index and links to the relevant documentation.</p>
              <code>Root instructions + task intent</code>
            </div>
            <div>
              <span>Retrieved for the task</span>
              <h3>The working context</h3>
              <p>
                Acceptance criteria, architecture, affected code and the skills for this type of
                change.
              </p>
              <code>Story + docs + scoped skills</code>
            </div>
            <div>
              <span>Saved for the next task</span>
              <h3>The durable record</h3>
              <p>
                Decisions, verified results and unresolved questions that should survive a fresh
                session.
              </p>
              <code>Report + decisions + updated docs</code>
            </div>
          </div>
        </Figure>
        <KeyPoints
          items={[
            {
              title: 'Treat attention as a finite resource',
              body: 'More material can obscure what matters. Keep the smallest sufficient context for the task, and remove stale or redundant information.',
            },
            {
              title: 'Write clear guidance at the right level',
              body: 'State the intended behavior and constraints. Use representative examples instead of trying to enumerate every possible edge case.',
            },
            {
              title: 'Retrieve context just in time',
              body: 'Use paths and links as an index. Load relevant files as the work unfolds, with a small, clearly defined set of tools.',
            },
            {
              title: 'Preserve continuity on longer tasks',
              body: 'Compact the conversation while retaining decisions and open work. Persist structured notes; use focused sub-agents when separate investigations benefit from isolated context.',
            },
          ]}
        />
        <Callout>
          <b>What this means for the team:</b> update requirements, architecture notes and skills
          alongside the code. The repository becomes a shared source for both the next colleague and
          the next agent session.
        </Callout>
        <p className="engineering-loop__source">
          Principles adapted from Anthropic’s{' '}
          <a
            href="https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"
            target="_blank"
            rel="noopener noreferrer"
          >
            Effective context engineering for AI agents
          </a>
          .
        </p>
      </Section>

      <Section
        title="2 / Team adoption: engineers direct the work and own the outcome"
        collapsible
        defaultOpen
      >
        <p>
          The mental shift changes where engineers spend their attention: understanding the
          customer’s problem, making the plan explicit and evaluating the result. The agent helps
          execute that plan. Product judgment and accountability stay with the team.
        </p>
        <Cols n={2}>
          <Panel title="The engineer’s responsibility">
            <p>
              Clarify the business need and acceptance criteria. Choose boundaries and trade-offs.
              Read the plan before implementation and validate the behavior with the customer.
            </p>
          </Panel>
          <Panel title="The agent’s contribution">
            <p>
              Retrieve project context, propose an approach, implement scoped changes and run
              checks. Document the result and surface evidence for the engineer’s decision.
            </p>
          </Panel>
        </Cols>
        <Figure
          title="The harness makes the working agreement repeatable"
          sub="A harness connects context, workflow, tools and checkpoints around the agent."
        >
          <ol className="engineering-loop__steps">
            <li>
              <strong>Plan</strong>
              <span>
                Read the intent and constraints. Agree the approach and evidence of success.
              </span>
            </li>
            <li>
              <strong>Implement</strong>
              <span>Work in bounded steps with the relevant skills and tool access.</span>
            </li>
            <li>
              <strong>Verify</strong>
              <span>Run checks and inspect actual behavior. Escalate uncertainty.</span>
            </li>
            <li>
              <strong>Document</strong>
              <span>Record decisions and results. Refresh the context for future work.</span>
            </li>
          </ol>
        </Figure>
        <KeyPoints
          items={[
            {
              title: 'Adopt a shared workflow through real work',
              body: 'Pair on an actual task, inspect the plan together and discuss what the checks prove. Turn the team’s conventions into written skills that others can reuse.',
            },
            {
              title: 'Grow tooling from recurring friction',
              body: 'When the same lookup, report or verification step keeps consuming attention, give it a repeatable tool or workflow. Keep tool purpose and access boundaries clear.',
            },
            {
              title: 'Onboard every person and every fresh session',
              body: 'Start with the same project map, conventions and active task. A new colleague can ask the agent to explain the system and inspect the underlying sources.',
            },
          ]}
        />
        <Figure
          title="Shared sources support both human and agent onboarding"
          sub="The existing project flow brings project knowledge into one working conversation."
        >
          <OnboardingChannels />
        </Figure>
        <Callout>
          <b>A path toward the forward deployed engineer:</b> stay close to the customer, translate
          domain needs into software, and carry feedback through to delivery. This is the proposed
          direction for adoption, supported by shared context and a harness; installing an AI tool
          alone does not establish that role.
        </Callout>
      </Section>

      <Section
        title="3 / Verify and learn: PR review becomes knowledge transfer"
        collapsible
        defaultOpen
      >
        <p>
          Review still needs to establish whether the change is right. Agent checks help surface
          issues before the human discussion, leaving more attention for why the solution works,
          which alternatives were considered and what another engineer needs to understand.
        </p>
        <Figure
          title="One review command, three complementary passes"
          sub="The project’s /x-ray workflow checks the diff from several angles. Select a pass for its explanation."
        >
          <XrayAnatomy />
        </Figure>
        <Cols n={2}>
          <Panel title="The agent flags findings">
            <p>
              Potential failure scenarios, violations of layer conventions and divergence from
              architecture. Each finding needs a location and an explanation that a person can
              assess.
            </p>
          </Panel>
          <Panel title="The human makes the decision">
            <p>
              Confirm the scenario and business impact. Decide whether to fix, defer or reject the
              finding, and record the reason. Discuss the trade-off with the author.
            </p>
          </Panel>
        </Cols>
        <Callout>
          <b>The quality criterion includes understanding:</b> can another engineer explain what
          changed, why the team chose it and what evidence supports it? Passing checks is useful
          evidence, but forwarding a report between agents does not transfer knowledge.
        </Callout>
        <Figure
          title="Review findings become part of the next task’s context"
          sub="Record the lesson, triage its relevance and update an existing rule or validate a new skill."
        >
          <SkillLifecycle />
        </Figure>
        <p>
          The story report preserves the decision. Reflection captures the recurring problem. Triage
          separates a one-off situation from a reusable lesson. A reviewed change to documentation,
          a skill or a check then becomes available to the whole team.
        </p>
      </Section>

      <Section title="A task through the complete loop" collapsible defaultOpen>
        <Figure
          title="Illustrative example: adding a customer data export"
          sub="One change shows how context, adoption and review reinforce each other."
        >
          <ol className="engineering-loop__steps">
            <li>
              <strong>Capture the intent</strong>
              <span>
                Agree who may export, which fields are allowed and what acceptance looks like. Load
                the relevant data and access rules.
              </span>
            </li>
            <li>
              <strong>Direct execution</strong>
              <span>
                The engineer approves the approach. The agent implements the export and checks using
                the team’s workflow.
              </span>
            </li>
            <li>
              <strong>Review the decision</strong>
              <span>
                A review identifies a missing access scenario. Engineers assess its impact, add the
                check and explain the boundary.
              </span>
            </li>
            <li>
              <strong>Improve the next task</strong>
              <span>
                Record the lesson and update the export checklist. The next export starts with that
                requirement already discoverable.
              </span>
            </li>
          </ol>
        </Figure>
        <Callout tone="good">
          <b>The loop closes when learning changes how the next task starts.</b> The team keeps the
          knowledge in the repository, makes it reachable through the harness and verifies whether
          it helps on subsequent work.
        </Callout>
      </Section>

      <Section title="Project sources and further detail" collapsible>
        <p>
          This section synthesizes the project’s Inside the Loop material on context, the harness,
          onboarding, code review and continuous improvement. Use the links in the overview to
          explore those original pages. The export scenario is illustrative, and the forward
          deployed engineer framing is a proposed adoption direction.
        </p>
      </Section>
    </>
  );
}
