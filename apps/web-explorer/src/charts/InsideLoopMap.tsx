import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ui, series } from '../theme';

export type HubNode = {
  id: string;
  label: string;
  sub?: string;
  /** Ids of nodes this one depends on — drawn as an arrow from dependency to here. */
  dependsOn?: string[];
};

export type HubFeedback = { from: string; to: string; label?: string };

type TopicData = {
  label: string;
  sub?: string;
  visited: boolean;
  active: boolean;
  dimmed: boolean;
};

/** Reverse of dependsOn: id -> the ids that depend on it. */
function computeDependents(nodes: HubNode[]): Record<string, string[]> {
  const dependents: Record<string, string[]> = {};
  nodes.forEach((n) =>
    (n.dependsOn ?? []).forEach((dep) => {
      (dependents[dep] ??= []).push(n.id);
    })
  );
  return dependents;
}

/** id plus everything that transitively depends on it. Pure graph traversal —
 *  used once per render to build a CSS string, never touched by mouse events. */
function downstreamOf(id: string, dependents: Record<string, string[]>): Set<string> {
  const seen = new Set<string>([id]);
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop() as string;
    for (const next of dependents[cur] ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

/**
 * Hover highlighting done entirely in CSS via :has(), not React state: no
 * mousemove-driven re-render exists for this to loop on. For each node,
 * hovering it dims every other node in .hubmap, then re-lights that node plus
 * everything downstream of it. Relies on React Flow stamping data-id on each
 * node's wrapper element.
 */
function buildHoverCss(nodes: HubNode[], dependents: Record<string, string[]>): string {
  return nodes
    .map((n) => {
      const hoverSel = `.hubmap:has(.react-flow__node[data-id="${n.id}"]:hover)`;
      const lit = [...downstreamOf(n.id, dependents)]
        .map((id) => `${hoverSel} .react-flow__node[data-id="${id}"] .hubnode`)
        .join(', ');
      return (
        `${hoverSel} .react-flow__node .hubnode { opacity: 0.35; }\n` +
        `${lit} { opacity: 1; box-shadow: 0 0 0 3px rgba(65, 182, 230, 0.3), 0 1px 2px rgba(15, 23, 42, 0.06); }`
      );
    })
    .join('\n');
}

/**
 * Mirrors --deck-zoom in styles.css. The hub map opts its whole subtree
 * back out of the ancestor .stage's CSS zoom (see styles.css) because React
 * Flow measures node DOM boxes to route edges, and CSS zoom's
 * getBoundingClientRect/ResizeObserver/offsetWidth report inconsistent
 * pixel values — that desynced edge paths from the boxes they connect to.
 * These constants (and .hubnode's own CSS size) are pre-multiplied by the
 * same factor instead, so the diagram still renders at the same visual
 * size as the rest of the zoomed deck.
 */
const DECK_ZOOM = 1.3;

const NODE_WIDTH = 172 * DECK_ZOOM;
const NODE_HEIGHT = 66 * DECK_ZOOM;

/**
 * Flip this to switch the graph's orientation. Every node carries a hidden
 * source+target handle on all four sides regardless, so the only things that
 * need to change with direction are which named handle the main flow and the
 * feedback loop each use — see MAIN_SOURCE/MAIN_TARGET/LOOP_* below.
 */
const DIRECTION = 'LR' as 'LR' | 'TB';

const MAIN_SOURCE = DIRECTION === 'LR' ? 'right-source' : 'bottom-source';
const MAIN_TARGET = DIRECTION === 'LR' ? 'left-target' : 'top-target';
// The feedback source is always the last-rank node, so its forward-axis exit
// (same side the main flow already leaves from) is guaranteed clear.
const LOOP_SOURCE = MAIN_SOURCE;

const HIDDEN = { visibility: 'hidden' as const };

function TopicNode({ data }: NodeProps<Node<TopicData>>) {
  const cls = [
    'hubnode',
    data.visited && 'hubnode--visited',
    data.active && 'hubnode--active',
    data.dimmed && 'hubnode--dimmed',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      {/* One source + one target handle per side, all invisible — the main
          flow and the feedback loop each pick whichever pair suits the
          current DIRECTION, so re-wiring which sides are used never touches
          this component. */}
      <Handle id="top-target" type="target" position={Position.Top} style={HIDDEN} />
      <Handle id="top-source" type="source" position={Position.Top} style={HIDDEN} />
      <Handle id="right-target" type="target" position={Position.Right} style={HIDDEN} />
      <Handle id="right-source" type="source" position={Position.Right} style={HIDDEN} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} style={HIDDEN} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} style={HIDDEN} />
      <Handle id="left-target" type="target" position={Position.Left} style={HIDDEN} />
      <Handle id="left-source" type="source" position={Position.Left} style={HIDDEN} />
      {data.visited && (
        <span className="hubnode__check" aria-label="Already covered">
          ✓
        </span>
      )}
      <span className="hubnode__label">{data.label}</span>
      {data.sub && <span className="hubnode__sub">{data.sub}</span>}
    </div>
  );
}

