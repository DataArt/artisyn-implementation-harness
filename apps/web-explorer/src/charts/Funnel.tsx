import { blueRamp, ui } from '../theme';

export type Stage = { label: string; value: number; note?: string };

/**
 * A true funnel: each band is a trapezoid narrowing toward the next stage.
 * Data must be in decreasing order, or the shape will lie.
 */
export function Funnel({ stages }: { stages: Stage[] }) {
  const width = 900;
  const bandH = 58;
  const gap = 6;
  const height = stages.length * (bandH + gap) - gap;
  const cx = 250;
  const halfMax = 214;
  const labelX = 500;
  const maxV = Math.max(...stages.map((s) => s.value));
  const half = (v: number) => (v / maxV) * halfMax;

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {stages.map((s, i) => {
          const y = i * (bandH + gap);
          const topH = half(s.value);
          const next = stages[i + 1];
          const botH = next ? half(next.value) : topH * 0.86;
          const color = blueRamp[Math.min(i + 1, blueRamp.length - 1)];
          return (
            <g key={s.label}>
              <path
                d={`M ${cx - topH} ${y} L ${cx + topH} ${y} L ${cx + botH} ${y + bandH} L ${cx - botH} ${y + bandH} Z`}
                fill={color}
              />
              <text
                x={cx}
                y={y + bandH / 2}
                dy="0.34em"
                textAnchor="middle"
                fontSize={24}
                fontWeight={800}
                fill="#131B26"
                fontFamily="'Barlow Condensed', sans-serif"
                pointerEvents="none"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {s.value}
              </text>
              <line
                x1={cx + Math.max(topH, botH) + 10}
                x2={labelX - 12}
                y1={y + bandH / 2}
                y2={y + bandH / 2}
                stroke="#27313D"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={labelX}
                y={y + bandH / 2 - 5}
                fontSize={14.5}
                fontWeight={700}
                fill={ui.textPrimary}
              >
                {s.label}
              </text>
              {s.note && (
                <text x={labelX} y={y + bandH / 2 + 13} fontSize={12} fill={ui.textMuted}>
                  {s.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </>
  );
}
