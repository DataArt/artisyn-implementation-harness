import { ui, series } from '../theme';

/**
 * The infrastructure cycle next to the product one. The point of the picture is
 * how little differs: the same plan, the same review, the same documentation
 * step — and one structural change at the end, where the command that touches
 * live infrastructure is executed by a person rather than by the agent.
 */
const W = 900;
const BOX_H = 58;
const LAB_W = 92;
const TOP = 26;
const ROW_GAP = 78;
const H = TOP + BOX_H + ROW_GAP + BOX_H + 92;

type Step = { label: string; sub: string; human?: boolean };

const product: Step[] = [
  { label: '/dev-plan', sub: 'plan + criteria' },
  { label: 'implement', sub: 'TypeScript' },
  { label: 'tests', sub: 'automated' },
  { label: 'PR review', sub: 'agent + human' },
  { label: 'merge', sub: 'pipeline deploys' },
];

const infra: Step[] = [
  { label: '/dev-plan', sub: 'plan + criteria' },
  { label: 'implement', sub: 'IaC (Terraform/CDK)' },
  { label: 'plan', sub: 'the diff, as output' },
  { label: 'PR review', sub: 'agent + human' },
  { label: 'apply', sub: 'run by a person', human: true },
];

function Row({
  steps,
  y,
  label,
  bold,
}: {
  steps: Step[];
  y: number;
  label: string;
  bold: boolean;
}) {
  const gap = 16;
  const boxW = (W - LAB_W - gap * (steps.length - 1)) / steps.length;
  const bx = (i: number) => LAB_W + i * (boxW + gap);
  return (
    <g>
      <text
        x={0}
        y={y + BOX_H / 2 + 5}
        fontSize={13}
        fontWeight={800}
        fill={bold ? ui.textPrimary : ui.textMuted}
      >
        {label}
      </text>
      {steps.map((s, i) => (
        <g key={s.label + i}>
          <rect
            x={bx(i)}
            y={y}
            width={boxW}
            height={BOX_H}
            rx={8}
            fill={s.human ? '#1A2433' : '#131B26'}
            stroke={s.human ? series[0] : ui.border}
            strokeWidth={s.human ? 2 : 1}
          />
          <text
            x={bx(i) + boxW / 2}
            y={y + 24}
            textAnchor="middle"
            fontSize={12.5}
            fontWeight={700}
            fill={s.human ? '#1d4ed8' : ui.textPrimary}
            fontFamily="'JetBrains Mono', monospace"
          >
            {s.label}
          </text>
          <text
            x={bx(i) + boxW / 2}
            y={y + 42}
            textAnchor="middle"
            fontSize={11}
            fill={s.human ? '#1d4ed8' : ui.textMuted}
          >
            {s.sub}
          </text>
          {i < steps.length - 1 && (
            <>
              <line
                x1={bx(i) + boxW + 2}
                x2={bx(i + 1) - 9}
                y1={y + BOX_H / 2}
                y2={y + BOX_H / 2}
                stroke="#1A2433"
                strokeWidth={2}
              />
              <path
                d={`M ${bx(i + 1) - 9} ${y + BOX_H / 2 - 4.5} L ${bx(i + 1) - 1} ${y + BOX_H / 2} L ${bx(i + 1) - 9} ${y + BOX_H / 2 + 4.5} Z`}
                fill="#a8c8ee"
              />
            </>
          )}
        </g>
      ))}
    </g>
  );
}

export function InfraFlow() {
  const y1 = TOP;
  const y2 = TOP + BOX_H + ROW_GAP;
  const gap = 16;
  const boxW = (W - LAB_W - gap * 4) / 5;
  const lastCx = LAB_W + 4 * (boxW + gap) + boxW / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <Row steps={product} y={y1} label="Product code" bold={false} />
      <Row steps={infra} y={y2} label="Infrastructure" bold />

      {/* The four steps that are identical, said out loud so nobody has to count.
          Both captions are split by hand: SVG text does not wrap, and a single
          line of either runs off the right edge of the viewBox. */}
      <text x={LAB_W} y={y1 + BOX_H + 26} fontSize={12} fontWeight={600} fill={ui.textMuted}>
        the same plan, the same conventions, the same review, the same documentation step —
      </text>
      <text x={LAB_W} y={y1 + BOX_H + 42} fontSize={12} fontWeight={600} fill={ui.textMuted}>
        infrastructure is code, and the harness does not know the difference
      </text>

      {/* The one place the two rows genuinely diverge. */}
      <path
        d={`M ${lastCx} ${y2 + BOX_H + 8} L ${lastCx} ${y2 + BOX_H + 26}`}
        fill="none"
        stroke={series[0]}
        strokeWidth={1.8}
      />
      <text
        x={W}
        y={y2 + BOX_H + 44}
        textAnchor="end"
        fontSize={12.5}
        fontWeight={700}
        fill={series[0]}
      >
        the only structural difference: cloud-CLI and apply commands are on the agent's ban list
      </text>
      <text x={W} y={y2 + BOX_H + 62} textAnchor="end" fontSize={12} fill={ui.textSecondary}>
        it writes the change and shows you the plan; a person runs the command
      </text>
      <text x={W} y={y2 + BOX_H + 78} textAnchor="end" fontSize={12} fill={ui.textSecondary}>
        that touches live infrastructure
      </text>
    </svg>
  );
}