const nodeTypes = { topic: TopicNode };

const RANK_GAP = 76 * DECK_ZOOM;
const ORDER_GAP = 34 * DECK_ZOOM;

/**
 * Rank = forward longest path from a root: a node's rank is one more than
 * the deepest of its dependencies, so siblings depending on the same thing
 * — e.g. Context and Tools, both direct children of the root — land in the
 * same column. dagre's own 'longest-path' ranker computes the opposite
 * thing (distance from the nearest sink), which is why Tools and Onboarding
 * kept drifting into whichever column their downstream sink was in rather
 * than sitting with their siblings — that's what this replaces.
 */
function computeRanks(nodes: HubNode[]): Record<string, number> {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const rank: Record<string, number> = {};
  function resolve(id: string): number {
    if (rank[id] !== undefined) return rank[id];
    const deps = byId[id].dependsOn ?? [];
    rank[id] = deps.length ? Math.max(...deps.map(resolve)) + 1 : 0;
    return rank[id];
  }
  nodes.forEach((n) => resolve(n.id));
  return rank;
}

/**
 * Places nodes on a rank/order grid (direction set by DIRECTION above):
 * rank picks the column, order is a single forward barycenter sweep — each
 * rank is sorted by the average already-placed position of its
 * dependencies — which is enough to keep a graph this size free of
 * avoidable edge crossings. The one feedback (back) edge is drawn
 * separately via LOOP_SOURCE/LOOP_TARGET rather than fed in here, since a
 * cycle has no well-defined rank. Hand-placing 9 nodes kept producing
 * overlaps and wrong-direction handles across several attempts; this stays
 * algorithmic without pulling in a layout library whose ranker computes the
 * wrong thing (see computeRanks above).
 */
function layout(nodes: HubNode[]): Record<string, { x: number; y: number }> {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const rank = computeRanks(nodes);
  const maxRank = Math.max(...Object.values(rank));
  const groups: string[][] = [];
  for (let r = 0; r <= maxRank; r++) {
    groups[r] = nodes.filter((n) => rank[n.id] === r).map((n) => n.id);
  }

  const order: Record<string, number> = {};
  groups[0].forEach((id, i) => (order[id] = i));
  for (let r = 1; r <= maxRank; r++) {
    const scored = groups[r].map((id, origIndex) => {
      const deps = byId[id].dependsOn ?? [];
      const bary = deps.length ? deps.reduce((sum, d) => sum + order[d], 0) / deps.length : 0;
      return { id, bary, origIndex };
    });
    scored.sort((a, b) => a.bary - b.bary || a.origIndex - b.origIndex);
    scored.forEach((s, i) => (order[s.id] = i));
    groups[r] = scored.map((s) => s.id);
  }

  const forwardStep = DIRECTION === 'LR' ? NODE_WIDTH : NODE_HEIGHT;
  const crossStep = DIRECTION === 'LR' ? NODE_HEIGHT : NODE_WIDTH;
  const maxRows = Math.max(...groups.map((g) => g.length));
  const crossExtent = maxRows * crossStep + (maxRows - 1) * ORDER_GAP;
  const crossOf = (id: string) => (DIRECTION === 'LR' ? positions[id].y : positions[id].x);

  const positions: Record<string, { x: number; y: number }> = {};
  groups.forEach((group, r) => {
    const forward = r * (forwardStep + RANK_GAP);
    const extent = group.length * crossStep + (group.length - 1) * ORDER_GAP;
    /**
     * A shorter column anchors to the average center of its own dependencies
     * rather than the diagram's absolute middle — plain centering pulled
     * Infrastructure/Code Review (Harness's only rank-3 children, a group of
     * 2 against a tallest column of 3) down into the vertical middle of the
     * whole diagram, away from Harness's own row, even though nothing else
     * in that column justified the drop. Anchoring keeps a rank flush against
     * whichever row its dependencies actually sit on; the root rank (no
     * dependencies to anchor to) still centers in the full extent.
     */
    const crossStart = group.length
      ? (() => {
          const centers = group.map((id) => {
            const deps = byId[id].dependsOn ?? [];
            return deps.length
              ? deps.reduce((sum, d) => sum + crossOf(d), 0) / deps.length + crossStep / 2
              : crossExtent / 2;
          });
          const target = centers.reduce((a, b) => a + b, 0) / centers.length - extent / 2;
          return Math.min(Math.max(target, 0), crossExtent - extent);
        })()
      : 0;
    group.forEach((id, i) => {
      const cross = crossStart + i * (crossStep + ORDER_GAP);
      positions[id] = DIRECTION === 'LR' ? { x: forward, y: cross } : { x: cross, y: forward };
    });
  });
  return positions;
}

