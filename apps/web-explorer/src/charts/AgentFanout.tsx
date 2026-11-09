import { ui, series } from '../theme';

type Agent = { name: string; role: string; ctx: string; tip: string };

const agents: Agent[] = [
  {
    name: '@backend-dev',
    role: 'Backend',
    ctx: 'API rules, serving-layer boundaries, module structure',
    tip: 'Writes and edits controllers, services, and DTOs. Stays out of data and frontend.',
  },
  {
    name: '@frontend-dev',
    role: 'Web',
    ctx: 'layered component model, data-fetching rules, imports',
    tip: 'Components, feature hooks, repositories, backend wiring. Knows frontend conventions by heart.',
  },
  {
    name: '@data',
    role: 'Data',
    ctx: 'ORM schema, migration rules, libs/app-db public API',
    tip: 'Tables, columns, indexes, repositories. The only one allowed to touch migrations.',
  },
  {
    name: '@architect',
    role: 'Architecture',
    ctx: 'HLD and LLD, five Well-Architected pillars',
    tip: 'Audits a layer against its docs, finds gaps between intent and code, writes architecture docs.',
  },
];

const W = 900;
const A_X = 372;
const A_W = W - A_X;
const A_H = 54;
const A_GAP = 11;
const TOP = 16;
const STACK_H = agents.length * A_H + (agents.length - 1) * A_GAP;
const MAIN_W = 250;
const MAIN_H = 104;
const MAIN_Y = TOP + (STACK_H - MAIN_H) / 2;
const RET_Y = TOP + STACK_H + 30;
const H = RET_Y + 26;

export function AgentFanout() {
  const mainCy = MAIN_Y + MAIN_H / 2;
  const ay = (i: number) => TOP + i * (A_H + A_GAP);

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* "spawns" links */}
        {agents.map((a, i) => {
          const cy = ay(i) + A_H / 2;
          const x1 = MAIN_W;
          const x2 = A_X;
          const mid = (x1 + x2) / 2;
          return (
            <g key={`link-${a.name}`}>
              <path
                d={`M ${x1} ${mainCy} C ${mid} ${mainCy}, ${mid} ${cy}, ${x2 - 9} ${cy}`}
                fill="none"
                stroke="#1A2433"
                strokeWidth={2}
              />
              <path
                d={`M ${x2 - 9} ${cy - 4.5} L ${x2 - 1} ${cy} L ${x2 - 9} ${cy + 4.5} Z`}
                fill="#a8c8ee"
              />
            </g>
          );
        })}
        <text
          x={(MAIN_W + A_X) / 2}
          y={mainCy - 12}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={series[0]}
        >
          spawns in parallel
        </text>

        {/* main session */}
        <rect
          x={0}
          y={MAIN_Y}
          width={MAIN_W}
          height={MAIN_H}
          rx={9}
          fill="#1A2433"
          stroke="#b6cef2"
        />
        <text
          x={MAIN_W / 2}
          y={MAIN_Y + 30}
          textAnchor="middle"
          fontSize={14.5}
          fontWeight={700}
          fill="#1d4ed8"
        >
          Main session
        </text>
        {[
          'holds the story plan and the big picture,',
          "doesn't read layer conventions itself —",
          'otherwise context bloats',
        ].map((ln, i) => (
          <text
            key={ln}
            x={MAIN_W / 2}
            y={MAIN_Y + 52 + i * 15}
            textAnchor="middle"
            fontSize={12}
            fill={ui.textSecondary}
          >
            {ln}
          </text>
        ))}

        {/* agents */}
        {agents.map((a, i) => {
          const y = ay(i);
          return (
            <g key={a.name} style={{ cursor: 'default' }}>
              <rect x={A_X} y={y} width={A_W} height={A_H} rx={8} fill="#131B26" stroke="#718399" />
              <rect x={A_X} y={y} width={4} height={A_H} rx={2} fill={series[0]} />
              <text
                x={A_X + 16}
                y={y + 22}
                fontSize={13}
                fontWeight={700}
                fill={ui.textPrimary}
                style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                {a.name}
              </text>
              <text x={A_X + 132} y={y + 22} fontSize={12.5} fontWeight={600} fill={series[0]}>
                {a.role}
              </text>
              <text x={A_X + 16} y={y + 41} fontSize={12} fill={ui.textSecondary}>
                own context: {a.ctx}
              </text>
            </g>
          );
        })}

        {/* returning the result */}
        <path
          d={`M ${A_X + A_W / 2} ${TOP + STACK_H + 6} L ${A_X + A_W / 2} ${RET_Y} L ${MAIN_W / 2} ${RET_Y} L ${MAIN_W / 2} ${MAIN_Y + MAIN_H + 9}`}
          fill="none"
          stroke={ui.textMuted}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <path
          d={`M ${MAIN_W / 2 - 4.5} ${MAIN_Y + MAIN_H + 9} L ${MAIN_W / 2 + 4.5} ${MAIN_Y + MAIN_H + 9} L ${MAIN_W / 2} ${MAIN_Y + MAIN_H + 1} Z`}
          fill={ui.textMuted}
        />
        <text
          x={(MAIN_W / 2 + A_X + A_W / 2) / 2}
          y={RET_Y - 8}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={ui.textMuted}
        >
          they return only the result — not their context
        </text>
      </svg>
    </>
  );
}
