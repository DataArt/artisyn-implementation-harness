import { series, ui } from '../theme';

type Row = { label: string; plan: number; scale?: number };

const rows: Row[] = [
  { label: 'Before', plan: 10 },
  // Bar is 70% of full width — the 90/10 split itself is unchanged.
  { label: 'Now', plan: 90, scale: 0.7 },
];

const W = 900;
const BAR_H = 46;
const LAB_H = 20;
const CAP_H = 20;
const ROW_H = LAB_H + BAR_H + CAP_H;
const GAP = 14;
const H = rows.length * ROW_H + (rows.length - 1) * GAP;
const SPACER = 2;

/**
 * Inversion of the "planning / implementation" ratio.
 * A narrow segment can't fit the word, so it moves to a caption below the segment —
 * in the same color, so there's no guessing what the 10% refers to.
 */
export function SplitFlip() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {rows.map((r, i) => {
        const top = i * (ROW_H + GAP);
        const y = top + LAB_H;
        const rowW = W * (r.scale ?? 1);
        const planW = (rowW * r.plan) / 100 - SPACER;
        const codeW = rowW - planW - SPACER;
        const planWide = r.plan >= 50;
        const capY = y + BAR_H + 15;
        return (
          <g key={r.label}>
            <text x={0} y={top + 13} fontSize={13.5} fontWeight={700} fill={ui.textPrimary}>
              {r.label}
            </text>

            <rect x={0} y={y} width={planW} height={BAR_H} rx={5} fill={series[0]} />
            <rect x={planW + SPACER} y={y} width={codeW} height={BAR_H} rx={5} fill={series[1]} />

            {/* planning */}
            <text
              x={planWide ? 16 : planW / 2}
              y={y + BAR_H / 2 + 5}
              textAnchor={planWide ? 'start' : 'middle'}
              fontSize={14}
              fontWeight={700}
              fill="#131B26"
            >
              {planWide ? `Planning — ${r.plan}%` : `${r.plan}%`}
            </text>
            {!planWide && (
              <text x={0} y={capY} fontSize={12.5} fontWeight={700} fill={series[0]}>
                ↑ Planning
              </text>
            )}

            {/* implementation */}
            <text
              x={rowW - 16}
              y={y + BAR_H / 2 + 5}
              textAnchor="end"
              fontSize={14}
              fontWeight={700}
              fill="#131B26"
            >
              {planWide ? `${100 - r.plan}%` : `Implementation — ${100 - r.plan}%`}
            </text>
            {planWide && (
              <text
                x={rowW}
                y={capY}
                textAnchor="end"
                fontSize={12.5}
                fontWeight={700}
                fill={series[1]}
              >
                Implementation ↑
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
