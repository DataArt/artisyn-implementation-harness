'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { ArrowRight, BookOpen, Braces, CircleCheck, Code2, FileText } from 'lucide-react';

/**
 * First-viewport terminal card. Same chrome as the TerminalScenarios widget
 * further down the page (traffic dots, `artisyn / <flow>` label, SIMULATED
 * tag), but deliberately simplified: three short flows — launch, design,
 * dev — each a handful of lines, revealed one at a time and looping forever.
 * The lifecycle strip under the transcript lights up the stages the current
 * flow touches, so the card reads as "one command, then the lifecycle".
 *
 * No controls on purpose: this is the hero, not the walkthrough. The full
 * interactive version with real phase names lives in TerminalScenarios.
 */

type Stage = 'design' | 'implement' | 'validate' | 'document';

type PreviewLine = { kind: 'done' | 'next'; text: string };

type Flow = {
  id: 'launch' | 'design' | 'dev';
  label: string;
  command: string;
  lines: PreviewLine[];
  stages: Stage[];
  footer: string;
};

const FLOWS: Flow[] = [
  {
    id: 'launch',
    label: 'bootstrap',
    command: '/implementation-harness launch',
    lines: [
      { kind: 'done', text: 'Scan repo, detect stack' },
      { kind: 'done', text: 'Generate skills, agents, docs scaffold' },
      { kind: 'done', text: 'Verify, hand off clean' },
      { kind: 'next', text: 'Ready for /design or /dev' },
    ],
    stages: [],
    footer: 'One command · Full harness installed',
  },
  {
    id: 'design',
    label: 'design',
    command: '/design TKT-123 add audit log',
    lines: [
      { kind: 'done', text: 'Frame the problem, research options' },
      { kind: 'done', text: 'Solution written, architecture-checked' },
      { kind: 'done', text: 'Review gate approved' },
      { kind: 'next', text: 'Published to HLD — ready for /dev' },
    ],
    stages: ['design'],
    footer: 'Design lifecycle · Frame to Publish',
  },
  {
    id: 'dev',
    label: 'dev',
    command: '/dev TKT-123',
    lines: [
      { kind: 'done', text: 'Plan approved, branch checked out' },
      { kind: 'done', text: 'Implemented, tests green' },
      { kind: 'done', text: 'Docs aligned with the diff' },
      { kind: 'next', text: 'Ready for review and merge' },
    ],
    stages: ['implement', 'validate', 'document'],
    footer: 'Dev lifecycle · Plan to Document',
  },
];

const STAGES: { id: Stage; icon: ReactNode; label: string; tone: string }[] = [
  { id: 'design', icon: <FileText size={20} />, label: 'Design', tone: 'violet' },
  { id: 'implement', icon: <Code2 size={20} />, label: 'Implement', tone: 'blue' },
  { id: 'validate', icon: <CircleCheck size={20} />, label: 'Validate', tone: 'teal' },
  { id: 'document', icon: <BookOpen size={20} />, label: 'Document', tone: 'green' },
];

const LINE_DELAY_MS = 800;
const COMMAND_DELAY_MS = 1000;
const FLOW_HOLD_MS = 5000;

export default function HeroPreview() {
  const [flowIndex, setFlowIndex] = useState(0);
  // 0 = command only; n = command + n lines revealed.
  const [shown, setShown] = useState(0);
  const flow = FLOWS[flowIndex];
  const done = shown >= flow.lines.length;
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setShown(flow.lines.length);
      return;
    }
    const delay = done ? FLOW_HOLD_MS : shown === 0 ? COMMAND_DELAY_MS : LINE_DELAY_MS;
    const id = setTimeout(() => {
      if (done) {
        setFlowIndex((i) => (i + 1) % FLOWS.length);
        setShown(0);
      } else {
        setShown((n) => n + 1);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [shown, done, flow, reducedMotion]);

  const visible = flow.lines.slice(0, shown);
  const flowsTouched = flow.stages.length > 0;

  return (
    <div className="hero-preview" aria-label="Simulated harness run">
      <div className="demo-topline">
        <div className="demo-traffic" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="mono text-soft">implementation-harness / {flow.label}</span>
        <span className="demo-mode-tag">SIMULATED RUN</span>
      </div>
      <div className="code-rows mono" aria-live="polite">
        <p key={`${flow.id}-cmd`} className="terminal-line-in">
          <span className="term-prompt">$</span> {flow.command}
        </p>
        {visible.map((line, i) => (
          <p
            key={`${flow.id}-${i}`}
            className={'terminal-line-in' + (line.kind === 'next' ? ' code-highlight' : '')}
          >
            {line.kind === 'done' ? (
              <span className="terminal-check">✓</span>
            ) : (
              <span className="terminal-chevron">›</span>
            )}
            {line.text}
            {line.kind === 'next' && (
              <>
                {' '}
                <span className="cursor" />
              </>
            )}
          </p>
        ))}
        {!done && <span className="terminal-cursor" aria-hidden="true" />}
      </div>
      <ol
        className={'lifecycle-strip' + (flowsTouched ? ' has-active' : '')}
        aria-label="Lifecycle: Design, then Implement, then Validate, then Document"
      >
        {STAGES.map((stage, i) => (
          <li
            key={stage.id}
            className={
              `lc-stage lc-stage-${stage.tone}` +
              (flow.stages.includes(stage.id) ? ' is-active' : '')
            }
          >
            <span className="lc-stage-tile">
              <span className="lc-stage-icon">{stage.icon}</span>
              <span className="lc-stage-label">{stage.label}</span>
            </span>
            {i < STAGES.length - 1 && (
              <ArrowRight className="lc-stage-arrow" size={18} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      <div className="code-foot">
        <Braces size={15} /> {flow.footer} <span>SIMULATED</span>
      </div>
    </div>
  );
}
