'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { seriesDark } from '../../theme';
import { LIFECYCLES, type Lifecycle } from './data';
import { DataTable, Legend, minutes, pct } from './parts';

const total = (l: Lifecycle, key: 'work' | 'wait') => l.stages.reduce((sum, s) => sum + s[key], 0);
const allWait = LIFECYCLES.reduce((sum, l) => sum + total(l, 'wait'), 0);

/**
 * The two lifecycles as tabs. The tab panel is the time chart: each row is a stage, and the
 * selected row opens what that stage produced and who decided, right below it.
 */
export default function LifecycleExplorer() {
  const [active, setActive] = useState(0);
  const [stageByLifecycle, setStageByLifecycle] = useState<number[]>(LIFECYCLES.map(() => 0));
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const lifecycle = LIFECYCLES[active];
  const stageIndex = stageByLifecycle[active];
  const [work, wait] = seriesDark;
  const longest = Math.max(...lifecycle.stages.map((s) => s.work + s.wait), 1);

  const selectStage = (i: number) =>
    setStageByLifecycle((prev) => prev.map((value, l) => (l === active ? i : value)));

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + LIFECYCLES.length) % LIFECYCLES.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="mc-block" aria-labelledby="mc-lifecycle">
      <h2 id="mc-lifecycle">Two lifecycles, one record</h2>
      <p className="mc-lead">
        The design was settled and published to the architecture docs before any code was written.
        Delivery then followed it step by step, and every change of course was logged where the next
        person will look. Across both, {minutes(allWait)} belonged to the developer: reading,
        deciding and pushing. Pick a lifecycle, then a stage, to see what it produced and who
        decided.
      </p>
      <div className="mc-phases" role="tablist" aria-label="Lifecycles">
        {LIFECYCLES.map((l, i) => (
          <button
            key={l.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`mc-tab-${l.id}`}
            aria-selected={i === active}
            aria-controls={`mc-panel-${l.id}`}
            tabIndex={i === active ? 0 : -1}
            className={i === active ? 'mc-phase is-active' : 'mc-phase'}
            onClick={() => setActive(i)}
            onKeyDown={onTabKey}
          >
            <span className="mc-phase-title">
              {l.name} <code className="mono">{l.command}</code>
            </span>
            <span className="mc-stages">{l.stages.map((s) => s.name).join(' → ')}</span>
            <span className="mc-phase-summary">{l.summary}</span>
            <span className="mc-phase-time">
              {minutes(total(l, 'work'))} agent work · {minutes(total(l, 'wait'))} waiting
            </span>
          </button>
        ))}
      </div>

      <div
        className="mc-panel"
        role="tabpanel"
        id={`mc-panel-${lifecycle.id}`}
        aria-labelledby={`mc-tab-${lifecycle.id}`}
      >
        <figure className="mc-chart mc-chart-flat">
          <figcaption>
            {lifecycle.name}: tracked minutes per stage, agent work (the value on the right) and
            time waiting on a person or CI
          </figcaption>
          <Legend
            items={[
              { label: 'Agent work', color: work },
              { label: 'Waiting on the developer or CI', color: wait },
            ]}
          />
          <ul className="mc-rows" aria-label={`${lifecycle.name} stages`}>
            {lifecycle.stages.map((s, i) => {
              const open = i === stageIndex;
              const detailId = `mc-stage-${lifecycle.id}-${i}`;
              return (
                <li key={s.name}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={detailId}
                    className={open ? 'mc-row is-active' : 'mc-row'}
                    onClick={() => selectStage(i)}
                  >
                    <span className="mc-row-label">
                      <span className="mc-step-num">{i + 1}</span> {s.name}
                    </span>
                    <span className="mc-track" aria-hidden="true">
                      {s.work > 0 && (
                        <span
                          className="mc-seg"
                          style={{ width: pct(s.work, longest), background: work }}
                          title={`${minutes(s.work)} of agent work`}
                        />
                      )}
                      {s.wait > 0 && (
                        <span
                          className="mc-seg"
                          style={{ width: pct(s.wait, longest), background: wait }}
                          title={`${minutes(s.wait)} waiting`}
                        />
                      )}
                    </span>
                    <span className="mc-row-value">
                      {minutes(s.work)}
                      <span className="mc-sr-only"> agent work, {minutes(s.wait)} waiting</span>
                    </span>
                  </button>
                  {open && (
                    <div className="mc-stage" id={detailId}>
                      <h3>
                        {lifecycle.name}: {s.name}
                      </h3>
                      <p className="mc-stage-time">
                        {minutes(s.work)} agent work · {minutes(s.wait)} waiting on the developer
                      </p>
                      <ul>
                        {s.produced.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      <p className="mc-stage-decided">
                        <strong>Decided by:</strong> {s.decidedBy}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <DataTable
            caption={`${lifecycle.name}: tracked minutes per stage`}
            head={['Stage', 'Agent work', 'Waiting']}
            rows={lifecycle.stages.map((s) => [s.name, minutes(s.work), minutes(s.wait)])}
          />
        </figure>
      </div>
    </section>
  );
}
