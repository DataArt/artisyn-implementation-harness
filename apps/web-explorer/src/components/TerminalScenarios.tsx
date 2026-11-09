import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  User,
} from 'lucide-react';
import { scenarios, type ScenarioId, type ScenarioLine } from '../data/scenarios';

const LINE_DELAY_MS = 550;
const HITL_PAUSE_MS = 1600;
const STAGE_GAP_MS = 900;
const SCENARIO_IDS: ScenarioId[] = ['bootstrap', 'design', 'dev'];

/** Waiting on a human reads slower than the agent's own output — that pause is the point. */
function delayFor(line: ScenarioLine, prevLine: ScenarioLine | undefined): number {
  if (prevLine?.kind === 'wait' && line.kind === 'input') return HITL_PAUSE_MS;
  return LINE_DELAY_MS;
}

export default function TerminalScenarios() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('design');
  const [stageIndex, setStageIndex] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [playing, setPlaying] = useState(true);
  const sideRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Cap the terminal to the side panel's actual height — never taller than it,
  // scroll internally instead. Pure CSS can't match a sibling's intrinsic
  // height while also staying scrollable, so this measures it directly.
  useLayoutEffect(() => {
    const side = sideRef.current;
    const terminal = terminalRef.current;
    if (!side || !terminal) return;
    const sync = () => {
      if (window.matchMedia('(max-width: 700px)').matches) {
        terminal.style.maxHeight = '';
        return;
      }
      terminal.style.maxHeight = `${side.offsetHeight}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(side);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  const scenario = scenarios[scenarioId];
  const stages = scenario.stages;
  const isLastStage = stageIndex === stages.length - 1;
  const current = stages[stageIndex];
  const stageDone = lineCount >= current.lines.length;
  const isLast = isLastStage && stageDone;
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const selectScenario = (next: ScenarioId) => {
    setScenarioId(next);
    setStageIndex(0);
    setLineCount(0);
    setPlaying(true);
  };

  // Reveal the active stage's lines one at a time; a wait→input pair gets a longer pause.
  useEffect(() => {
    if (!playing || stageDone) return;
    if (reducedMotion) {
      setLineCount(current.lines.length);
      return;
    }
    const delay = delayFor(current.lines[lineCount], current.lines[lineCount - 1]);
    const id = setTimeout(() => setLineCount((n) => Math.min(n + 1, current.lines.length)), delay);
    return () => clearTimeout(id);
  }, [playing, stageDone, lineCount, current, reducedMotion]);

  // Once a stage is fully revealed, auto-advance to the next one.
  useEffect(() => {
    if (!playing || !stageDone || isLastStage) return;
    const id = setTimeout(() => {
      setStageIndex((i) => Math.min(i + 1, stages.length - 1));
      setLineCount(0);
    }, STAGE_GAP_MS);
    return () => clearTimeout(id);
  }, [playing, stageDone, isLastStage, stages.length]);

  const goTo = (i: number) => {
    setStageIndex(i);
    setLineCount(stages[i].lines.length);
    setPlaying(false);
  };

  const next = () => {
    if (isLast) {
      setStageIndex(0);
      setLineCount(0);
      setPlaying(true);
    } else if (!stageDone) {
      setLineCount(current.lines.length);
      setPlaying(false);
    } else {
      const i = Math.min(stageIndex + 1, stages.length - 1);
      setStageIndex(i);
      setLineCount(stages[i].lines.length);
      setPlaying(false);
    }
  };

  const waitingOnHuman =
    !stageDone &&
    current.lines[lineCount - 1]?.kind === 'wait' &&
    current.lines[lineCount]?.kind === 'input';

  const visibleStages = stages.slice(0, stageIndex + 1);

  return (
    <div className="demo-frame" aria-label="Interactive simulated lifecycle example">
      <div className="demo-topline">
        <div className="demo-traffic" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="mono text-soft">artisyn / {scenario.label}</span>
        <span className="demo-mode-tag">SIMULATED RUN</span>
      </div>
      <div className="demo-body scenario-body">
        <div className="scenario-terminal-pane">
          <div
            ref={terminalRef}
            className="demo-terminal mono scenario-terminal"
            aria-live="polite"
          >
            <div>
              <span className="term-prompt">$</span> {scenario.command}
            </div>
            {visibleStages.map((stage, si) => {
              const isActiveStage = si === stageIndex;
              const shownLines = isActiveStage ? stage.lines.slice(0, lineCount) : stage.lines;
              return (
                <div
                  key={stage.title}
                  className={'scenario-stage-block' + (si === 0 ? ' is-first' : '')}
                >
                  <div className="terminal-entry terminal-stage-marker">▸ {stage.title}</div>
                  {shownLines.map((line, li) => (
                    <div
                      key={li}
                      className={
                        'terminal-entry terminal-line-in ' +
                        (line.kind === 'wait'
                          ? 'terminal-wait'
                          : line.kind === 'input'
                            ? 'terminal-input'
                            : '')
                      }
                    >
                      {line.kind === 'output' ? (
                        <span className="terminal-check">✓</span>
                      ) : line.kind === 'input' ? (
                        <User size={12} className="terminal-user-icon" aria-hidden="true" />
                      ) : (
                        <span className="terminal-chevron">›</span>
                      )}{' '}
                      {line.text.replace(/^✓\s*/, '')}
                    </div>
                  ))}
                  {isActiveStage && waitingOnHuman && (
                    <div
                      className="terminal-entry terminal-typing"
                      aria-label="Waiting for human input"
                    >
                      <span className="terminal-typing-dots">
                        <span />
                        <span />
                        <span />
                      </span>{' '}
                      a human is responding
                    </div>
                  )}
                </div>
              );
            })}
            {!isLast && <span className="terminal-cursor" aria-hidden="true" />}
          </div>
        </div>
        <div ref={sideRef} className="demo-side scenario-side">
          <div className="eyebrow">SELECT FLOW</div>
          <div className="mode-control" role="group" aria-label="Choose scenario">
            {SCENARIO_IDS.map((value) => (
              <button
                key={value}
                type="button"
                className={'mode-btn ' + (scenarioId === value ? 'is-active' : '')}
                onClick={() => selectScenario(value)}
                aria-pressed={scenarioId === value}
              >
                /{value}
              </button>
            ))}
          </div>
          <div className="step-list" aria-label="Scenario stages">
            {stages.map((stage, i) => (
              <button
                type="button"
                key={stage.title}
                className={'step-row ' + (i === stageIndex ? 'selected' : '')}
                aria-current={i === stageIndex ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                <span
                  className={
                    'step-bullet ' + (i < stageIndex ? 'done' : i === stageIndex ? 'current' : '')
                  }
                >
                  {i < stageIndex ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </span>
                <span>{stage.title}</span>
              </button>
            ))}
          </div>
          <div className="scenario-explain">
            <span className="mono text-soft">
              STAGE {String(stageIndex + 1).padStart(2, '0')} /{' '}
              {String(stages.length).padStart(2, '0')}
            </span>
            <p>{current.explanation}</p>
            {scenario.storyUrl && (
              <a
                className="icon-link scenario-story-link"
                href={scenario.storyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {scenario.storyLabel} <ArrowUpRight size={13} />
              </a>
            )}
          </div>
          <div className="demo-actions">
            <div className="scenario-transport">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => goTo(Math.max(0, stageIndex - 1))}
                disabled={stageIndex === 0}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
            <button type="button" className="button button-primary" onClick={next}>
              {isLast ? (
                <>
                  <RotateCcw size={16} /> Replay
                </>
              ) : (
                <>
                  Next <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