type Box = { left: number; right: number; top: number; bottom: number; cx: number; cy: number };

function toBox(pos: { x: number; y: number }): Box {
  return {
    left: pos.x,
    right: pos.x + NODE_WIDTH,
    top: pos.y,
    bottom: pos.y + NODE_HEIGHT,
    cx: pos.x + NODE_WIDTH / 2,
    cy: pos.y + NODE_HEIGHT / 2,
  };
}

/**
 * Most dependency edges leave from MAIN_SOURCE and land on MAIN_TARGET. A few
 * skip more than one rank (e.g. Context -> Onboarding) and share a row with
 * an unrelated node sitting between them on the way — smoothstep's default
 * routing travels along the source's row before turning toward the target,
 * so without this it would draw straight through that node (verified: this
 * is exactly what happened with Harness sitting between Context and
 * Onboarding). Detect that case and leave from the cross-axis side instead,
 * clearing the row before turning.
 */
function pickSourceHandle(depId: string, targetId: string, boxes: Record<string, Box>): string {
  const dep = boxes[depId];
  const target = boxes[targetId];
  if (DIRECTION === 'LR') {
    if (dep.cy === target.cy) return MAIN_SOURCE;
    const [xMin, xMax] = dep.cx < target.cx ? [dep.right, target.left] : [target.right, dep.left];
    const blocked = Object.entries(boxes).some(
      ([id, b]) =>
        id !== depId &&
        id !== targetId &&
        b.top <= dep.cy &&
        dep.cy <= b.bottom &&
        b.right > xMin &&
        b.left < xMax
    );
    return blocked ? (target.cy < dep.cy ? 'top-source' : 'bottom-source') : MAIN_SOURCE;
  }
  if (dep.cx === target.cx) return MAIN_SOURCE;
  const [yMin, yMax] = dep.cy < target.cy ? [dep.bottom, target.top] : [target.bottom, dep.top];
  const blocked = Object.entries(boxes).some(
    ([id, b]) =>
      id !== depId &&
      id !== targetId &&
      b.left <= dep.cx &&
      dep.cx <= b.right &&
      b.bottom > yMin &&
      b.top < yMax
  );
  return blocked ? (target.cx < dep.cx ? 'left-source' : 'right-source') : MAIN_SOURCE;
}

/**
 * The feedback loop's target side is deliberately off the main axis, so it
 * doesn't fight the forward edges landing on MAIN_TARGET. Which off-axis
 * side is clear depends on where the target sits: approaching from whichever
 * extreme (top/left) it's already closest to routes above or beside the
 * whole diagram, guaranteed clear of every other node — approaching from the
 * far side would cut across intervening rows/columns instead (this is what
 * happened when Harness moved to the top row and the loop still targeted its
 * bottom, cutting through Code Quality on the way back).
 */
function pickLoopTargetHandle(targetId: string, boxes: Record<string, Box>): string {
  const target = boxes[targetId];
  if (DIRECTION === 'LR') {
    const nearTop = target.top - Math.min(...Object.values(boxes).map((b) => b.top));
    const nearBottom = Math.max(...Object.values(boxes).map((b) => b.bottom)) - target.bottom;
    return nearTop <= nearBottom ? 'top-target' : 'bottom-target';
  }
  const nearLeft = target.left - Math.min(...Object.values(boxes).map((b) => b.left));
  const nearRight = Math.max(...Object.values(boxes).map((b) => b.right)) - target.right;
  return nearLeft <= nearRight ? 'left-target' : 'right-target';
}

