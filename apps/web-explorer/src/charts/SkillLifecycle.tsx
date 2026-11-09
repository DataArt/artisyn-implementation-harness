import { ui } from '../theme';

/**
 * The whole evolve lifecycle, not just the happy path from a reflection to a rule.
 *
 * Triage has two exits, not one: a rule that already exists is edited on the
 * spot and lands straight in skills/agents; only a genuinely new one is
 * parked in draft/ to sit for about a week before being promoted. draft/ and
 * skills/·agents/ are folders, not pipeline steps, so they sit in their own
 * row below the chain instead of inline with it.
 */
const CONTENT_W = 900;
const SIDE_CHANNEL = 40;
const W = CONTENT_W + SIDE_CHANNEL;
const AUTH_H = 46;
const BRANCH_Y = 78;
const BRANCH_H = 54;
const CHAIN_Y = 162;
const BOX_H = 66;
const GAP = 14;
const FOLDER_GAP = 74;
const FOLDER_Y = CHAIN_Y + BOX_H + FOLDER_GAP;
const FOLDER_H = 64;
const H = FOLDER_Y + FOLDER_H + 14;

const steps = [
  { id: 'refl', label: '/evolve reflect', sub: 'after a ticket: what surprised us' },
  { id: 'tri', label: '/evolve triage', sub: 'clusters 2–4 reflections' },
  { id: 'prom', label: '/evolve adopt', sub: 'draft → a skill the agent obeys' },
];

const BOX_W = (CONTENT_W - GAP * (steps.length - 1)) / steps.length;
const bx = (i: number) => i * (BOX_W + GAP);
const cx = (i: number) => bx(i) + BOX_W / 2;
const idx = (id: string) => steps.findIndex((s) => s.id === id);

const folders = [
  { id: 'draft', label: 'draft/', sub: 'candidate skills — sit here ~1 week', x: bx(idx('tri')) },
  {
    id: 'store',
    label: 'skills/ · agents/',
    sub: 'permanent Claude skills and agents',
    x: bx(idx('prom')),
  },
];
const fcx = (f: (typeof folders)[number]) => f.x + BOX_W / 2;

/** Two lines of caption per box — the labels are longer than one line fits. */
function Sub({ x, y, text }: { x: number; y: number; text: string }) {
  const cut = text.length > 30 ? text.lastIndexOf(' ', 30) : -1;
  const lines = cut > 0 ? [text.slice(0, cut), text.slice(cut + 1)] : [text];
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={y + i * 13} textAnchor="middle" fontSize={11} fill={ui.textMuted}>
          {l}
        </text>
      ))}
    </>
  );
}

