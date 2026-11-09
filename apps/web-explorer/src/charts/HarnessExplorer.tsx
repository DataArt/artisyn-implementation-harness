import { useState } from 'react';
import { ui, series } from '../theme';
import { Glyph, type GlyphName } from '../components/glyphs';
import { LoopDiagram, type LoopNode, type LoopFeed } from './LoopDiagram';

/**
 * Bird's-eye view of the harness plus a drill-down into the selected cycle.
 * Clicking a block reveals its phases below — every cycle gets the same depth,
 * not "development is fully mapped out, everything else is just chips."
 */
type Cycle = {
  key: string;
  title: string;
  purpose: string;
  icon: GlyphName;
  entry: string;
  nodes: LoopNode[];
  below?: LoopNode;
  feeds?: LoopFeed[];
  /** one line under the diagram — for what doesn't fit in the box labels */
  note?: string;
  /** covered elsewhere in the deck — shown dimmed, not part of this pillar's story */
  outOfScope?: boolean;
};

const cycles: Cycle[] = [
  {
    key: 'design',
    title: 'Solution Design',
    purpose:
      'turn a problem statement into a justified decision and tickets — before a single line of code is written',
    icon: 'prototype',
    entry: '/design',
    nodes: [
      { id: 'frame', label: 'Frame', sub: 'problem and criteria' },
      { id: 'research', label: 'Research', sub: 'solution options' },
      { id: 'elaborate', label: 'Elaborate', sub: 'matrix and WAF' },
      { id: 'solution', label: 'Solution', sub: 'architecture and estimate' },
      { id: 'review', label: 'Review', sub: 'solution review' },
      { id: 'publish', label: 'Publish', sub: 'tickets and HLD' },
    ],
  },
  {
    key: 'dev',
    title: 'Development',
    purpose: 'take one ticket from plan to closed story, pausing for human confirmation',
    icon: 'code',
    entry: '/dev',
    nodes: [
      { id: 'plan', label: 'Plan', sub: 'plan + criteria' },
      { id: 'impl', label: 'Implement', sub: 'one step at a time' },
      { id: 'test', label: 'Test', sub: 'tests + PR review' },
      { id: 'doc', label: 'Document', sub: 'docs in the same task' },
    ],
    note: 'The plan is saved to 1-plan.md and becomes immutable; the report is written alongside it in 2-report.md. A month later, you can see not just what was done, but what was intended — and where the two diverged.',
  },
  {
    key: 'review',
    title: 'Review',
    purpose: 'take the routine off the human and leave them the conversation about the decision',
    icon: 'review',
    entry: '/x-ray',
    outOfScope: true,
    nodes: [
      { id: 'corr', label: 'correctness', sub: 'edge cases and unnecessary complexity' },
      { id: 'conv', label: 'conventions', sub: 'each layer checked by its specialist' },
      { id: 'arch', label: 'architecture', sub: '@architect, if the diff is large' },
      { id: 'out', label: 'report', sub: 'verdict and failure scenario' },
    ],
  },
  {
    key: 'qa',
    title: 'QA',
    purpose: "verify the product against requirements, not the developer's gut feeling",
    icon: 'tested',
    entry: '/qa',
    outOfScope: true,
    nodes: [
      { id: 'an', label: '/qa-analyst', sub: 'gaps in requirements' },
      { id: 'suite', label: 'test suite', sub: 'UI, negative, calculations, data' },
      { id: 'zephyr', label: 'Zephyr', sub: 'run against the live app' },
      { id: 'bug', label: '/qa-bug-reporter', sub: 'bug from a template' },
    ],
  },
  {
    key: 'arch',
    title: 'Architecture and Audit',
    purpose:
      "track the gap between what's designed and what's built — run after the design and after the implementation, independently of both",
    icon: 'layers',
    entry: '/war',
    nodes: [
      { id: 'wd', label: 'WAR Design', sub: 'after design: is the intent itself sound' },
      {
        id: 'wi',
        label: 'WAR Implementation',
        sub: 'after implementation: is what got built sound',
      },
      { id: 'wwa', label: 'Where We Are', sub: 'gap: intent — code — documentation' },
    ],
    note: 'The audit is not a gate in front of the work — it is a separate pass over it. It runs on the design once there is a design to audit, and on the implementation once there is an implementation, and neither run depends on the other. What /where-we-are is for, since it is the least self-evident command here: it shows the difference between what was designed at the high level and what actually got implemented and documented — HLD against LLD, in one report. It earns its keep while you are actively designing. Once several runs in a row come back clean, that means no new architectural decisions have landed, and it is honest to stop running it until they do.',
  },
  {
    key: 'data',
    title: 'Data',
    purpose: 'keep in order what the product is actually made of',
    icon: 'database',
    entry: '/sf',
    outOfScope: true,
    nodes: [
      { id: 'sf', label: '/sf', sub: 'ask the warehouse a question in plain words' },
      { id: 'cat', label: '/data-catalog', sub: "catalog built from an analyst's screenshots" },
      {
        id: 'impl',
        label: '/data-catalog-impl',
        sub: 'checked against the schema before implementation',
      },
    ],
  },
  {
    key: 'skills',
    title: 'Skill Lifecycle',
    purpose:
      'turn what tripped us up into a rule that then enforces itself; evolve is the skill that runs the whole lifecycle below, and an obvious convention can land straight in skills/ or agents/ without a draft at all',
    icon: 'loop',
    entry: '/evolve reflect',
    nodes: [
      { id: 'refl', label: '/evolve reflect', sub: 'what surprised us after the ticket' },
      { id: 'tri', label: '/evolve triage', sub: 'new → draft/, existing → updated on the spot' },
      { id: 'prom', label: '/evolve adopt', sub: 'after ~a week: draft → working skill' },
    ],
    below: {
      id: 'store',
      label: 'skills/ · agents/',
      sub: 'permanent Claude skills and agents',
    },
    feeds: [
      { from: 1, label: 'updates existing' },
      { from: 2, label: 'creates new', into: 'right' },
    ],
  },
];

