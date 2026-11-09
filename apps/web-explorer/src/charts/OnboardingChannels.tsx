import { ui, series } from '../theme';

/**
 * Companion to OnboardingCompare: not where conventions live, but which
 * channels a person actually has to go through to get them. Left: three
 * separate channels, each one a chance to be stale or unreachable. Right:
 * one channel — the agent already read the other three for you.
 */
const W = 900;
const H = 300;
const COL_W = 424;
const RX = W - COL_W;

const NODE_H = 46;
const CH_W = 118;
const PERSON_W = 150;

const SOURCES = ['Jira', 'Context files', 'Skills', 'Arch docs', 'Tools'];

function PersonIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x + 9} cy={y + 11} r={2.6} fill="none" stroke={color} strokeWidth={1.3} />
      <path
        d={`M ${x + 4} ${y + 20} C ${x + 4} ${y + 15.5}, ${x + 14} ${y + 15.5}, ${x + 14} ${y + 20}`}
        fill="none"
        stroke={color}
        strokeWidth={1.3}
      />
    </g>
  );
}

function RobotIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <rect
        x={x + 2}
        y={y + 7}
        width={12}
        height={9}
        rx={2.5}
        fill="none"
        stroke={color}
        strokeWidth={1.3}
      />
      <circle cx={x + 5.5} cy={y + 11.5} r={1} fill={color} />
      <circle cx={x + 10.5} cy={y + 11.5} r={1} fill={color} />
      <line x1={x + 8} y1={y + 7} x2={x + 8} y2={y + 4} stroke={color} strokeWidth={1.3} />
      <circle cx={x + 8} cy={y + 3.2} r={1} fill={color} />
    </g>
  );
}

function Node({
  x,
  y,
  w,
  title,
  sub,
  tone = 'plain',
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  sub?: string;
  tone?: 'plain' | 'human' | 'store' | 'agent';
}) {
  const fill = tone === 'store' ? '#1A2433' : '#131B26';
  const stroke = tone === 'store' ? '#a8c8ee' : '#718399';
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={NODE_H}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.4}
      />
      {tone === 'human' && <PersonIcon x={x + 8} y={y + 4} color={ui.textSecondary} />}
      {tone === 'agent' && <RobotIcon x={x + 8} y={y + 4} color={ui.textSecondary} />}
      <text
        x={x + w / 2}
        y={sub ? y + 20 : y + 28}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill={ui.textPrimary}
      >
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 36} textAnchor="middle" fontSize={11} fill={ui.textSecondary}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Chip({ x, y, w, label }: { x: number; y: number; w: number; label: string }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={22}
        rx={6}
        fill="#0F151D"
        stroke="#718399"
        strokeWidth={1.2}
      />
      <text
        x={x + w / 2}
        y={y + 14.5}
        textAnchor="middle"
        fontSize={9.5}
        fontWeight={600}
        fill={ui.textSecondary}
      >
        {label}
      </text>
    </g>
  );
}

function Diag({
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
  const my = (y1 + y2) / 2;
  return (
    <g>
      <path
        d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2 - 8}`}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray="5 4"
      />
      <path d={`M ${x2 - 4.5} ${y2 - 8} L ${x2} ${y2} L ${x2 + 4.5} ${y2 - 8} Z`} fill={color} />
    </g>
  );
}

export function OnboardingChannels() {
  const rowA = 54;
  const rowC = 220;

  const c1 = 20;
  const c2 = 156;
  const c3 = 292;
  const lPerson = (COL_W - PERSON_W) / 2;
  const lPersonMid = lPerson + PERSON_W / 2;

  const rPerson = RX + (COL_W - PERSON_W) / 2;
  const rAgent = RX + (COL_W - PERSON_W) / 2;
  const rAgentMid = rAgent + PERSON_W / 2;

  const chipY = 44;
  const chipH = 22;
  const rAgentY = 100;
  const rPersonY = rowC;
  const chipW = 74;
  const chipGap = 10;
  const chipsStartX = RX + (COL_W - (SOURCES.length * chipW + (SOURCES.length - 1) * chipGap)) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={RX - 26} x2={RX - 26} y1={16} y2={H - 24} stroke="#27313D" strokeWidth={1.5} />

      <text x={0} y={26} fontSize={13} fontWeight={800} fill={ui.textMuted}>
        How getting started used to work
      </text>
      <Node x={c1} y={rowA} w={CH_W} title="README" sub="often out of date" tone="store" />
      <Node x={c2} y={rowA} w={CH_W} title="Confluence" sub="rarely opened" tone="store" />
      <Node x={c3} y={rowA} w={CH_W} title="Colleague" sub="if you catch them" tone="human" />
      <Diag x1={c1 + CH_W / 2} y1={rowA + NODE_H} x2={lPersonMid} y2={rowC} color={ui.textMuted} />
      <Diag x1={c2 + CH_W / 2} y1={rowA + NODE_H} x2={lPersonMid} y2={rowC} color={ui.textMuted} />
      <Diag x1={c3 + CH_W / 2} y1={rowA + NODE_H} x2={lPersonMid} y2={rowC} color={ui.textMuted} />
      <Node
        x={lPerson}
        y={rowC}
        w={PERSON_W}
        title="New person"
        sub="pieces it together"
        tone="human"
      />
      <text x={0} y={H - 8} fontSize={11.5} fill={ui.textSecondary}>
        Three channels, three chances to be stale, wrong, or just unreachable.
      </text>

      <text x={RX} y={26} fontSize={13} fontWeight={800} fill={ui.textPrimary}>
        How it works now
      </text>
      {SOURCES.map((label, i) => {
        const cx = chipsStartX + i * (chipW + chipGap);
        return (
          <g key={label}>
            <Diag
              x1={cx + chipW / 2}
              y1={chipY + chipH}
              x2={rAgentMid}
              y2={rAgentY}
              color={series[1]}
            />
            <Chip x={cx} y={chipY} w={chipW} label={label} />
          </g>
        );
      })}
      <Node
        x={rAgent}
        y={rAgentY}
        w={PERSON_W}
        title="Agent"
        sub="already read the repo"
        tone="agent"
      />
      <Diag
        x1={rAgentMid}
        y1={rAgentY + NODE_H}
        x2={rPerson + PERSON_W / 2}
        y2={rPersonY}
        color={series[1]}
      />
      <Node x={rPerson} y={rPersonY} w={PERSON_W} title="New person" sub="just asks" tone="human" />
      <text x={RX} y={H - 8} fontSize={11.5} fill={ui.textSecondary}>
        One channel. No README, no Confluence, no waiting for a colleague.
      </text>
    </svg>
  );
}
