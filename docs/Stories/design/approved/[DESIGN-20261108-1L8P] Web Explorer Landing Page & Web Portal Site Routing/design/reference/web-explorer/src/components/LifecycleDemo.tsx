import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, ChevronLeft, Play, RotateCcw } from 'lucide-react';
import { demoSteps, type LifecycleMode } from '../data/lifecycles';

export default function LifecycleDemo() {
  const [mode, setMode] = useState<LifecycleMode>('design');
  const [index, setIndex] = useState(0);
  const steps = demoSteps[mode];
  const current = steps[index];
  const selectMode = (next: LifecycleMode) => {
    setMode(next);
    setIndex(0);
  };
  const isLast = index === steps.length - 1;

  return (
    <div className="demo-frame" aria-label="Interactive simulated lifecycle example">
      <div className="demo-topline">
        <div className="demo-traffic" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="mono text-soft">artisyn / interactive lifecycle</span>
        <span className="demo-mode-tag">SIMULATED RUN</span>
      </div>
      <div className="demo-body">
        <div className="demo-side">
          <div className="eyebrow">SELECT LIFECYCLE</div>
          <div className="mode-control" role="group" aria-label="Choose lifecycle">
            {(['design', 'dev'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={'mode-btn ' + (mode === value ? 'is-active' : '')}
                onClick={() => selectMode(value)}
                aria-pressed={mode === value}
              >
                /{value}
              </button>
            ))}
          </div>
          <div className="step-list" aria-label="Lifecycle phases">
            {steps.map((step, i) => (
              <button
                type="button"
                key={step.title}
                className={'step-row ' + (i === index ? 'selected' : '')}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => setIndex(i)}
              >
                <span
                  className={'step-bullet ' + (i < index ? 'done' : i === index ? 'current' : '')}
                >
                  {i < index ? <Check size={12} strokeWidth={3} /> : String(i + 1).padStart(2, '0')}
                </span>
                <span>{step.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="demo-main" aria-live="polite">
          <div className="demo-head">
            <span className="mono text-soft">
              STEP {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
            <span className="status-pill">
              <span className="status-dot" /> Preview
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="demo-detail"
            >
              <div className="step-icon">
                <Play size={22} fill="currentColor" />
              </div>
              <h3>{current.title}</h3>
              <p>{current.description}</p>
              <div className="demo-terminal mono">
                <div>
                  <span className="term-prompt">$</span> /{mode} TKT-123
                </div>
                <div className="terminal-entry">
                  <span className="terminal-chevron">›</span> {current.activity}
                </div>
                <div className="terminal-entry">
                  <span className="terminal-check">✓</span> Output: {current.artifact}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="demo-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setIndex(isLast ? 0 : index + 1)}
            >
              {isLast ? (
                <>
                  <RotateCcw size={16} /> Replay
                </>
              ) : (
                <>
                  Next step <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
