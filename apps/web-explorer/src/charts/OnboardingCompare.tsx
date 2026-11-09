import { ui, series } from '../theme';

/**
 * Where project conventions live, before and after. Left: conventions living
 * in two people's heads, retold by hand to every new person. Right: the same
 * conventions written down once, in skills — a new person reads that
 * directly instead of waiting for someone to explain it.
 */
const W = 900;
const H = 316;
const COL_W = 424;
const RX = W - COL_W;

const NODE_W = 150;
const NODE_H = 46;

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

function PersonAgentNode({ x, y, w }: { x: number; y: number; w: number }) {
  const half = w / 2;
  return (
    <g>
      <defs>
        <clipPath id="onboarding-compare-pa-clip">
          <rect x={x} y={y} width={w} height={NODE_H} rx={8} />
        </clipPath>
      </defs>
      <g clipPath="url(#onboarding-compare-pa-clip)">
        <rect x={x} y={y} width={half} height={NODE_H} fill="#131B26" />
        <rect x={x + half} y={y} width={half} height={NODE_H} fill="#1A2433" />
      </g>
      <rect
        x={x}
        y={y}
        width={w}
        height={NODE_H}
        rx={8}
        fill="none"
        stroke="#718399"
        strokeWidth={1.4}
      />
      <line x1={x + half} x2={x + half} y1={y} y2={y + NODE_H} stroke="#718399" strokeWidth={1.2} />
      <PersonIcon x={x + 8} y={y + 4} color={ui.textSecondary} />
      <RobotIcon x={x + half + 8} y={y + 4} color={ui.textSecondary} />
      <text
        x={x + half / 2}
        y={y + 20}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill={ui.textPrimary}
      >
        New person
      </text>
      <text
        x={x + half + half / 2}
        y={y + 20}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill={ui.textPrimary}
      >
        Agent
      </text>
      <text x={x + w / 2} y={y + 36} textAnchor="middle" fontSize={11} fill={ui.textSecondary}>
        up to speed, instantly
      </text>
    </g>
  );
}

function Node({
  x,
  y,
  w = NODE_W,
  title,
  sub,
  tone = 'plain',
}: {
  x: number;
  y: number;
  w?: number;
  title: string;
  sub?: string;
  tone?: 'plain' | 'human' | 'store' | 'agent';
}) {
  const fill =
    tone === 'store'
      ? '#1A2433'
      : tone === 'agent'
        ? '#241C0E'
        : tone === 'human'
          ? '#131B26'
          : '#0F151D';
  const stroke = tone === 'store' ? '#a8c8ee' : tone === 'agent' ? '#f0bfa4' : '#718399';
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
  // arrowhead base sits 8px back from the tip, on whichever side the line is arriving from
  const dir = y2 >= y1 ? 1 : -1;
  const baseY = y2 - 8 * dir;
  return (
    <g>
      <path
        d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${baseY}`}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeDasharray="5 4"
      />
      <path d={`M ${x2 - 4.5} ${baseY} L ${x2} ${y2} L ${x2 + 4.5} ${baseY} Z`} fill={color} />
    </g>
  );
}

export function OnboardingCompare() {
  const rowA = 54;
  const rowB = 148;
  const rowC = 242;

  const lSenior1 = 26;
  const lSenior2 = 210;
  const lNew = 118;

  const rSenior1 = RX + 30;
  const rSenior2 = RX + 190;
  const rStore = RX + 96;
  const rOutW = NODE_W + 72;
  const rOut = rStore;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={RX - 26} x2={RX - 26} y1={16} y2={H - 24} stroke="#27313D" strokeWidth={1.5} />

      <text x={0} y={26} fontSize={13} fontWeight={800} fill={ui.textMuted}>
        How onboarding used to work
      </text>
      <Node x={lSenior1} y={rowA} title="Senior" sub="conventions in their head" tone="human" />
      <Node x={lSenior2} y={rowA} title="Senior" sub="conventions in their head" tone="human" />
      <Diag
        x1={lSenior1 + NODE_W / 2}
        y1={rowA + NODE_H}
        x2={lNew + NODE_W / 2}
        y2={rowC}
        color={ui.textMuted}
      />
      <Diag
        x1={lSenior2 + NODE_W / 2}
        y1={rowA + NODE_H}
        x2={lNew + NODE_W / 2}
        y2={rowC}
        color={ui.textMuted}
      />
      <rect x={lNew - 24} y={rowB + 6} width={NODE_W + 48} height={38} rx={6} fill="#131B26" />
      <text
        x={lNew + NODE_W / 2}
        y={rowB + 22}
        textAnchor="middle"
        fontSize={11.5}
        fontWeight={700}
        fill={ui.textMuted}
      >
        told by hand
      </text>
      <text
        x={lNew + NODE_W / 2}
        y={rowB + 38}
        textAnchor="middle"
        fontSize={11.5}
        fill={ui.textMuted}
      >
        again for every new person
      </text>
      <Node x={lNew} y={rowC} title="New person" sub="learns it over weeks" tone="human" />

      <text x={RX} y={26} fontSize={13} fontWeight={800} fill={ui.textPrimary}>
        How it works now
      </text>
      <Node x={rSenior1} y={rowA} title="Senior" sub="something worth keeping" tone="human" />
      <Node x={rSenior2} y={rowA} title="Senior" sub="something worth keeping" tone="human" />
      <Diag
        x1={rSenior1 + NODE_W / 2}
        y1={rowA + NODE_H}
        x2={rStore + (NODE_W + 72) / 2}
        y2={rowB}
        color={series[0]}
      />
      <Diag
        x1={rSenior2 + NODE_W / 2}
        y1={rowA + NODE_H}
        x2={rStore + (NODE_W + 72) / 2}
        y2={rowB}
        color={series[0]}
      />
      <Node
        x={rStore}
        y={rowB}
        w={NODE_W + 72}
        title="skills/ in the repository"
        sub="written once, reviewed like code"
        tone="store"
      />
      <Diag
        x1={rStore + (NODE_W + 72) / 2}
        y1={rowB + NODE_H}
        x2={rOut + rOutW / 2}
        y2={rowC}
        color={series[0]}
      />
      <PersonAgentNode x={rOut} y={rowC} w={rOutW} />
    </svg>
  );
}
