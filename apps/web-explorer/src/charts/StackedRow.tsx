export type Seg = { label: string; value: number; color: string };

/**
 * One horizontal 100%-stacked row. Segments carry direct labels where they fit,
 * plus a legend below — identity is never colour-alone. 2px surface gap between fills.
 */
export function StackedRow({
  segments,
  height = 46,
  unit: _unit = '',
}: {
  segments: Seg[];
  height?: number;
  unit?: string;
}) {
  const width = 900;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;

  let cursor = 0;
  const laid = segments.map((s) => {
    const w = (s.value / total) * width;
    const x = cursor;
    cursor += w;
    return { ...s, x, w, pct: (s.value / total) * 100 };
  });

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {laid.map((s, i) => {
          const gap = i === laid.length - 1 ? 0 : 2;
          const w = Math.max(s.w - gap, 1);
          return (
            <g key={s.label}>
              <rect
                x={s.x}
                y={0}
                width={w}
                height={height}
                rx={i === 0 || i === laid.length - 1 ? 4 : 0}
                fill={s.color}
              />
              {s.pct >= 7 && (
                <text
                  x={s.x + w / 2}
                  y={height / 2}
                  dy="0.34em"
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill="#131B26"
                  pointerEvents="none"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.pct.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </>
  );
}
