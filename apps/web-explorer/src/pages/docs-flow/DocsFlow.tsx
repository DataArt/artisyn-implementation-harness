import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  FileText,
  Info,
  Layers3,
  Link2,
  ListChecks,
  RotateCcw,
  X,
} from 'lucide-react';
import Header from '../../components/Header';
import { ArtifactBlock, DividerNode, PillarLabelNode } from './ArtifactNode';
import {
  artifacts,
  baseEdges,
  baseNodes,
  dividers,
  pillars,
  sceneHeight,
  sceneWidth,
  scenarios,
  steps,
} from './flow';
import { docsUrl } from '../../env';
import './docsFlow.css';

/**
 * The scene (baseNodes/baseEdges in flow.ts, sourced from scene.json) is one
 * constant diagram; a scenario is a numeric range over the shared `steps`
 * timeline, and only renders the nodes/edges at least one of its beats
 * touches — everything outside that union is left out of the canvas, not
 * dimmed. Within what's rendered, the current beat still mutes/focuses via
 * opacity. Canvas rendering — plain positioned divs for nodes, inline SVG
 * with hand-authored path strings for edges, manual pan/zoom via a CSS
 * transform — is ported from a developer-supplied prototype
 * (artisyn-web-explorer-v4): no graph auto-layout library on this page, so
 * every edge's route is authored on purpose, not computed. Uses the site's
 * real Header above a fixed-height canvas; guided tour is the only mode —
 * there is no free-explore toggle.
 */

const PAD = 26;
const connections = (id: string) =>
  baseEdges.filter((edge) => edge.source === id || edge.target === id);
const parentFor = (id: string) =>
  baseNodes.find((node) => artifacts[node.id].children?.includes(id))?.id ?? id;

