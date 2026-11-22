'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { docsUrl } from '../../../../env';
import graph from './graph.json';

/**
 * A self-contained view of this repo's operational graph: one dot per doc,
 * ringed by tier (Product at the centre), with the authored edges between them.
 * `graph.json` is a snapshot of `docs/.og/docs-operational-graph.sqlite` taken
 * after the 4.2.0 migration; regenerate it with
 * `node apps/web-explorer/scripts/export-dogfood-graph.mjs`.
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

const knownTiers = new Set(tiers.map((t) => t.name));
const nodes = (graph.nodes as Node[]).map((n) =>
  knownTiers.has(n.tier) ? n : { ...n, tier: 'Other' }
);
const edges = graph.edges as Edge[];

const SIZE = 560;
const C = SIZE / 2;
const RADII = [52, 100, 140, 180, 236, 268];

// The docs site publishes everything under docs/ except Stories/ (srcExclude).
const docHref = (path: string) =>
  path.startsWith('Stories/')
    ? null
    : docsUrl + path.split('/').map(encodeURIComponent).join('/').replace(/\.md$/, '.html');

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
  const activeEdges = useMemo(
    () =>
      active
        ? edges.filter(
            ([f, t]) =>
              (f === active || t === active) &&
              !hidden.has(byId.get(f)!.tier) &&
              !hidden.has(byId.get(t)!.tier)
          )
        : [],
    [active, hidden, byId]
  );
  const linked = useMemo(() => {
    if (!active) return null;
    const set = new Set([active]);
    for (const [f, t] of activeEdges) set.add(f === active ? t : f);
    return set;
  }, [active, activeEdges]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of nodes) m.set(n.tier, (m.get(n.tier) ?? 0) + 1);
    return m;
  }, []);

  const toggleTier = (name: string) => {
    const hiding = !hidden.has(name);
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    if (hiding && pinned && byId.get(pinned)!.tier === name) setPinned(null);
    setHover(null);
  };

  const activeNode = active ? byId.get(active) : null;
  const activeHref = activeNode ? docHref(activeNode.path) : null;
  const neighbours = activeNode
    ? [...new Set(activeEdges.map(([f, t]) => (f === active ? t : f)))].map((id) => byId.get(id)!)
    : [];
  const tierLabel = (name: string) => tiers.find((t) => t.name === name)?.label ?? name;

  return (
    <div className="df-gx">
      <div className="df-gx-canvas">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`Operational graph: ${nodes.length} docs and ${edges.length} authored edges in concentric tier rings. Use the docs list to explore it by keyboard or screen reader.`}
          onPointerLeave={() => setHover(null)}
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
          <g aria-hidden="true">
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
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(n.id)}
                  onClick={() => setPinned((cur) => (cur === n.id ? null : n.id))}
                >
                  <title>{n.title}</title>
                </circle>
              );
            })}
          </g>
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
                <span className="df-gx-label">{t.label}</span>
                <em>{hidden.has(t.name) ? 'hidden' : (counts.get(t.name) ?? 0)}</em>
              </button>
            </li>
          ))}
        </ul>

        <div className="df-gx-detail" aria-live="polite">
          {activeNode ? (
            <>
              <span className="df-gx-tier">{tierLabel(activeNode.tier)}</span>
              <strong>{activeNode.title}</strong>
              <code>{activeNode.path}</code>
              <p>
                {activeEdges.length} authored edge{activeEdges.length === 1 ? '' : 's'}
                {activeEdges.length > 0 &&
                  `: ${[...new Set(activeEdges.map((e) => e[2]))].join(', ')}`}
              </p>
              {neighbours.length > 0 && (
                <ul className="df-gx-neighbours" aria-label="Linked docs">
                  {neighbours.map((n) => (
                    <li key={n.id}>
                      <button type="button" onClick={() => setPinned(n.id)}>
                        {n.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {activeHref ? (
                <a href={activeHref} target="_blank" rel="noopener noreferrer">
                  Open doc <ArrowUpRight size={13} />
                </a>
              ) : (
                <p className="df-gx-hint">Stories are not published on the docs site.</p>
              )}
            </>
          ) : (
            <p className="df-gx-hint">
              Hover a dot to see a doc and its links. Click or tap to pin it. Click a tier to hide
              it. Keyboard users can pick a doc from the list below.
            </p>
          )}
        </div>

        <details className="df-gx-list">
          <summary>All docs as a list</summary>
          {tiers
            .filter((t) => !hidden.has(t.name))
            .map((t) => (
              <div key={t.name}>
                <h3>{t.label}</h3>
                <ul>
                  {nodes
                    .filter((n) => n.tier === t.name)
                    .map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          aria-pressed={pinned === n.id}
                          onClick={() => setPinned((cur) => (cur === n.id ? null : n.id))}
                        >
                          {n.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </details>
      </aside>
    </div>
  );
}
