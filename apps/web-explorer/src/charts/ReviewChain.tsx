import { ui, series } from '../theme';

/**
 * What actually replaced whom in review. The wrong reading of this slide is
 * "human → robot"; the right one is "human → robot + human". The human is not a
 * step that got automated away — the routine under them was.
 */
const W = 900;
const BOX_H = 60;
const ROW_GAP = 74;
const TOP = 30;
const LOOP_DIP = 26;
const H = TOP + BOX_H + ROW_GAP + BOX_H + LOOP_DIP + 14;

function Arrow({ from, to, y }: { from: number; to: number; y: number }) {
  return (
    <g>
      <line x1={from} x2={to - 8} y1={y} y2={y} stroke="#1A2433" strokeWidth={2} />
      <path d={`M ${to - 8} ${y - 4.5} L ${to} ${y} L ${to - 8} ${y + 4.5} Z`} fill="#a8c8ee" />
    </g>
  );
}

/** Runs under the row at right angles: down out of the bottom of one box,
 * across, and up into the bottom of another. The arrowhead lands on `toX`, and
 * on `fromX` too when the traffic goes both ways. */
function LoopBack({
  fromX,
  toX,
  y,
  label,
  both,
}: {
  fromX: number;
  toX: number;
  y: number;
  label: string;
  /** head on both ends — the exchange runs in both directions */
  both?: boolean;
}) {
  const dipY = y + BOX_H + LOOP_DIP;
  const head = (x: number) =>
    `M ${x - 5} ${y + BOX_H + 9} L ${x} ${y + BOX_H + 1} L ${x + 5} ${y + BOX_H + 9} Z`;
  return (
    <g>
      <path
        d={`M ${fromX} ${y + BOX_H + (both ? 9 : 3)} L ${fromX} ${dipY} L ${toX} ${dipY} L ${toX} ${y + BOX_H + 9}`}
        fill="none"
        stroke="#1A2433"
        strokeWidth={2}
        strokeLinejoin="miter"
      />
      {both && <path d={head(fromX)} fill="#a8c8ee" />}
      <path d={head(toX)} fill="#a8c8ee" />
      <text
        x={(fromX + toX) / 2}
        y={dipY - 6}
        textAnchor="middle"
        fontSize={11.5}
        fontWeight={700}
        fill={ui.textMuted}
      >
        {label}
      </text>
    </g>
  );
}

function PersonIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <circle cx={x + 8} cy={y + 5} r={3} fill="none" stroke={color} strokeWidth={1.4} />
      <path
        d={`M ${x + 2} ${y + 17} C ${x + 2} ${y + 11}, ${x + 14} ${y + 11}, ${x + 14} ${y + 17}`}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
      />
    </g>
  );
}

function RobotIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <rect
        x={x}
        y={y + 5}
        width={16}
        height={11}
        rx={3}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
      />
      <circle cx={x + 5} cy={y + 10.5} r={1.2} fill={color} />
      <circle cx={x + 11} cy={y + 10.5} r={1.2} fill={color} />
      <line x1={x + 8} y1={y + 5} x2={x + 8} y2={y + 1.5} stroke={color} strokeWidth={1.4} />
      <circle cx={x + 8} cy={y + 0.5} r={1.2} fill={color} />
    </g>
  );
}

function FileIcon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path
        d={`M ${x + 2} ${y + 1} L ${x + 10} ${y + 1} L ${x + 14} ${y + 5} L ${x + 14} ${y + 17} L ${x + 2} ${y + 17} Z`}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d={`M ${x + 10} ${y + 1} L ${x + 10} ${y + 5} L ${x + 14} ${y + 5}`}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
      />
      <line x1={x + 5} y1={y + 9} x2={x + 11} y2={y + 9} stroke={color} strokeWidth={1.2} />
      <line x1={x + 5} y1={y + 12} x2={x + 11} y2={y + 12} stroke={color} strokeWidth={1.2} />
      <line x1={x + 5} y1={y + 15} x2={x + 9} y2={y + 15} stroke={color} strokeWidth={1.2} />
    </g>
  );
}

