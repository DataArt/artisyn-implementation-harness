import { useState } from 'react';
import { ui, series } from '../theme';

type Pass = { title: string; who: string; verdicts: string; tip: string };

const passes: Pass[] = [
  {
    title: 'Correctness and simplification',
    who: 'built-in review — live, not a methodology copied into a skill',
    verdicts: 'Confirmed · Plausible',
    tip: 'Looks for what will break: edge cases, lost branches, unnecessary complexity. Every finding must name a failure scenario — otherwise it can neither be accepted nor refuted.',
  },
  {
    title: 'Layer conventions',
    who: '@backend-dev · @frontend-dev · @data — whichever layer is touched does the check',
    verdicts: 'Must fix · Discretionary',
    tip: 'The layer specialist reads the diff with its own rules in context and quotes the violated rule verbatim. The main session never loads these rules.',
  },
  {
    title: 'Architecture alignment',
    who: '@architect — when the diff is large enough for this to matter',
    verdicts: 'Must fix · Discretionary',
    tip: 'Checks the change against the HLD and LLD: does it blur a layer boundary, does it introduce a second source of truth.',
  },
];

const W = 900;
const LANE_H = 62;
const LANE_GAP = 12;
const STACK_TOP = 28;
const STACK_H = passes.length * LANE_H + (passes.length - 1) * LANE_GAP;
const STACK_BOT = STACK_TOP + STACK_H;

const IN_W = 112;
const IN_H = 64;
const IN_Y = STACK_TOP + (STACK_H - IN_H) / 2;

const LANE_X = 150;
const OUT_X = 702;
const OUT_W = W - OUT_X;
const LANE_W = OUT_X - LANE_X - 36;
const OUT_H = 108;
const OUT_Y = STACK_TOP + (STACK_H - OUT_H) / 2;

const OPT_Y = STACK_BOT + 34;
const OPT_H = 50;
const H = OPT_Y + OPT_H + 6;

const laneY = (i: number) => STACK_TOP + i * (LANE_H + LANE_GAP);

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <path
        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2 - 9} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <path
        d={`M ${x2 - 9} ${y2 - 4.5} L ${x2 - 1} ${y2} L ${x2 - 9} ${y2 + 4.5} Z`}
        fill={color}
      />
    </g>
  );
}

