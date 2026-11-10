import { useState } from 'react';
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
import { Modal } from '../components/Modal';

/**
 * Faithful interactive port of docs/Engineering Guide/Lifecycles/05 Documents
 * Flow.md's own Mermaid diagram — same nodes, same classDef colors, same
 * edges and labels. Manually positioned (not auto-laid-out): the pipeline's
 * shape is fixed and known, unlike InsideLoopMap's variable-depth dependency
 * graph, so the generalized rank/order algorithm there would be overkill
 * here.
 */

export type FlowNodeKind =
  | 'ticket'
  | 'design'
  | 'solution'
  | 'impl'
  | 'pctx'
  | 'hld'
  | 'lld'
  | 'eg'
  | 'readme'
  | 'archive'
  | 'audit';

type FlowNodeData = {
  label: string;
  sub: string;
  kind: FlowNodeKind;
  detail: string;
};

const W = 210;
const H = 72;

const nodeDefs: Array<{ id: string; x: number; y: number } & FlowNodeData> = [
  {
    id: 'ticket',
    x: 0,
    y: 230,
    kind: 'ticket',
    label: 'Ticket',
    sub: 'Jira ND-* or a local DEV-*/DESIGN-* id',
    detail:
      'Every unit of work starts here — no doc goes directly to a permanent tier without passing through a ticket first. The ticket resolves to a working folder, Stories/[TICKET] name/, that holds every draft this unit of work produces.',
  },
  {
    id: 'design',
    x: 300,
    y: 30,
    kind: 'design',
    label: 'design/',
    sub: '00 Frame · 01 Research · 02 Evaluate · Report.md',
    detail:
      '/design\'s own working drafts: the problem framed, options researched, one evaluated and recommended. Rationale, rejected alternatives, and open questions live here permanently — they never graduate to a permanent doc, by design (see "What does NOT graduate" in Documents Flow.md).',
  },
  {
    id: 'solution',
    x: 300,
    y: 140,
    kind: 'solution',
    label: 'solution/',
    sub: 'Architecture · Design · Stack · Efforts',
    detail:
      'The certainty artifacts /design solution produces once a recommendation is approved: the actual architecture, design, stack, and effort estimate. Immutable after the Publish gate — this is what graduates, and what /dev later reads as its source of truth.',
  },
  {
    id: 'impl',
    x: 300,
    y: 320,
    kind: 'impl',
    label: 'impl/',
    sub: '0-intent · 1-plan · 2-report · stat.json',
    detail:
      "/dev's own working drafts, produced by a later ticket that implements the approved design: captured intent, the numbered plan, and a living implementation report updated every step. 2-report.md and stat.json track what ran and how long it took.",
  },
  {
    id: 'pctx',
    x: 620,
    y: -10,
    kind: 'pctx',
    label: 'docs/Harness',
    sub: 'product-level docs',
    detail:
      "Where a Product-track design graduates — the harness's own self-description, not project-specific architecture. Accumulates over the product's lifetime, read by Research/Evaluate as context for the next Product design.",
  },
  {
    id: 'hld',
    x: 620,
    y: 85,
    kind: 'hld',
    label: 'Target Architecture (HLD)',
    sub: 'aspirational design intent',
    detail:
      "WHY and WHAT a project is designed toward. Updated two ways: a Project-track /design publish lands a new settled decision here directly; or /dev document's deviation audit finds the built system diverged from a settled HLD decision and the change is authorized — only then does implementation feed back into intent, not on every routine build.",
  },
  {
    id: 'lld',
    x: 620,
    y: 190,
    kind: 'lld',
    label: 'System Architecture (LLD)',
    sub: 'current implementation detail',
    detail:
      "WHAT is currently built and HOW it works — descriptive, not aspirational. /dev document updates this on essentially every ticket that changes a container's implementation detail. A gap between an HLD container and an LLD folder is a delivery gap by design, not an error — that's exactly what /where-we-are reports on.",
  },
  {
    id: 'eg',
    x: 620,
    y: 295,
    kind: 'eg',
    label: 'Engineering Guide',
    sub: 'operational procedures',
    detail:
      'Cross-cutting conventions and how-to-operate procedures — not architecture. /dev document lands an entry here when a ticket changes how the team or an agent should do something operationally (a new workflow, a changed convention).',
  },
  {
    id: 'readme',
    x: 620,
    y: 400,
    kind: 'readme',
    label: 'App READMEs',
    sub: 'local dev quickstart',
    detail:
      'A one-page local quickstart per app — what it does, how to run it, links to HLD + LLD. /dev document keeps this current when env vars or Nx targets change; nothing else belongs here (see the App README scope rule in Documentation/02 Structure.md).',
  },
  {
    id: 'archive',
    x: 940,
    y: 320,
    kind: 'archive',
    label: 'Stories/archive/',
    sub: 'read-only, closed by /dev complete',
    detail:
      'The whole working folder — design/, solution/, impl/ together — moves here once Completion archives the ticket: doc consistency reviewed, every Review Finding resolved, required checks passing. The folder keeps its original ASCII name; done status lives in the report, not the folder name. Archived stories are read-only references, never reopened to add a doc.',
  },
  {
    id: 'wwa',
    x: 940,
    y: 95,
    kind: 'audit',
    label: '/where-we-are',
    sub: 'compares HLD vs LLD',
    detail:
      'Reads the aspirational HLD and the descriptive LLD side by side and reports the gap between them — designed but not built, or built but not yet reflected in intent. The report itself is append-only (LLD/where-we-are/ or HLD/WAR/<version>/); closing a surfaced gap means opening a new ticket, which is exactly how the loop closes back to the top of this diagram.',
  },
];

