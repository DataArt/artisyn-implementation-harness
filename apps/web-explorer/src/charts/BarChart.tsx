import { scaleBand, scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { chart, series } from '../theme';

export type Bar = { label: string; value: number; note?: string };

/**
 * Single-series vertical bars. One series → no legend (the title names it).
 * 4px rounded data-end anchored to the baseline; 2px gap between bars.
 */
export function BarChart({
  data,
  height = 220,
  valueSuffix: _valueSuffix = '',
  color = series[0],
}: {
  data: Bar[];
  height?: number;
  valueSuffix?: string;
  color?: string;
}) {
  const width = 900;
  const m = { top: 18, right: 8, bottom: 30, left: 44 };
  const iw = width - m.left - m.right;
  const ih = height - m.top - m.bottom;

  const x = scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, iw])
    .padding(0.28);
  const y = scaleLinear()
    .domain([0, max(data, (d) => d.value) ?? 1])
    .nice(4)
    .range([ih, 0]);

  const ticks = y.ticks(4);

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <g transform={`translate(${m.left},${m.top})`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={0} x2={iw} y1={y(t)} y2={y(t)} stroke={chart.grid} strokeWidth={1} />
              <text
                x={-10}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                fontSize={11}
                fill={chart.label}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {t}
              </text>
            </g>
          ))}
          {data.map((d) => {
            const bw = x.bandwidth();
            const bh = Math.max(ih - y(d.value), 2);
            return (
              <g key={d.label}>
                <rect x={x(d.label)} y={y(d.value)} width={bw} height={bh} rx={4} fill={color} />
                {/* clip the rounded top so the bar stays anchored to the baseline */}
                <rect
                  x={x(d.label)}
                  y={y(d.value) + bh - 4}
                  width={bw}
                  height={4}
                  fill={color}
                  pointerEvents="none"
                />
                <text
                  x={(x(d.label) ?? 0) + bw / 2}
                  y={y(d.value) - 7}
                  textAnchor="middle"
                  fontSize={11.5}
                  fontWeight={600}
                  fill="#A1AFBD"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {d.value}
                </text>
                <text
                  x={(x(d.label) ?? 0) + bw / 2}
                  y={ih + 18}
                  textAnchor="middle"
                  fontSize={11.5}
                  fill={chart.label}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
          <line x1={0} x2={iw} y1={ih} y2={ih} stroke={chart.axis} strokeWidth={1} />
        </g>
      </svg>
    </>
  );
}