function Box({
  x,
  y,
  w,
  title,
  sub,
  tone,
  icon,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  sub?: string;
  tone: 'plain' | 'human' | 'agent';
  /** what this box represents — independent of `tone`, which only drives color */
  icon?: 'human' | 'agent' | 'file';
}) {
  const fill = tone === 'human' ? '#1A2433' : tone === 'agent' ? '#241C0E' : '#131B26';
  const stroke = tone === 'human' ? '#a8c8ee' : tone === 'agent' ? '#f0bfa4' : '#718399';
  const iconColor = icon === 'human' ? series[0] : series[1];
  const textX = x + (icon ? 34 : 14);
  const titleY = sub ? y + 24 : y + BOX_H / 2 + 5;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={BOX_H}
        rx={9}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.4}
      />
      {icon === 'human' && <PersonIcon x={x + 10} y={y + 8} color={iconColor} />}
      {icon === 'agent' && <RobotIcon x={x + 10} y={y + 8} color={iconColor} />}
      {icon === 'file' && <FileIcon x={x + 10} y={y + 8} color={iconColor} />}
      <text x={textX} y={titleY} fontSize={13.5} fontWeight={700} fill={ui.textPrimary}>
        {title}
      </text>
      {sub && (
        <text x={textX} y={y + 43} fontSize={11.5} fill={ui.textSecondary}>
          {sub}
        </text>
      )}
    </g>
  );
}

export function ReviewChain() {
  const y1 = TOP;
  const y2 = TOP + BOX_H + ROW_GAP;
  const gap = 34;

  const authorW = 130;
  const ax = 0;
  const prx = ax + authorW + gap;
  const pr = 118;

  /* Row 1: a single human carrying everything. */
  const b1x = prx + pr + gap;
  const b1w = 300;

  /* Row 2: the chain the change actually walks now — the report is a step of
   * its own, and it is what the reviewer reads. */
  const nowChain: {
    title: string;
    w: number;
    tone: 'plain' | 'human' | 'agent';
    icon?: 'human' | 'agent' | 'file';
  }[] = [
    { title: 'Author', w: 118, tone: 'plain', icon: 'human' },
    { title: 'X-Ray', w: 112, tone: 'agent', icon: 'agent' },
    { title: 'Interactive report', w: 186, tone: 'plain', icon: 'file' },
    { title: 'Pull request', w: 132, tone: 'plain' },
    { title: 'Reviewer', w: 128, tone: 'human', icon: 'human' },
  ];
  let runX = ax;
  const nowBoxes = nowChain.map((b) => {
    const box = { ...b, x: runX };
    runX += b.w + gap;
    return box;
  });
  const lastNow = nowBoxes[nowBoxes.length - 1];

  const authorMidX = ax + authorW / 2;

  return (
    <svg viewBox={`-3 0 ${W + 6} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <text x={0} y={y1 - 9} fontSize={13} fontWeight={800} fill={ui.textMuted}>
        Before
      </text>
      <Box x={ax} y={y1} w={authorW} title="Author" tone="plain" icon="human" />
      <Arrow from={ax + authorW + 2} to={prx - 2} y={y1 + BOX_H / 2} />
      <Box x={prx} y={y1} w={pr} title="Pull request" sub="the diff" tone="plain" />
      <Arrow from={prx + pr + 2} to={b1x - 2} y={y1 + BOX_H / 2} />
      <Box
        x={b1x}
        y={y1}
        w={b1w}
        title="Reviewer"
        sub="the routine first, the decision if there is time"
        tone="human"
        icon="human"
      />
      <LoopBack fromX={b1x + b1w / 2} toX={authorMidX} y={y1} label="holy wars, nerves" both />

      <text x={0} y={y2 - 9} fontSize={13} fontWeight={800} fill={ui.textPrimary}>
        Now
      </text>
      {nowBoxes.map((b, i) => (
        <g key={b.title}>
          {i > 0 && <Arrow from={b.x - gap + 2} to={b.x - 2} y={y2 + BOX_H / 2} />}
          <Box x={b.x} y={y2} w={b.w} title={b.title} tone={b.tone} icon={b.icon} />
        </g>
      ))}
      <LoopBack
        fromX={authorMidX}
        toX={lastNow.x + lastNow.w / 2}
        y={y2}
        label="knowledge transfer"
      />
    </svg>
  );
}
