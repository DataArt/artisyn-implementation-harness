import { ui, series } from '../theme';

/**
 * A skill doesn't teach the model to code — it already knows that.
 * A skill brings what its general knowledge doesn't have: our requirements.
 */
const known = [
  'language and frameworks',
  'patterns and algorithms',
  'how code is written in general',
];
const ours = [
  'where things live in this repo',
  'what we’re migrating and in what order',
  'what’s off-limits to touch',
  'which steps to take and where to stop',
];

const W = 900;
const COL_W = 420;
const R_X = W - COL_W;
const TOP = 22;
const BOX_H = 168;
const OUT_Y = TOP + BOX_H + 40;
const OUT_H = 52;
const H = OUT_Y + OUT_H + 6;

const chip = (t: string) => Math.round(t.length * 6.9 + 24);

function Col({
  x,
  title,
  kicker,
  items,
  accent,
}: {
  x: number;
  title: string;
  kicker: string;
  items: string[];
  accent: boolean;
}) {
  const color = accent ? series[0] : ui.textMuted;
  return (
    <g>
      <text x={x} y={TOP - 8} fontSize={11.5} fontWeight={700} fill={color} letterSpacing="0.04em">
        {kicker}
      </text>
      <rect
        x={x}
        y={TOP}
        width={COL_W}
        height={BOX_H}
        rx={10}
        fill={accent ? '#1A2433' : '#131B26'}
        stroke={accent ? series[0] : '#27313D'}
        strokeWidth={accent ? 1.8 : 1}
      />
      <text
        x={x + 18}
        y={TOP + 32}
        fontSize={19}
        fontWeight={800}
        fill={accent ? series[0] : ui.textSecondary}
        style={{ fontFamily: "'Barlow Condensed', 'Barlow', sans-serif", letterSpacing: '0.01em' }}
      >
        {title}
      </text>
      {items.map((t, i) => {
        const w = chip(t);
        const y = TOP + 48 + i * 27;
        return (
          <g key={t}>
            <rect
              x={x + 18}
              y={y}
              width={w}
              height={22}
              rx={5}
              fill="#131B26"
              stroke={accent ? '#bcd6f4' : '#27313D'}
            />
            <text x={x + 18 + 11} y={y + 15} fontSize={12} fill={ui.textSecondary}>
              {t}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function SkillIsRequirements() {
  const midL = COL_W / 2;
  const midR = R_X + COL_W / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <Col
        x={0}
        kicker="ALREADY INSIDE THE MODEL"
        title="General knowledge"
        items={known}
        accent={false}
      />
      <Col
        x={R_X}
        kicker="IT DOESN'T HAVE THIS AND CAN'T"
        title="Our requirements — that's what a skill is"
        items={ours}
        accent
      />

      {[midL, midR].map((x, i) => (
        <g key={x}>
          <line
            x1={x}
            x2={x}
            y1={TOP + BOX_H}
            y2={OUT_Y - 9}
            stroke={i === 1 ? series[0] : '#718399'}
            strokeWidth={i === 1 ? 2.4 : 1.8}
          />
          <path
            d={`M ${x - 4.5} ${OUT_Y - 10} L ${x + 4.5} ${OUT_Y - 10} L ${x} ${OUT_Y - 2} Z`}
            fill={i === 1 ? series[0] : '#718399'}
          />
        </g>
      ))}

      <rect x={0} y={OUT_Y} width={W} height={OUT_H} rx={10} fill="#131B26" stroke="#718399" />
      <text
        x={W / 2}
        y={OUT_Y + 32}
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        fill={ui.textPrimary}
      >
        Code that fits this exact project — right the first time, and the same for everyone
      </text>
    </svg>
  );
}
