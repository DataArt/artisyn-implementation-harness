import { ui, series, status } from '../theme';

type Step = {
  actor: 'human' | 'agent';
  lines: string[];
  passive?: string;
  tip: string;
};

const steps: Step[] = [
  {
    actor: 'human',
    lines: ['Started', 'review'],
    tip: 'The only meaningful human action in the whole chain — and even that is a button press.',
  },
  {
    actor: 'agent',
    lines: ['Produced', 'findings'],
    tip: 'A list of findings with verdicts: what breaks, where, and under what input.',
  },
  {
    actor: 'human',
    lines: ['Forwarded', 'to developer'],
    passive: "didn't review it",
    tip: "Copied the whole report. Didn't read it, didn't filter it, didn't decide what mattered.",
  },
  {
    actor: 'human',
    lines: ['Handed the same', 'file to the agent'],
    passive: "didn't review it",
    tip: "The developer doesn't read the findings — they hand them back to the model as a task.",
  },
  {
    actor: 'agent',
    lines: ['Fixed', 'and returned'],
    tip: 'Sometimes correctly, sometimes it fixes a false positive, breaking working code.',
  },
];

const W = 900;
const GAP = 22;
const BOX_W = (W - GAP * (steps.length - 1)) / steps.length;
const BOX_H = 62;
const ARC_H = 46;
const H = ARC_H + BOX_H + 30;
const AGENT = { fill: '#1A2433', stroke: '#bcd6f4' };
const HUMAN = { fill: '#131B26', stroke: '#718399' };

export function RelayLoop() {
  const cx = (i: number) => i * (BOX_W + GAP) + BOX_W / 2;
  const boxY = ARC_H;
  const last = steps.length - 1;

  return (
    <>
      <svg viewBox={`-3 0 ${W + 6} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* loop: everything comes back to whoever started the review */}
        <path
          d={`M ${cx(last)} ${boxY - 3} C ${cx(last)} ${16}, ${cx(0)} ${16}, ${cx(0)} ${boxY - 9}`}
          fill="none"
          stroke={status.serious}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <path
          d={`M ${cx(0) - 4.5} ${boxY - 10} L ${cx(0) + 4.5} ${boxY - 10} L ${cx(0)} ${boxY - 2} Z`}
          fill={status.serious}
        />
        <text
          x={(cx(0) + cx(last)) / 2}
          y={13}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={700}
          fill={status.serious}
        >
          the loop closed — and nobody learned anything
        </text>

        {steps.map((s, i) => {
          const x = i * (BOX_W + GAP);
          const skin = s.actor === 'agent' ? AGENT : HUMAN;
          return (
            <g key={s.lines.join(' ')} style={{ cursor: 'default' }}>
              <rect
                x={x}
                y={boxY}
                width={BOX_W}
                height={BOX_H}
                rx={7}
                fill={skin.fill}
                stroke={skin.stroke}
                strokeDasharray={s.passive ? '5 4' : undefined}
              />
              <text
                x={x + BOX_W / 2}
                y={boxY + 17}
                textAnchor="middle"
                fontSize={10.5}
                fontWeight={700}
                letterSpacing="0.08em"
                fill={s.actor === 'agent' ? series[0] : ui.textMuted}
              >
                {s.actor.toUpperCase()}
              </text>
              {s.lines.map((ln, li) => (
                <text
                  key={ln}
                  x={x + BOX_W / 2}
                  y={boxY + 36 + li * 15}
                  textAnchor="middle"
                  fontSize={12.5}
                  fontWeight={600}
                  fill={s.passive ? ui.textSecondary : ui.textPrimary}
                >
                  {ln}
                </text>
              ))}
              {s.passive && (
                <text
                  x={x + BOX_W / 2}
                  y={boxY + BOX_H + 17}
                  textAnchor="middle"
                  fontSize={11.5}
                  fontWeight={700}
                  fill={status.serious}
                >
                  ✕ {s.passive}
                </text>
              )}
              {i < last && (
                <path
                  d={`M ${x + BOX_W + GAP / 2 - 4} ${boxY + BOX_H / 2 - 5} L ${x + BOX_W + GAP / 2 + 4} ${boxY + BOX_H / 2} L ${x + BOX_W + GAP / 2 - 4} ${boxY + BOX_H / 2 + 5} Z`}
                  fill={ui.textMuted}
                />
              )}
            </g>
          );
        })}
      </svg>
    </>
  );
}
