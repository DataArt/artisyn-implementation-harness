import { series, ui } from '../theme';

export type LoopNode = { id: string; label: string; sub?: string };
export type LoopFeed = { from: number; label: string; into?: 'top' | 'right' };

function DownArrow({ x, y, color }: { x: number; y: number; color: string }) {
  return <path d={`M ${x - 4.5} ${y - 8} L ${x + 4.5} ${y - 8} L ${x} ${y} Z`} fill={color} />;
}

function LeftArrow({ x, y, color }: { x: number; y: number; color: string }) {
  return <path d={`M ${x + 8} ${y - 4.5} L ${x + 8} ${y + 4.5} L ${x} ${y} Z`} fill={color} />;
}

/**
 * Pipeline of steps in a row. An optional `below` node is drawn as its own
 * standalone box under the row, fed by elbow connectors from `feeds` — a
 * destination the steps write to, not a step itself, so it gets no chain
 * arrow of its own. `into: 'top'` feeds share one collector line down into
 * the top edge; `into: 'right'` feeds get their own straight elbow into the
 * right edge, so routes never cross.
 */
export function LoopDiagram({
  nodes,
  below,
  feeds,
}: {
  nodes: LoopNode[];
  below?: LoopNode;
  feeds?: LoopFeed[];
}) {
  const width = 900;
  const boxH = 62;
  const gap = 14;
  const boxW = (width - gap * (nodes.length - 1)) / nodes.length;
  const top = 10;

  const topDrops = (feeds ?? []).filter((f) => (f.into ?? 'top') === 'top');
  const rightDrops = (feeds ?? []).filter((f) => f.into === 'right');
  const collectorY = top + boxH + 28;

  const belowW = boxW * 1.15;
  const belowCx = belowW / 2;
  const belowY = below ? collectorY + 34 : 0;
  const height = below ? belowY + boxH + 8 : top + boxH + 8;

  const cx = (i: number) => i * (boxW + gap) + boxW / 2;

  const renderNode = (n: LoopNode, x: number, y: number, w: number) => (
    <g key={n.id}>
      <rect x={x} y={y} width={w} height={boxH} rx={7} fill="#131B26" stroke={ui.border} />
      <text
        x={x + w / 2}
        y={y + (n.sub ? 25 : boxH / 2 + 4)}
        textAnchor="middle"
        fontSize={13.5}
        fontWeight={700}
        fill={ui.textPrimary}
        fontFamily="'JetBrains Mono', monospace"
      >
        {n.label}
      </text>
      {n.sub && (
        <text x={x + w / 2} y={y + 44} textAnchor="middle" fontSize={11.5} fill={ui.textMuted}>
          {n.sub}
        </text>
      )}
    </g>
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker
          id="step-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ui.textMuted} />
        </marker>
      </defs>

      {nodes.map((n, i) => (
        <g key={n.id}>
          {renderNode(n, i * (boxW + gap), top, boxW)}
          {i < nodes.length - 1 && (
            <line
              x1={(i + 1) * (boxW + gap) - gap + 1}
              x2={(i + 1) * (boxW + gap) - 3}
              y1={top + boxH / 2}
              y2={top + boxH / 2}
              stroke={ui.textMuted}
              strokeWidth={1.5}
              markerEnd="url(#step-arrow)"
            />
          )}
        </g>
      ))}

      {below && topDrops.length > 0 && (
        <>
          {topDrops.map((d, i) => {
            const fromX = cx(d.from);
            return (
              <g key={i}>
                <line
                  x1={fromX}
                  x2={fromX}
                  y1={top + boxH}
                  y2={collectorY}
                  stroke={series[1]}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
                <text
                  x={fromX + 8}
                  y={collectorY - 8}
                  fontSize={11}
                  fontWeight={600}
                  fill={series[1]}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
          <line
            x1={Math.min(belowCx, ...topDrops.map((d) => cx(d.from)))}
            x2={Math.max(belowCx, ...topDrops.map((d) => cx(d.from)))}
            y1={collectorY}
            y2={collectorY}
            stroke={series[1]}
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <line
            x1={belowCx}
            x2={belowCx}
            y1={collectorY}
            y2={belowY - 9}
            stroke={series[1]}
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <DownArrow x={belowCx} y={belowY - 1} color={series[1]} />
        </>
      )}

      {below &&
        rightDrops.map((d, i) => {
          const fromX = cx(d.from);
          const rowY = belowY + boxH / 2 + i * 20;
          return (
            <g key={i}>
              <path
                d={`M ${fromX} ${top + boxH} L ${fromX} ${rowY} L ${belowW + 9} ${rowY}`}
                fill="none"
                stroke={series[1]}
                strokeWidth={2}
                strokeDasharray="5 4"
              />
              <text
                x={fromX + 8}
                y={collectorY - 8}
                fontSize={11}
                fontWeight={600}
                fill={series[1]}
              >
                {d.label}
              </text>
              <LeftArrow x={belowW + 1} y={rowY} color={series[1]} />
            </g>
          );
        })}

      {below && renderNode(below, 0, belowY, belowW)}
    </svg>
  );
}
