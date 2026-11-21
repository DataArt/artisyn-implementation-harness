import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { docsUrl } from '../../env';
import graph from './graph.json';

/**
 * A self-contained view of this repo's operational graph: one dot per doc,
 * ringed by tier (Product at the centre), with the authored edges between them.
 * `graph.json` is a snapshot of `docs/.og/docs-operational-graph.sqlite` taken
 * after the 4.2.0 migration; regenerate it when the snapshot should move on.
 */

type Node = { id: string; tier: string; title: string; path: string };
type Edge = [from: string, to: string, type: string];

export const tiers = [
  { name: 'Product', label: 'Product', color: '#7C3AED' },
  { name: 'HLD', label: 'HLD', color: '#1D4ED8' },
  { name: 'LLD', label: 'LLD', color: '#0E7490' },
  { name: 'EngineeringGuide', label: 'Engineering Guide', color: '#10B981' },
  { name: 'Story', label: 'Stories', color: '#D97706' },
  { name: 'Other', label: 'Other', color: '#6B7280' },
];

const nodes = graph.nodes as Node[];
const edges = graph.edges as Edge[];

const SIZE = 560;
const C = SIZE / 2;
const RADII = [52, 100, 140, 180, 236, 268];

const docHref = (path: string) =>
  docsUrl + path.split('/').map(encodeURIComponent).join('/').replace(/\.md$/, '.html');

function layout() {
  const pos = new Map<string, { x: number; y: number; r: number; color: string }>();
  tiers.forEach((t, ring) => {
    const members = nodes.filter((n) => n.tier === t.name);
    const radius = RADII[ring];
    const dot = Math.min(5, ((2 * Math.PI * radius) / Math.max(members.length, 1)) * 0.34);
    members.forEach((n, i) => {
      const a = (i / members.length) * Math.PI * 2 + ring * 0.6;
      pos.set(n.id, {
        x: C + radius * Math.cos(a),
        y: C + radius * Math.sin(a),
        r: dot,
        color: t.color,
      });
    });
  });
  return pos;
}

export default function GraphExplorer() {
  const pos = useMemo(layout, []);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), []);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hover ?? pinned;

  const visible = (id: string) => !hidden.has(byId.get(id)!.tier);
  const linked = useMemo(() => {
    if (!active) return null;
    const set = new Set([active]);
    for (const [f, t] of edges) {
      if (f === active) set.add(t);
      if (t === active) set.add(f);
    }
    return set;
  }, [active]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of nodes) m.set(n.tier, (m.get(n.tier) ?? 0) + 1);
    return m;
  }, []);

  const toggleTier = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const activeNode = active ? byId.get(active) : null;
  const activeEdges = active ? edges.filter(([f, t]) => f === active || t === active) : [];

  return (
    <div className="df-gx">
      <div className="df-gx-canvas">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`Operational graph: ${nodes.length} docs and ${edges.length} authored edges in concentric tier rings`}
          onMouseLeave={() => setHover(null)}
        >
          {RADII.map((r) => (
            <circle key={r} cx={C} cy={C} r={r} className="df-gx-ring" />
          ))}
          {edges.map(([f, t], i) => {
            if (!visible(f) || !visible(t)) return null;
            const a = pos.get(f)!;
            const b = pos.get(t)!;
            const on = active && (f === active || t === active);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={on ? 'df-gx-edge is-on' : active ? 'df-gx-edge is-dim' : 'df-gx-edge'}
              />
            );
          })}
          {nodes.map((n) => {
            if (!visible(n.id)) return null;
            const p = pos.get(n.id)!;
            const dim = linked && !linked.has(n.id);
            return (
              <circle
                key={n.id}
                cx={p.x}
                cy={p.y}
                r={n.id === active ? p.r + 2.5 : p.r}
                fill={p.color}
                className={dim ? 'df-gx-node is-dim' : 'df-gx-node'}
                onMouseEnter={() => setHover(n.id)}
                onClick={() => setPinned((cur) => (cur === n.id ? null : n.id))}
              >
                <title>{n.title}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <aside className="df-gx-side">
        <ul className="df-gx-legend" aria-label="Tiers">
          {tiers.map((t) => (
            <li key={t.name}>
              <button
                type="button"
                aria-pressed={!hidden.has(t.name)}
                className={hidden.has(t.name) ? 'is-off' : ''}
                onClick={() => toggleTier(t.name)}
              >
                <span className="df-gx-swatch" style={{ background: t.color }} />
                {t.label}
                <em>{counts.get(t.name) ?? 0}</em>
              </button>
            </li>
          ))}
        </ul>

        <div className="df-gx-detail" aria-live="polite">
          {activeNode ? (
            <>
              <span className="df-gx-tier">
                {tiers.find((t) => t.name === activeNode.tier)?.label}
              </span>
              <strong>{activeNode.title}</strong>
              <code>{activeNode.path}</code>
              <p>
                {activeEdges.length} authored edge{activeEdges.length === 1 ? '' : 's'}
                {activeEdges.length > 0 &&
                  `: ${[...new Set(activeEdges.map((e) => e[2]))].join(', ')}`}
              </p>
              <a href={docHref(activeNode.path)} target="_blank" rel="noopener noreferrer">
                Open doc <ArrowUpRight size={13} />
              </a>
            </>
          ) : (
            <p className="df-gx-hint">
              Hover a dot to see a doc and its links. Click to pin it. Click a tier to hide it.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