/**
 * A clickable dependency graph, built on React Flow for edge routing and
 * click handling plus the rank/order layout above for node placement
 * (guaranteed non-overlapping, correctly ordered left-to-right).
 *
 * Root nodes (no dependsOn) start active; opening a node — which is already
 * tracked via visitedIds, since that's what "click a node" does — unlocks its
 * direct children. Deliberately click-driven, not hover-driven: a hover-based
 * version caused a real feedback loop (the box lifting on :hover moved it out
 * from under the cursor, which un-hovered it, which moved it back...), and
 * since this only ever reads visitedIds (already a stable, low-frequency
 * source of truth), it can't reproduce that failure mode.
 */
export function InsideLoopMap({
  nodes,
  feedback = [],
  onSelect,
  visitedIds,
}: {
  nodes: HubNode[];
  feedback?: HubFeedback[];
  onSelect: (id: string) => void;
  /** Nodes already opened this session get a check badge instead of a plain border. */
  visitedIds?: ReadonlySet<string>;
}) {
  const positions = useMemo(() => layout(nodes), [nodes]);
  const boxes = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, toBox(positions[n.id])])),
    [nodes, positions]
  );
  const dependents = useMemo(() => computeDependents(nodes), [nodes]);
  const hoverCss = useMemo(() => buildHoverCss(nodes, dependents), [nodes, dependents]);

  const activeIds = useMemo(() => {
    const active = new Set<string>();
    nodes.forEach((n) => {
      if (!n.dependsOn?.length) active.add(n.id);
    });
    (visitedIds ?? []).forEach((id) => {
      active.add(id);
      (dependents[id] ?? []).forEach((dep) => active.add(dep));
    });
    return active;
  }, [nodes, visitedIds, dependents]);

  const flowNodes: Node<TopicData>[] = useMemo(
    () =>
      nodes.map((n) => {
        const active = activeIds.has(n.id);
        return {
          id: n.id,
          type: 'topic',
          position: positions[n.id],
          data: {
            label: n.label,
            sub: n.sub,
            visited: visitedIds?.has(n.id) ?? false,
            active,
            dimmed: !active,
          },
        };
      }),
    [nodes, positions, visitedIds, activeIds]
  );

  const flowEdges: Edge[] = useMemo(() => {
    const onPath = (a: string, b: string) => activeIds.has(a) && activeIds.has(b);

    const dependencyEdges: Edge[] = nodes.flatMap((n) =>
      (n.dependsOn ?? []).map((depId) => {
        const lit = onPath(depId, n.id);
        const dim = !lit;
        return {
          id: `${depId}->${n.id}`,
          source: depId,
          target: n.id,
          sourceHandle: pickSourceHandle(depId, n.id, boxes),
          targetHandle: MAIN_TARGET,
          type: 'smoothstep',
          pathOptions: { borderRadius: 16 * DECK_ZOOM },
          style: {
            stroke: lit ? ui.accent : ui.border,
            strokeWidth: (lit ? 2.5 : 1.75) * DECK_ZOOM,
            opacity: dim ? 0.25 : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: lit ? ui.accent : ui.textMuted,
            width: 16 * DECK_ZOOM,
            height: 16 * DECK_ZOOM,
          },
        };
      })
    );

    const feedbackEdges: Edge[] = feedback.map((f) => {
      const dim = !onPath(f.from, f.to);
      return {
        id: `${f.from}~>${f.to}`,
        source: f.from,
        target: f.to,
        sourceHandle: LOOP_SOURCE,
        targetHandle: pickLoopTargetHandle(f.to, boxes),
        type: 'smoothstep',
        pathOptions: { borderRadius: 16 * DECK_ZOOM },
        label: f.label,
        labelStyle: { fill: series[1], fontSize: 11.5 * DECK_ZOOM, fontWeight: 600 },
        labelBgStyle: { fill: '#131B26', fillOpacity: dim ? 0.4 : 0.9 },
        style: {
          stroke: series[1],
          strokeWidth: 2 * DECK_ZOOM,
          strokeDasharray: '5 5',
          opacity: dim ? 0.25 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: series[1],
          width: 16 * DECK_ZOOM,
          height: 16 * DECK_ZOOM,
        },
      };
    });

    return [...dependencyEdges, ...feedbackEdges];
  }, [nodes, feedback, activeIds, boxes]);

  return (
    <div className="hubmap">
      <style>{hoverCss}</style>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelect(node.id)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22 * DECK_ZOOM}
          size={1 * DECK_ZOOM}
          color={ui.borderSoft}
        />
      </ReactFlow>
    </div>
  );
}
