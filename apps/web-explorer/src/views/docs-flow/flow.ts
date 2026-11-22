import sceneData from './scene.json';
import e2e from './scenarios/e2e.json';
import design from './scenarios/design.json';
import impl from './scenarios/impl.json';
import deviation from './scenarios/deviation.json';
import nextStage from './scenarios/next-stage.json';

/**
 * Adopted wholesale from a developer-supplied prototype (artisyn-web-explorer-v4)
 * that solves the one thing an auto-layout graph library can't be told to do:
 * every edge is a hand-authored SVG path, not a computed route, so the
 * approval loop stays clear of History, implementation outputs get their own
 * lanes, and the deviation feedback loop runs outside the right perimeter —
 * on purpose, not by luck. No @xyflow/react on this page; canvas rendering
 * in DocsFlow.tsx is plain positioned divs + inline SVG, ported from that
 * prototype's App.tsx. Content is grounded in the same real sources as the
 * rest of this app — docs/Engineering Guide/Lifecycles/05 Documents Flow.md
 * and 01 Dev Lifecycle.md / 02 Design Lifecycle.md — with the workflow nodes
 * named /design and /dev, matching every other real command referenced on
 * this site.
 *
 * The scene itself (artifact copy, node coordinates, edge paths) is data,
 * not logic — it lives in scene.json so it can be edited without touching
 * this file.
 */

export type Kind = 'input' | 'command' | 'state' | 'output' | 'document' | 'gate' | 'system';
export type Artifact = {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  kind: Kind;
  description: string;
  details: string[];
  markdown: string;
  path: string;
  children?: string[];
};

export type SceneNode = { id: string; x: number; y: number; w: number; h: number };
export type SceneEdge = {
  id: string;
  step: number;
  source: string;
  target: string;
  label: string;
  path: string;
  lx: number;
  ly: number;
};
export type Pillar = { id: string; label: string; x: number; y: number };

type Scene = {
  width: number;
  height: number;
  artifacts: Record<string, Artifact>;
  nodes: SceneNode[];
  edges: SceneEdge[];
  pillars: Pillar[];
  dividers: number[];
};

const scene = sceneData as Scene;

export const artifacts = scene.artifacts;
export const sceneWidth = scene.width;
export const sceneHeight = scene.height;
export const baseNodes = scene.nodes;
export const baseEdges = scene.edges;
export const pillars = scene.pillars;
export const dividers = scene.dividers;

export type Step = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  focus: string[];
  edges: string[];
  selection: string;
};

/**
 * A single master timeline for the whole scene (beats 0–10), in story order —
 * one beat per edge, except the two that fan out two edges at once (approve
 * + publish; record intent + produce code). Scenarios below are just numeric
 * [start, end] ranges over this one array, so editing a beat here updates
 * every scenario that includes it.
 */
export const steps: Step[] = [
  {
    id: 'trigger-design',
    kicker: '00 / TRIGGER',
    title: 'Trigger design',
    description: 'The task system starts /design with requirements.',
    focus: ['tracker', 'design'],
    edges: ['e0'],
    selection: 'requirements',
  },
  {
    id: 'produce-interim',
    kicker: '01 / INTERIM',
    title: 'Produce interim state',
    description: '/design saves working design and solution frames in History State.',
    focus: ['design', 'history', 'hld-design', 'hld-solution'],
    edges: ['e1'],
    selection: 'hld-design',
  },
  {
    id: 'validate-interim',
    kicker: '02 / VALIDATE',
    title: 'Validate interim artifacts',
    description: 'The story-scoped drafts are reviewed at the HITL gate.',
    focus: ['history', 'hitl'],
    edges: ['e2'],
    selection: 'hitl',
  },
  {
    id: 'approve-publish',
    kicker: '03 / PUBLISH',
    title: 'Approve and publish HLD',
    description: 'Approval returns to /design, which publishes Target State (HLD v1).',
    focus: ['hitl', 'design', 'target'],
    edges: ['e3a', 'e3b'],
    selection: 'target',
  },
  {
    id: 'create-impl-tasks',
    kicker: '04 / TASKS',
    title: 'Create implementation tasks',
    description: '/design creates delivery tasks back in the tracking system.',
    focus: ['design', 'tracker'],
    edges: ['e4'],
    selection: 'requirements',
  },
  {
    id: 'trigger-impl',
    kicker: '05 / TRIGGER',
    title: 'Trigger implementation',
    description: 'An implementation task invokes /dev with requirements and context.',
    focus: ['tracker', 'dev'],
    edges: ['e5'],
    selection: 'dev',
  },
  {
    id: 'implement-record',
    kicker: '06 / RECORD',
    title: 'Implement and record intent',
    description: '/dev produces code and writes implementation intent to the story ledger.',
    focus: ['dev', 'code', 'history'],
    edges: ['e6a', 'e6b'],
    selection: 'notes',
  },
  {
    id: 'update-current',
    kicker: '07 / UPDATE',
    title: 'Update current state',
    description: 'Document verified component changes in Current State (LLD).',
    focus: ['dev', 'current'],
    edges: ['e7'],
    selection: 'current',
  },
  {
    id: 'capture-deviation',
    kicker: '08 / DEVIATION',
    title: 'Capture deviations',
    description: 'If the implementation differs from the approved HLD, document the deviation.',
    focus: ['dev', 'target'],
    edges: ['e8'],
    selection: 'target',
  },
  {
    id: 'report-result',
    kicker: '09 / REPORT',
    title: 'Report implementation result',
    description: '/dev reports the outcome back to the tracking system.',
    focus: ['dev', 'tracker'],
    edges: ['e9'],
    selection: 'requirements',
  },
  {
    id: 'handoff-next',
    kicker: '10 / HANDOFF',
    title: 'Handoff to the next stage',
    description: 'The tracking system triggers deployment or testing.',
    focus: ['tracker', 'handoff'],
    edges: ['e10'],
    selection: 'handoff',
  },
];

export type Scenario = {
  id: string;
  label: string;
  desc: string;
  /** Inclusive [start, end] indices into the `steps` master timeline above. */
  start: number;
  end: number;
};

/**
 * Each scenario is its own JSON file under scenarios/ — just a numeric range
 * over the master timeline above, nothing else. A scenario only renders the
 * nodes/edges its range's beats actually touch; everything outside that
 * union is left out of the canvas entirely, not merely dimmed.
 */
export const scenarios: Scenario[] = [e2e, design, impl, deviation, nextStage];
