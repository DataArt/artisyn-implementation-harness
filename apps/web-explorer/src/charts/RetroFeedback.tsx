import { ui, series } from '../theme';

/** Regular retro, feedback collection, and its two outputs. */
const W = 900;
const A_W = 210;
const B_X = 252;
const B_W = 250;
const C_X = 560;
const C_W = W - C_X;
const C_H = 54;
const C1_Y = 30;
const C2_Y = 104;
const MID = (C1_Y + C2_Y + C_H) / 2;
const H = C2_Y + C_H + 8;

function Head({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x - 8} ${y - 4.5} L ${x} ${y} L ${x - 8} ${y + 4.5} Z`} fill="#a8c8ee" />;
}

/** Schematic message: two lines of text in a bubble. */
function Note({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={6} fill="#131B26" stroke="#bcd6f4" />
      <line
        x1={x + 10}
        x2={x + w - 14}
        y1={y + 10}
        y2={y + 10}
        stroke="#1A2433"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={x + 10}
        x2={x + w - 34}
        y1={y + 18}
        y2={y + 18}
        stroke="#1A2433"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

function Out({ y, title, note }: { y: number; title: string; note: string }) {
  return (
    <g>
      <rect x={C_X} y={y} width={C_W} height={C_H} rx={9} fill="#131B26" stroke={ui.border} />
      <text x={C_X + 16} y={y + 23} fontSize={14.5} fontWeight={700} fill={ui.textPrimary}>
        {title}
      </text>
      <text x={C_X + 16} y={y + 41} fontSize={11.5} fill={ui.textMuted}>
        {note}
      </text>
    </g>
  );
}

export function RetroFeedback() {
  const elbow = 530;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* retro */}
      <rect x={0} y={MID - 38} width={A_W} height={76} rx={10} fill="#131B26" stroke={ui.border} />
      <text
        x={A_W / 2}
        y={MID - 6}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill={ui.textPrimary}
      >
        Retrospective
      </text>
      <text x={A_W / 2} y={MID + 14} textAnchor="middle" fontSize={12} fill={ui.textMuted}>
        regularly, at the end of the cycle
      </text>

      <line x1={A_W + 4} x2={B_X - 12} y1={MID} y2={MID} stroke="#1A2433" strokeWidth={2} />
      <Head x={B_X - 2} y={MID} />

      {/* feedback collection */}
      <rect
        x={B_X}
        y={MID - 58}
        width={B_W}
        height={116}
        rx={10}
        fill="#1A2433"
        stroke={series[0]}
        strokeWidth={1.8}
      />
      <text
        x={B_X + B_W / 2}
        y={MID - 34}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill={series[0]}
      >
        Feedback collection
      </text>
      <Note x={B_X + 24} y={MID - 20} w={B_W - 48} />
      <Note x={B_X + 24} y={MID + 12} w={B_W - 48} />

      {/* fork into two outputs — right angles, no curves */}
      <path
        d={`M ${B_X + B_W + 4} ${MID} H ${elbow} V ${C1_Y + C_H / 2} H ${C_X - 12}`}
        fill="none"
        stroke="#1A2433"
        strokeWidth={2}
      />
      <Head x={C_X - 2} y={C1_Y + C_H / 2} />
      <path
        d={`M ${B_X + B_W + 4} ${MID} H ${elbow} V ${C2_Y + C_H / 2} H ${C_X - 12}`}
        fill="none"
        stroke="#1A2433"
        strokeWidth={2}
      />
      <Head x={C_X - 2} y={C2_Y + C_H / 2} />

      <Out y={C1_Y} title="Where we're headed" note="feeds into reflections and skills" />
      <Out y={C2_Y} title="How the team feels" note="what task reports don't show" />
    </svg>
  );
}