export function XrayAnatomy() {
  const [sel, setSel] = useState<number | null>(null);
  const inCy = IN_Y + IN_H / 2;
  const outCy = OUT_Y + OUT_H / 2;

  return (
    <>
      <svg viewBox={`-3 0 ${W + 6} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* diff → passes */}
        {passes.map((p, i) => (
          <Arrow
            key={`in-${p.title}`}
            x1={IN_W}
            y1={inCy}
            x2={LANE_X}
            y2={laneY(i) + LANE_H / 2}
            color="#1A2433"
          />
        ))}
        {/* passes → report */}
        {passes.map((p, i) => (
          <Arrow
            key={`out-${p.title}`}
            x1={LANE_X + LANE_W}
            y1={laneY(i) + LANE_H / 2}
            x2={OUT_X}
            y2={outCy}
            color="#1A2433"
          />
        ))}

        <text
          x={LANE_X + LANE_W / 2}
          y={16}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={series[0]}
        >
          three independent passes — in parallel, each with its own context
        </text>

        {/* input */}
        <rect x={0} y={IN_Y} width={IN_W} height={IN_H} rx={9} fill="#1A2433" stroke="#b6cef2" />
        <text
          x={IN_W / 2}
          y={IN_Y + 28}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill="#1d4ed8"
        >
          Diff
        </text>
        <text
          x={IN_W / 2}
          y={IN_Y + 46}
          textAnchor="middle"
          fontSize={11.5}
          fill={ui.textSecondary}
        >
          branch or PR
        </text>

        {/* passes */}
        {passes.map((p, i) => {
          const y = laneY(i);
          return (
            <g
              key={p.title}
              style={{ cursor: 'pointer' }}
              onClick={() => setSel((cur) => (cur === i ? null : i))}
            >
              <rect
                x={LANE_X}
                y={y}
                width={LANE_W}
                height={LANE_H}
                rx={8}
                fill={sel === i ? '#1A2433' : '#131B26'}
                stroke={sel === i ? '#a8c8ee' : '#718399'}
                strokeWidth={sel === i ? 1.6 : 1}
              />
              <rect x={LANE_X} y={y} width={4} height={LANE_H} rx={2} fill={series[0]} />
              <text
                x={LANE_X + 16}
                y={y + 25}
                fontSize={13.5}
                fontWeight={700}
                fill={ui.textPrimary}
              >
                {p.title}
              </text>
              <text
                x={LANE_X + LANE_W - 14}
                y={y + 25}
                textAnchor="end"
                fontSize={11.5}
                fontWeight={600}
                fill={ui.textMuted}
              >
                {p.verdicts}
              </text>
              <text x={LANE_X + 16} y={y + 45} fontSize={12} fill={ui.textSecondary}>
                {p.who}
              </text>
              <text
                x={LANE_X + LANE_W - 14}
                y={y + 45}
                textAnchor="end"
                fontSize={11}
                fill={sel === i ? '#1d4ed8' : ui.textFaint}
              >
                {sel === i ? 'hide' : 'what it looks for →'}
              </text>
            </g>
          );
        })}

        {/* report */}
        <rect
          x={OUT_X}
          y={OUT_Y}
          width={OUT_W}
          height={OUT_H}
          rx={9}
          fill="#1A2433"
          stroke="#a8c8ee"
          strokeWidth={1.6}
        />
        <text
          x={OUT_X + OUT_W / 2}
          y={OUT_Y + 28}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill={ui.textPrimary}
        >
          One report
        </text>
        {[
          'finding = verdict, location,',
          'substance, and failure scenario.',
          'The engineer decides next',
        ].map((ln, i) => (
          <text
            key={ln}
            x={OUT_X + OUT_W / 2}
            y={OUT_Y + 50 + i * 16}
            textAnchor="middle"
            fontSize={12}
            fill={ui.textSecondary}
          >
            {ln}
          </text>
        ))}

        {/* optional step */}
        <path
          d={`M ${OUT_X + OUT_W / 2} ${OUT_Y + OUT_H + 4} L ${OUT_X + OUT_W / 2} ${OPT_Y + OPT_H / 2} L ${LANE_X + LANE_W + 9} ${OPT_Y + OPT_H / 2}`}
          fill="none"
          stroke={ui.textMuted}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <path
          d={`M ${LANE_X + LANE_W + 9} ${OPT_Y + OPT_H / 2 - 4.5} L ${LANE_X + LANE_W + 1} ${OPT_Y + OPT_H / 2} L ${LANE_X + LANE_W + 9} ${OPT_Y + OPT_H / 2 + 4.5} Z`}
          fill={ui.textMuted}
        />
        <rect
          x={0}
          y={OPT_Y}
          width={LANE_X + LANE_W}
          height={OPT_H}
          rx={8}
          fill={ui.surfaceMuted}
          stroke={ui.textFaint}
          strokeDasharray="5 4"
        />
        <text x={16} y={OPT_Y + 21} fontSize={12.5} fontWeight={700} fill={ui.textSecondary}>
          Optional
        </text>
        <text x={16} y={OPT_Y + 39} fontSize={12} fill={ui.textSecondary}>
          verify findings live in the browser and build an interactive HTML report — the one that
          opens from the link below
        </text>
      </svg>
      {sel !== null && (
        <div className="xray-detail">
          <div className="xray-detail__title">{passes[sel].title}</div>
          <p className="xray-detail__body">{passes[sel].tip}</p>
        </div>
      )}
    </>
  );
}