const byKey = (k: string) => cycles.find((c) => c.key === k)!;

const W = 900;
const BOX_W = 196;
const BOX_H = 68;
const CHAIN_GAP = 38;
const SUP_H = 50;
const SUP_Y = 14;
const CHAIN_Y = 96;
const COLL_Y = 206;
const BAND_Y = 230;
const BAND_H = 62;
const H = BAND_Y + BAND_H + 4;

const chainKeys = ['design', 'dev', 'review', 'qa'];
/** The rail the audit collects design and implementation on, above the chain. */
const AUDIT_BUS_Y = 80;
const cx = (i: number) => i * (BOX_W + CHAIN_GAP);

function Arrow({ x, y, color }: { x: number; y: number; color: string }) {
  return <path d={`M ${x - 8} ${y - 4.5} L ${x} ${y} L ${x - 8} ${y + 4.5} Z`} fill={color} />;
}

function DownArrow({ x, y, color }: { x: number; y: number; color: string }) {
  return <path d={`M ${x - 4.5} ${y - 8} L ${x + 4.5} ${y - 8} L ${x} ${y} Z`} fill={color} />;
}

function UpArrow({ x, y, color }: { x: number; y: number; color: string }) {
  return <path d={`M ${x - 4.5} ${y + 8} L ${x + 4.5} ${y + 8} L ${x} ${y} Z`} fill={color} />;
}

function Box({
  c,
  x,
  y,
  w,
  h,
  selected,
  onSelect,
}: {
  c: Cycle;
  x: number;
  y: number;
  w: number;
  h: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={selected ? '#1A2433' : c.outOfScope ? '#241C0E' : '#131B26'}
        stroke={selected ? series[0] : c.outOfScope ? '#dccf9a' : '#27313D'}
        strokeWidth={selected ? 2.4 : 1}
      />
      <g
        transform={`translate(${x + 14}, ${y + h / 2 - 11})`}
        style={{ color: selected ? series[0] : ui.textMuted }}
      >
        <Glyph name={c.icon} size={22} />
      </g>
      <text
        x={x + 44}
        y={y + h / 2 - 2}
        fontSize={14}
        fontWeight={700}
        fill={selected ? '#1d4ed8' : ui.textPrimary}
      >
        {c.title}
      </text>
      <text
        x={x + 44}
        y={y + h / 2 + 14}
        fontSize={11}
        fill={ui.textMuted}
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {c.entry}
      </text>
    </g>
  );
}

