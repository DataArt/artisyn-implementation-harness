import { useState } from 'react';
import { Slide, Callout } from '../../components/primitives';
import { InsideLoopMap, type HubFeedback, type HubNode } from '../../charts/InsideLoopMap';
import { Modal } from '../../components/Modal';
import { EngineeringLoop } from '../../components/EngineeringLoop';
import { useNavigation } from './InsideTheLoopNav';

// Left-to-right dependency graph — InsideLoopMap computes the actual
// positions from dependsOn, so this is just the graph structure, not
// coordinates. Ported verbatim from the source deck's Inside The Loop slide.
// Each id has a matching route under /inside-the-loop/{id} (see
// InsideTheLoopRoutes.tsx) — the real detail slide goToId used to jump to
// in the source 10-slide deck.
const nodes: HubNode[] = [
  { id: 'requirements', label: 'Mental Model Shift', sub: 'planning ↔ code' },
  {
    id: 'context',
    label: 'Context',
    sub: 'the asset, not the prompt',
    dependsOn: ['requirements'],
  },
  { id: 'harness', label: 'Harness', sub: 'a system, not an assistant', dependsOn: ['context'] },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    sub: 'the harness, pointed at IaC',
    dependsOn: ['harness'],
  },
  {
    id: 'tools',
    label: 'Tools',
    sub: 'grew out of the project itself',
    dependsOn: ['requirements'],
  },
  { id: 'retro', label: 'Retro', sub: 'what surprised us', dependsOn: ['tools'] },
  {
    id: 'onboarding',
    label: 'Onboarding',
    sub: 'a new hire every session',
    dependsOn: ['context'],
  },
  {
    id: 'code-review',
    label: 'Code Review',
    sub: 'knowledge transfer now',
    dependsOn: ['harness'],
  },
  {
    id: 'quality',
    label: 'Code Quality',
    sub: 'the criterion changed',
    dependsOn: ['code-review'],
  },
  {
    id: 'improvement',
    label: 'Improvement',
    sub: 'reflect → triage → skill',
    dependsOn: ['code-review', 'retro'],
  },
];

const feedback: HubFeedback[] = [
  { from: 'improvement', to: 'harness', label: 'a promoted skill changes the agent' },
];

export default function InsideTheLoopHub() {
  const { goToId, visited } = useNavigation();
  const [showAnalogy, setShowAnalogy] = useState(false);
  return (
    <Slide
      title="Inside The Loop: a map that keeps opening"
      lead="Ten real dependencies, not a checklist — each one opened the door to the next. Click into whichever one you want to open first."
    >
      <InsideLoopMap nodes={nodes} feedback={feedback} onSelect={goToId} visitedIds={visited} />
      <Callout>
        The more you explore, the more opportunities and new doors appear —{' '}
        <b>the mental shift is the key to the first door</b>. Every step since has opened onto the
        next one, the same way a new room only shows up once you've walked into the one before it —
        see the{' '}
        <button type="button" className="inline-link" onClick={() => setShowAnalogy(true)}>
          exploration map
        </button>{' '}
        for the full picture.
        <div style={{ height: 16 }} />
        And this map isn't finished. There's still plenty of room for improvement, and a roadmap of
        ideas waiting for their turn to be explored.
      </Callout>
      <EngineeringLoop />
      {showAnalogy && (
        <Modal onClose={() => setShowAnalogy(false)}>
          <img
            src={`${import.meta.env.BASE_URL}images/exploration-map.png`}
            alt="A game-map exploration analogy: the unknown, explore, new doors, a bigger world, exploration creates opportunity"
          />
          <p className="modal__caption">
            <b>The more you open, the more new doors to enter appear.</b> The mental shift is the
            key to the first door.
          </p>
        </Modal>
      )}
    </Slide>
  );
}