export default function DocsFlow() {
  const [scenario, setScenario] = useState(scenarios[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState('requirements');
  const [panelOpen, setPanelOpen] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const activeScenario = scenarios.find((s) => s.id === scenario) ?? scenarios[0];
  const scenarioSteps = steps.slice(activeScenario.start, activeScenario.end + 1);
  const step = scenarioSteps[stepIndex];
  const active = artifacts[selected];
  const selectedParent = parentFor(selected);

  // Only the nodes/edges touched by at least one beat in this scenario's
  // range are part of its scene — everything else is left out of the
  // canvas entirely, not just dimmed.
  const participatingNodes = new Set(scenarioSteps.flatMap((s) => s.focus));
  const participatingEdges = new Set(scenarioSteps.flatMap((s) => s.edges));
  // A step's focus can also name a child chip directly (not just its parent
  // node) to highlight more than one chip inside a state block at once.
  const focusedChips = new Set(step.focus);

  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const scale = Math.min(
      (el.clientWidth - PAD * 2) / sceneWidth,
      (el.clientHeight - PAD * 2) / sceneHeight,
      1.1
    );
    setTransform({
      x: (el.clientWidth - sceneWidth * scale) / 2,
      y: (el.clientHeight - sceneHeight * scale) / 2,
      scale: Math.max(0.25, scale),
    });
  }, []);

  useEffect(() => {
    fit();
    const el = viewportRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => fit());
    obs.observe(el);
    return () => obs.disconnect();
  }, [fit]);

  const selectArtifact = (id: string) => {
    setSelected(id);
    setPanelOpen(true);
  };

  const nodes = useMemo(
    () => baseNodes.filter((node) => participatingNodes.has(node.id)),
    [activeScenario]
  );
  const edges = useMemo(
    () => baseEdges.filter((edge) => participatingEdges.has(edge.id)),
    [activeScenario]
  );

  const chooseStep = (index: number) => {
    const next = Math.min(scenarioSteps.length - 1, Math.max(index, 0));
    setStepIndex(next);
    setSelected(scenarioSteps[next].selection);
  };
  const chooseScenario = (id: string) => {
    const target = scenarios.find((s) => s.id === id);
    if (!target) return;
    setScenario(id);
    setStepIndex(0);
    setSelected(steps[target.start].selection);
  };

  function zoomAt(factor: number, localX: number, localY: number) {
    const previous = transformRef.current;
    const scale = Math.min(2, Math.max(0.24, previous.scale * factor));
    setTransform({
      x: localX - ((localX - previous.x) * scale) / previous.scale,
      y: localY - ((localY - previous.y) * scale) / previous.scale,
      scale,
    });
  }
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    zoomAt(event.deltaY < 0 ? 1.09 : 0.92, event.clientX - rect.left, event.clientY - rect.top);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.artifact-node')) return;
    if (event.button !== 0) return;
    const { x, y } = transformRef.current;
    dragRef.current = { x: event.clientX, y: event.clientY, startX: x, startY: y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setTransform((t) => ({
      ...t,
      x: drag.startX + event.clientX - drag.x,
      y: drag.startY + event.clientY - drag.y,
    }));
  };
  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const related = connections(selectedParent).map((edge) => ({
    id: edge.source === selectedParent ? edge.target : edge.source,
    action: edge.source === selectedParent ? '→ ' + edge.label : '← ' + edge.label,
  }));
  const isChild = selectedParent !== selected;
  const readmeLines = active.markdown.split('\n');

  return (
    <div className="docs-explorer">
      <Header />
      <div className="explorer-body">
        <aside className="left-rail">
          <div className="rail-label">SCENARIOS</div>
          <div className="rail-scenarios">
            {scenarios.map((s, index) => (
              <button
                key={s.id}
                className={scenario === s.id ? 'is-active' : ''}
                onClick={() => chooseScenario(s.id)}
              >
                <span className="scenario-index">0{index + 1}</span>
                <span>
                  <strong>{s.label}</strong>
                  <small>{s.desc}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="rail-label smaller">LEGEND</div>
          <div className="legend">
            <span className="legend-dot blue" /> System
          </div>
          <div className="legend">
            <span className="legend-dot red" /> Workflow (a skill)
          </div>
          <div className="legend">
            <span className="legend-dot green" /> Permanent / interim state
          </div>
          <div className="legend">
            <span className="legend-dot purple" /> Human review gate
          </div>
        </aside>

        <main className="main-stage">
          <section className="tour-strip" aria-label="Guided walkthrough">
            <div className="tour-left">
              <div className="tour-top">
                <span className="tour-kicker">
                  GUIDED WALKTHROUGH{' '}
                  <span className="tour-index">
                    {String(stepIndex + 1).padStart(2, '0')} /{' '}
                    {String(scenarioSteps.length).padStart(2, '0')}
                  </span>
                </span>
                <div className="tour-segments">
                  {scenarioSteps.map((s, i) => (
                    <button
                      key={s.id}
                      title={`Step ${i + 1}: ${s.title}`}
                      aria-label={`Step ${i + 1}: ${s.title}`}
                      className={i <= stepIndex ? 'done' : ''}
                      onClick={() => chooseStep(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="tour-message">
              <small>{step.kicker}</small>
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>
            <div className="tour-actions">
              <a href={docsUrl} target="_blank" rel="noopener noreferrer" title="View harness docs">
                <ArrowUpRight size={16} />
              </a>
              <button
                title={panelOpen ? 'Close inspector' : 'Open inspector'}
                onClick={() => setPanelOpen((value) => !value)}
              >
                <Layers3 size={16} />
              </button>
              <button
                disabled={stepIndex === 0}
                onClick={() => chooseStep(stepIndex - 1)}
                title="Previous"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                className="next"
                onClick={() =>
                  chooseStep(stepIndex === scenarioSteps.length - 1 ? 0 : stepIndex + 1)
                }
              >
                {stepIndex === scenarioSteps.length - 1 ? 'Replay' : 'Next'}
                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          <div className="canvas-shell">
            <div className="canvas-heading">
              <span className="canvas-dot" /> THE DOCUMENTATION LIFECYCLE{' '}
              <span>/ {activeScenario.label.toUpperCase()}</span>
            </div>
            <div
              ref={viewportRef}
              className="scene-viewport"
              onWheel={onWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
            >
              <div
                className="scene-layer"
                style={{
                  width: sceneWidth,
                  height: sceneHeight,
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                }}
              >
                <svg
                  className="edges-svg"
                  width={sceneWidth}
                  height={sceneHeight}
                  viewBox={`0 0 ${sceneWidth} ${sceneHeight}`}
                  aria-hidden="true"
                >
                  <defs>
                    <marker
                      id="df-arrow-dim"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto"
                    >
                      <path d="M0 0 L10 5 L0 10 z" fill="#778096" />
                    </marker>
                    <marker
                      id="df-arrow-bright"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto"
                    >
                      <path d="M0 0 L10 5 L0 10 z" fill="#a6a4ff" />
                    </marker>
                  </defs>
                  {edges.map((e) => {
                    const focused = step.edges.includes(e.id);
                    return (
                      <path
                        key={e.id}
                        d={e.path}
                        className={`edge-path ${focused ? 'is-focused' : 'is-muted'}`}
                        markerEnd={`url(#df-arrow-${focused ? 'bright' : 'dim'})`}
                      />
                    );
                  })}
                </svg>
                {edges.map((e) => {
                  const focused = step.edges.includes(e.id);
                  return (
                    <span
                      key={e.id}
                      className={`edge-chip ${focused ? 'is-focused' : 'is-muted'}`}
                      style={{ left: e.lx, top: e.ly }}
                    >
                      {e.label}
                    </span>
                  );
                })}
                {dividers.map((x, i) => (
                  <DividerNode key={i} x={x} top={0} bottom={sceneHeight} />
                ))}
                {pillars.map((p) => (
                  <PillarLabelNode key={p.id} label={p.label} x={p.x} y={6} />
                ))}
                {nodes.map((node) => {
                  const focused = step.focus.includes(node.id);
                  return (
                    <ArtifactBlock
                      key={node.id}
                      node={node}
                      artifact={artifacts[node.id]}
                      selected={node.id === selectedParent}
                      focused={focused}
                      muted={!focused}
                      selectedArtifact={selected}
                      focusedChips={focusedChips}
                      onSelect={selectArtifact}
                    />
                  );
                })}
              </div>
            </div>
            <div className="canvas-hint">
              Click to inspect &middot; Drag to pan &middot; Scroll to zoom
            </div>
            <button className="canvas-fit" title="Fit scene" onClick={fit}>
              <RotateCcw size={14} />
            </button>
          </div>
        </main>

        {panelOpen && (
          <aside className="inspector">
            <div className="inspector-top">
              <span>
                <Info size={15} /> INSPECTOR
              </span>
              <button onClick={() => setPanelOpen(false)} title="Close inspector">
                <X size={16} />
              </button>
            </div>
            <div className="inspector-body">
              <div className={`inspector-hero kind-${active.kind}`}>
                <span>{active.eyebrow}</span>
                <h2>{active.title}</h2>
                <small>{active.subtitle}</small>
              </div>
              <p className="inspector-description">{active.description}</p>
              <div className="inspector-section">
                <h3>
                  <ListChecks size={15} /> ROLE &amp; RESPONSIBILITIES
                </h3>
                {active.details.map((detail, i) => (
                  <div key={i} className="detail-line">
                    <Check size={13} />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
              <div className="inspector-section">
                <h3>
                  <Link2 size={15} /> {isChild ? 'PARENT STATE' : 'RELATIONSHIPS'}{' '}
                  <span>{isChild ? 1 : related.length}</span>
                </h3>
                {isChild ? (
                  <button className="relation" onClick={() => selectArtifact(selectedParent)}>
                    {artifacts[selectedParent].title} <ArrowUpRight size={13} />
                  </button>
                ) : (
                  related.map((r, i) => (
                    <button
                      key={`${r.id}-${i}`}
                      className="relation"
                      onClick={() => selectArtifact(r.id)}
                    >
                      <span>
                        <strong>{artifacts[r.id].title}</strong>
                        <small>{r.action}</small>
                      </span>
                      <ArrowUpRight size={13} />
                    </button>
                  ))
                )}
              </div>
              <div className="inspector-section">
                <h3>
                  <BookOpen size={15} /> DOCUMENTATION PREVIEW
                </h3>
                <div className="markdown-preview">
                  {readmeLines.map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith('# ')
                          ? 'md-h1'
                          : line.startsWith('## ')
                            ? 'md-h2'
                            : line.startsWith('-')
                              ? 'md-list'
                              : ''
                      }
                    >
                      {line || ' '}
                    </div>
                  ))}
                </div>
                <div className="document-path">
                  <FileText size={13} /> {active.path}
                </div>
              </div>
            </div>
            <div className="inspector-foot">
              Conceptual map &middot; terminology matches the real skills
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