export function HarnessExplorer() {
  const [sel, setSel] = useState<string | null>(null);
  const active = sel ? byKey(sel) : null;
  const pick = (k: string) => setSel((cur) => (cur === k ? null : k));

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto' }}
        onClick={() => setSel(null)}
      >
        {/* supporting blocks */}
        <Box
          c={byKey('arch')}
          x={0}
          y={SUP_Y}
          w={BOX_W}
          h={SUP_H}
          selected={sel === 'arch'}
          onSelect={() => pick('arch')}
        />
        <Box
          c={byKey('data')}
          x={cx(1)}
          y={SUP_Y}
          w={BOX_W}
          h={SUP_H}
          selected={sel === 'data'}
          onSelect={() => pick('data')}
        />
        {/* Data feeds the work — that one really is an input. */}
        <line
          x1={cx(1) + BOX_W / 2}
          x2={cx(1) + BOX_W / 2}
          y1={SUP_Y + SUP_H}
          y2={CHAIN_Y - 9}
          stroke="#1A2433"
          strokeWidth={2}
        />
        <DownArrow x={cx(1) + BOX_W / 2} y={CHAIN_Y - 1} color="#a8c8ee" />
        <text x={cx(1) + BOX_W / 2 + 9} y={SUP_Y + SUP_H + 20} fontSize={10.5} fill={ui.textFaint}>
          feed the work
        </text>

        {/*
         * The audit is not a gate in front of design. It reads the design once
         * there is one, and the implementation once there is one — so both
         * arrows point up, into the audit, not down out of it.
         */}
        <path
          d={`M ${cx(0) + 46} ${CHAIN_Y - 2} L ${cx(0) + 46} ${AUDIT_BUS_Y} L ${cx(1) + 46} ${AUDIT_BUS_Y} L ${cx(1) + 46} ${CHAIN_Y - 2}`}
          fill="none"
          stroke="#1A2433"
          strokeWidth={2}
        />
        <line
          x1={cx(0) + 46}
          x2={cx(0) + 46}
          y1={AUDIT_BUS_Y}
          y2={SUP_Y + SUP_H + 9}
          stroke="#1A2433"
          strokeWidth={2}
        />
        <UpArrow x={cx(0) + 46} y={SUP_Y + SUP_H + 1} color="#a8c8ee" />
        <text x={cx(0) + 100} y={AUDIT_BUS_Y - 6} fontSize={10.5} fill={ui.textFaint}>
          after design, and after implementation — independent of both
        </text>

        {/* main chain */}
        {chainKeys.map((k, i) => (
          <g key={k}>
            <Box
              c={byKey(k)}
              x={cx(i)}
              y={CHAIN_Y}
              w={BOX_W}
              h={BOX_H}
              selected={sel === k}
              onSelect={() => pick(k)}
            />
            {i < chainKeys.length - 1 && (
              <>
                <line
                  x1={cx(i) + BOX_W + 4}
                  x2={cx(i) + BOX_W + CHAIN_GAP - 10}
                  y1={CHAIN_Y + BOX_H / 2}
                  y2={CHAIN_Y + BOX_H / 2}
                  stroke="#1A2433"
                  strokeWidth={2}
                />
                <Arrow x={cx(i) + BOX_W + CHAIN_GAP - 2} y={CHAIN_Y + BOX_H / 2} color="#a8c8ee" />
              </>
            )}
          </g>
        ))}

        {/* feedback collected into the learning loop */}
        {chainKeys.map((k, i) => (
          <line
            key={`st-${k}`}
            x1={cx(i) + BOX_W / 2}
            x2={cx(i) + BOX_W / 2}
            y1={CHAIN_Y + BOX_H + 2}
            y2={COLL_Y}
            stroke="#718399"
            strokeWidth={1.6}
            strokeDasharray="5 4"
          />
        ))}
        <line
          x1={cx(0) + BOX_W / 2}
          x2={cx(3) + BOX_W / 2}
          y1={COLL_Y}
          y2={COLL_Y}
          stroke="#718399"
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        <line
          x1={W / 2}
          x2={W / 2}
          y1={COLL_Y}
          y2={BAND_Y - 9}
          stroke="#718399"
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        <DownArrow x={W / 2} y={BAND_Y - 1} color={ui.textMuted} />
        <text x={W / 2 + 12} y={COLL_Y + 16} fontSize={10.5} fill={ui.textFaint}>
          every cycle ends here — and comes back as a rule
        </text>

        <Box
          c={byKey('skills')}
          x={0}
          y={BAND_Y}
          w={W}
          h={BAND_H}
          selected={sel === 'skills'}
          onSelect={() => pick('skills')}
        />
      </svg>

      <div className="hx">
        {active ? (
          <>
            <div className="hx__head">
              <span className="hx__icon">
                <Glyph name={active.icon} size={24} />
              </span>
              <div>
                <div className="hx__title">
                  {active.title} <code>{active.entry}</code>
                </div>
                <div className="hx__purpose">{active.purpose}</div>
              </div>
            </div>
            <LoopDiagram nodes={active.nodes} below={active.below} feeds={active.feeds} />
            {active.note && <p className="hx__note">{active.note}</p>}
          </>
        ) : (
          <div className="hx__empty">Select a block to see the cycle details</div>
        )}
      </div>
    </div>
  );
}