const edges: Array<{
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  label?: string;
  dashed?: boolean;
}> = [
  {
    id: 'ticket-design',
    source: 'ticket',
    target: 'design',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: '/design context',
  },
  {
    id: 'design-solution',
    source: 'design',
    target: 'solution',
    sourceHandle: 'bottom-source',
    targetHandle: 'top-target',
    label: 'frame → research → evaluate',
  },
  {
    id: 'solution-pctx',
    source: 'solution',
    target: 'pctx',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: 'publish (Product track)',
  },
  {
    id: 'solution-hld',
    source: 'solution',
    target: 'hld',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: 'publish (Project track)',
  },
  {
    id: 'solution-impl',
    source: 'solution',
    target: 'impl',
    sourceHandle: 'bottom-source',
    targetHandle: 'top-target',
    label: 'source of truth for a later /dev ticket',
  },
  {
    id: 'impl-hld',
    source: 'impl',
    target: 'hld',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: 'document — only if a deviation is authorized',
    dashed: true,
  },
  {
    id: 'impl-lld',
    source: 'impl',
    target: 'lld',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: 'document — component detail',
  },
  {
    id: 'impl-eg',
    source: 'impl',
    target: 'eg',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: 'document — operational steps',
  },
  {
    id: 'impl-readme',
    source: 'impl',
    target: 'readme',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: 'document — env vars · targets',
  },
  {
    id: 'impl-archive',
    source: 'impl',
    target: 'archive',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: '/dev complete',
  },
  {
    id: 'hld-wwa',
    source: 'hld',
    target: 'wwa',
    sourceHandle: 'right-source',
    targetHandle: 'left-target',
    label: 'intent',
  },
  {
    id: 'lld-wwa',
    source: 'lld',
    target: 'wwa',
    sourceHandle: 'right-source',
    targetHandle: 'bottom-target',
    label: 'actual',
  },
  {
    id: 'wwa-ticket',
    source: 'wwa',
    target: 'ticket',
    sourceHandle: 'top-source',
    targetHandle: 'top-target',
    label: 'a surfaced gap becomes a new ticket',
    dashed: true,
  },
];

const HIDDEN = { visibility: 'hidden' as const };

function FlowNode({ data, selected }: NodeProps<Node<FlowNodeData>>) {
  return (
    <div className={`flow-node flow-node--${data.kind}` + (selected ? ' flow-node--selected' : '')}>
      <Handle id="top-target" type="target" position={Position.Top} style={HIDDEN} />
      <Handle id="top-source" type="source" position={Position.Top} style={HIDDEN} />
      <Handle id="right-source" type="source" position={Position.Right} style={HIDDEN} />
      <Handle id="right-target" type="target" position={Position.Right} style={HIDDEN} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} style={HIDDEN} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} style={HIDDEN} />
      <Handle id="left-target" type="target" position={Position.Left} style={HIDDEN} />
      <Handle id="left-source" type="source" position={Position.Left} style={HIDDEN} />
      <span className="flow-node__label">{data.label}</span>
      <span className="flow-node__sub">{data.sub}</span>
    </div>
  );
}

const nodeTypes = { flow: FlowNode };

export function DocsFlowMap() {
  const [selected, setSelected] = useState<string | null>(null);

  const nodes: Node<FlowNodeData>[] = nodeDefs.map((n) => ({
    id: n.id,
    type: 'flow',
    position: { x: n.x, y: n.y },
    selected: n.id === selected,
    data: { label: n.label, sub: n.sub, kind: n.kind, detail: n.detail },
    draggable: false,
    width: W,
    height: H,
  }));

  const flowEdges: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    label: e.label,
    type: 'smoothstep',
    style: {
      stroke: 'var(--line)',
      strokeWidth: 1.5,
      strokeDasharray: e.dashed ? '5 4' : undefined,
    },
    labelStyle: { fill: 'var(--muted)', fontSize: 11 },
    labelBgStyle: { fill: 'var(--bg)', fillOpacity: 0.85 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--subtle)', width: 16, height: 16 },
  }));

  const active = nodeDefs.find((n) => n.id === selected);

  return (
    <>
      <div className="docsflowmap">
        <ReactFlow
          nodes={nodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelected(node.id)}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnScroll
          zoomOnScroll={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color="rgba(255,255,255,0.06)"
          />
        </ReactFlow>
      </div>
      {active && (
        <Modal onClose={() => setSelected(null)}>
          <h3 style={{ margin: '0 0 10px' }}>{active.label}</h3>
          <p className="modal__caption" style={{ margin: 0 }}>
            {active.detail}
          </p>
        </Modal>
      )}
    </>
  );
}