export function SkillLifecycle() {
  const tri = idx('tri');
  const prom = idx('prom');
  const draft = folders[0];
  const store = folders[1];
  const midY = FOLDER_Y - 22;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker
          id="sl-step"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ui.textMuted} />
        </marker>
        <marker
          id="sl-down"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a8c8ee" />
        </marker>
        <marker
          id="sl-up"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#7fb3e8" />
        </marker>
        <marker
          id="sl-branch"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#5fbf99" />
        </marker>
        <marker
          id="sl-left"
          viewBox="0 0 10 10"
          refX="1"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 10 0 L 0 5 L 10 10 z" fill="#5fbf99" />
        </marker>
      </defs>

      {/* The family's own rulebook, sitting over everything below it. */}
      <rect
        x={0}
        y={0}
        width={CONTENT_W}
        height={AUTH_H}
        rx={8}
        fill="#1A2433"
        stroke="#a8c8ee"
        strokeWidth={1.4}
      />
      <text
        x={16}
        y={28}
        fontSize={13.5}
        fontWeight={700}
        fill="#1d4ed8"
        fontFamily="'JetBrains Mono', monospace"
      >
        evolve
      </text>
      <text x={95} y={28} fontSize={12.5} fill={ui.textSecondary}>
        the skill that runs this whole lifecycle — everything below is a stage of it
      </text>

      {/* Triage's other exit: an existing rule never goes near the draft folder. */}
      <rect
        x={bx(tri)}
        y={BRANCH_Y}
        width={BOX_W * 2 + GAP}
        height={BRANCH_H}
        rx={8}
        fill="#10241C"
        stroke="#9ad9bd"
        strokeWidth={1.4}
      />
      <text x={bx(tri) + 14} y={BRANCH_Y + 22} fontSize={13} fontWeight={700} fill="#14805c">
        Rule already exists?
      </text>
      <text x={bx(tri) + 14} y={BRANCH_Y + 40} fontSize={11.5} fill={ui.textSecondary}>
        triage updates it on the spot — lands straight in skills/ or agents/, no draft, no waiting
      </text>
      <path
        d={`M ${cx(tri)} ${CHAIN_Y - 2} L ${cx(tri)} ${BRANCH_Y + BRANCH_H + 9}`}
        fill="none"
        stroke="#9ad9bd"
        strokeWidth={1.8}
        markerEnd="url(#sl-branch)"
      />
      {/* That exit's real destination: straight into skills/agents, routed around the chain. */}
      <path
        d={`M ${CONTENT_W} ${BRANCH_Y + BRANCH_H / 2} L ${CONTENT_W + SIDE_CHANNEL / 2} ${BRANCH_Y + BRANCH_H / 2} L ${CONTENT_W + SIDE_CHANNEL / 2} ${FOLDER_Y + FOLDER_H / 2} L ${CONTENT_W} ${FOLDER_Y + FOLDER_H / 2}`}
        fill="none"
        stroke="#5fbf99"
        strokeWidth={2}
        strokeDasharray="5 4"
        markerEnd="url(#sl-left)"
      />

      {steps.map((s, i) => (
        <g key={s.id}>
          <rect
            x={bx(i)}
            y={CHAIN_Y}
            width={BOX_W}
            height={BOX_H}
            rx={7}
            fill="#131B26"
            stroke={ui.border}
          />
          <text
            x={cx(i)}
            y={CHAIN_Y + 24}
            textAnchor="middle"
            fontSize={12.5}
            fontWeight={700}
            fill={ui.textPrimary}
            fontFamily="'JetBrains Mono', monospace"
          >
            {s.label}
          </text>
          <Sub x={cx(i)} y={CHAIN_Y + 43} text={s.sub} />
          {i < steps.length - 1 && (
            <line
              x1={bx(i) + BOX_W + 1}
              x2={bx(i + 1) - 3}
              y1={CHAIN_Y + BOX_H / 2}
              y2={CHAIN_Y + BOX_H / 2}
              stroke={ui.textMuted}
              strokeWidth={1.5}
              markerEnd="url(#sl-step)"
            />
          )}
        </g>
      ))}

      {/* Triage → draft/: a genuinely new rule waits here. */}
      <line
        x1={cx(tri)}
        x2={fcx(draft)}
        y1={CHAIN_Y + BOX_H}
        y2={FOLDER_Y - 2}
        stroke="#a8c8ee"
        strokeWidth={1.8}
        markerEnd="url(#sl-down)"
      />

      {/* Promote → skills/agents: a promoted skill lands here. */}
      <line
        x1={cx(prom)}
        x2={fcx(store)}
        y1={CHAIN_Y + BOX_H}
        y2={FOLDER_Y - 2}
        stroke="#a8c8ee"
        strokeWidth={1.8}
        markerEnd="url(#sl-down)"
      />

      {/* draft/ → adopt: what /evolve adopt actually reads from. */}
      <path
        d={`M ${fcx(draft)} ${FOLDER_Y} L ${fcx(draft)} ${midY} L ${cx(prom)} ${midY} L ${cx(prom)} ${CHAIN_Y + BOX_H + 2}`}
        fill="none"
        stroke="#7fb3e8"
        strokeWidth={2}
        strokeDasharray="5 4"
        markerEnd="url(#sl-up)"
      />
      <text
        x={(fcx(draft) + cx(prom)) / 2}
        y={midY - 8}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="#3d7ec2"
      >
        after ~1 week: draft → skill
      </text>

      {folders.map((f) => (
        <g key={f.id}>
          <rect
            x={f.x}
            y={FOLDER_Y}
            width={BOX_W}
            height={FOLDER_H}
            rx={7}
            fill="#241C0E"
            stroke="#e3c48a"
            strokeWidth={1.6}
            strokeDasharray="6 4"
          />
          <text
            x={fcx(f)}
            y={FOLDER_Y + 25}
            textAnchor="middle"
            fontSize={12.5}
            fontWeight={700}
            fill={ui.textPrimary}
            fontFamily="'JetBrains Mono', monospace"
          >
            {f.label}
          </text>
          <Sub x={fcx(f)} y={FOLDER_Y + 44} text={f.sub} />
        </g>
      ))}
    </svg>
  );
}
