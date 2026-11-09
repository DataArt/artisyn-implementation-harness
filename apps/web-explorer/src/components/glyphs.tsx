import type { ReactElement } from 'react';

/**
 * Unified line-icon glyph set on a 24×24 grid. Used where a block denotes an
 * entity or criterion rather than a judgment: internal tools (which have no
 * logos of their own) and quality criteria.
 */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export type GlyphName =
  | 'catalog'
  | 'report'
  | 'migration'
  | 'docs'
  | 'usage'
  | 'loadtest'
  | 'understood'
  | 'insync'
  | 'tested'
  | 'prototype'
  | 'layers'
  | 'loop'
  | 'director'
  | 'allsides'
  | 'workload'
  | 'target'
  | 'shield'
  | 'greenfield'
  | 'globe'
  | 'database'
  | 'threesources'
  | 'broken'
  | 'code'
  | 'review'
  | 'forbidden'
  | 'org'
  | 'bolt'
  | 'palette'
  | 'deps'
  | 'folder'
  | 'branch';

const glyphs: Record<GlyphName, ReactElement> = {
  /* catalog: app window — header, side nav, entries */
  catalog: (
    <g {...S}>
      <rect x={3.5} y={4} width={17} height={16} rx={2.5} />
      <line x1={3.5} y1={8.5} x2={20.5} y2={8.5} />
      <line x1={9} y1={8.5} x2={9} y2={20} />
      <line x1={12} y1={12} x2={17.5} y2={12} />
      <line x1={12} y1={16} x2={15.5} y2={16} />
    </g>
  ),
  /* delivery report: dashboard bars */
  report: (
    <g {...S}>
      <line x1={4} y1={20} x2={20} y2={20} />
      <line x1={7} y1={20} x2={7} y2={12} strokeWidth={2.6} />
      <line x1={12} y1={20} x2={12} y2={6} strokeWidth={2.6} />
      <line x1={17} y1={20} x2={17} y2={15} strokeWidth={2.6} />
    </g>
  ),
  /* migration: moving data from one store to another */
  migration: (
    <g {...S}>
      <line x1={4} y1={5} x2={4} y2={19} strokeWidth={2} />
      <line x1={20} y1={5} x2={20} y2={19} strokeWidth={2} />
      <line x1={7.5} y1={12} x2={16.5} y2={12} />
      <polyline points="13.5,9 16.8,12 13.5,15" />
    </g>
  ),
  /* documentation: open book */
  docs: (
    <g {...S}>
      <path d="M12 6.5C10 5 7 4.5 4 4.5v13c3 0 6 .5 8 2" />
      <path d="M12 6.5C14 5 17 4.5 20 4.5v13c-3 0-6 .5-8 2" />
      <line x1={12} y1={6.5} x2={12} y2={19.5} />
    </g>
  ),
  /* usage: activity curve */
  usage: (
    <g {...S}>
      <polyline points="3,20 21,20" />
      <polyline points="4.5,16.5 9.5,11.5 13,14 19.5,6.5" strokeWidth={2} />
      <circle cx={19.5} cy={6.5} r={1.9} fill="currentColor" stroke="none" />
    </g>
  ),
  /* load test: gauge dial */
  loadtest: (
    <g {...S}>
      <path d="M4 17a8 8 0 0 1 16 0" />
      <line x1={12} y1={17} x2={16.4} y2={11.4} strokeWidth={2} />
      <circle cx={12} cy={17} r={1.6} fill="currentColor" stroke="none" />
    </g>
  ),
  /* agent understands the code: speech bubble with angle brackets */
  understood: (
    <g {...S}>
      <rect x={2} y={4.5} width={20} height={12.5} rx={3} />
      <path d="M8 17v3.6L12.6 17" />
      <polyline points="10,8.5 7.8,10.75 10,13" />
      <polyline points="14,8.5 16.2,10.75 14,13" />
    </g>
  ),
  /* code matches documentation: document with a verified checkmark */
  insync: (
    <g {...S}>
      <rect x={2} y={2.5} width={10.5} height={14.5} rx={2.2} />
      <line x1={4.5} y1={6.5} x2={10} y2={6.5} />
      <line x1={4.5} y1={9.5} x2={8.5} y2={9.5} />
      <line x1={4.5} y1={12.5} x2={10} y2={12.5} />
      <circle cx={18} cy={17.4} r={4.8} />
      <polyline points="15.8,17.4 17.4,19.1 20.3,15.5" strokeWidth={1.9} />
    </g>
  ),
  /* prototype: mockup with a cursor */
  prototype: (
    <g {...S}>
      <rect x={2.5} y={4} width={19} height={15} rx={2.2} />
      <line x1={2.5} y1={8.2} x2={21.5} y2={8.2} />
      <path d="M11 11l6.4 4.8-2.8.6 1.5 3-1.8.9-1.5-3-1.9 2z" />
    </g>
  ),
  /* context: a layered stack that sits there and gets reused */
  layers: (
    <g {...S}>
      <rect x={3.5} y={4} width={17} height={4.4} rx={1.6} />
      <rect x={3.5} y={9.8} width={17} height={4.4} rx={1.6} />
      <rect x={3.5} y={15.6} width={17} height={4.4} rx={1.6} />
    </g>
  ),
  /* feedback loop: closed circle */
  loop: (
    <g {...S}>
      <path d="M20 12a8 8 0 1 1-3.2-6.4" />
      <polyline points="16.4,2 17.2,6.2 13,6.6" />
    </g>
  ),
  /* a person sets direction: figure and vector */
  director: (
    <g {...S}>
      <circle cx={7.5} cy={6} r={3.2} />
      <path d="M2 17.5a5.5 5.5 0 0 1 11 0" />
      <line x1={15} y1={12} x2={21} y2={12} />
      <polyline points="18.4,9.4 21.4,12 18.4,14.6" />
    </g>
  ),
  /* from all sides: four directions into one point */
  allsides: (
    <g {...S}>
      <line x1={12} y1={2.5} x2={12} y2={7.6} />
      <polyline points="9.9,5.5 12,7.8 14.1,5.5" />
      <line x1={12} y1={21.5} x2={12} y2={16.4} />
      <polyline points="9.9,18.5 12,16.2 14.1,18.5" />
      <line x1={2.5} y1={12} x2={7.6} y2={12} />
      <polyline points="5.5,9.9 7.8,12 5.5,14.1" />
      <line x1={21.5} y1={12} x2={16.4} y2={12} />
      <polyline points="18.5,9.9 16.2,12 18.5,14.1" />
      <circle cx={12} cy={12} r={2.6} fill="currentColor" stroke="none" />
    </g>
  ),
  /* a highlighted workload: one block set apart from the rest */
  workload: (
    <g {...S}>
      <rect x={2} y={4} width={13} height={16} rx={2.2} strokeDasharray="4 3" />
      <rect x={5} y={8} width={7} height={8} rx={1.6} fill="currentColor" stroke="none" />
      <rect x={17.5} y={5.5} width={4.5} height={4.5} rx={1.2} />
      <rect x={17.5} y={14} width={4.5} height={4.5} rx={1.2} />
    </g>
  ),
  /* predictability: hitting the target */
  target: (
    <g {...S}>
      <circle cx={12} cy={12} r={8.6} />
      <circle cx={12} cy={12} r={4.4} />
      <circle cx={12} cy={12} r={1.7} fill="currentColor" stroke="none" />
    </g>
  ),
  /* low regulatory risk: shield */
  shield: (
    <g {...S}>
      <path d="M12 2.8l7.6 3v6.1c0 4.5-3.2 7.8-7.6 9.3-4.4-1.5-7.6-4.8-7.6-9.3V5.8z" />
      <polyline points="8.8,11.8 11.1,14.2 15.4,9.4" strokeWidth={1.9} />
    </g>
  ),
  /* greenfield: clean field, a sprout */
  greenfield: (
    <g {...S}>
      <line x1={12} y1={21} x2={12} y2={11.5} />
      <path d="M12 13.5C12 9.9 9 7 5.4 7c0 3.6 2.9 6.5 6.6 6.5z" />
      <path d="M12 11.5C12 8.4 14.5 6 17.6 6c0 3.1-2.5 5.5-5.6 5.5z" />
    </g>
  ),
  /* public domain knowledge: the model already knows the domain */
  globe: (
    <g {...S}>
      <circle cx={12} cy={12} r={8.8} />
      <ellipse cx={12} cy={12} rx={3.8} ry={8.8} />
      <line x1={3.4} y1={12} x2={20.6} y2={12} />
    </g>
  ),
  /* complex data: storage */
  database: (
    <g {...S}>
      <ellipse cx={12} cy={5.6} rx={7.6} ry={2.8} />
      <path d="M4.4 5.6v12.8c0 1.55 3.4 2.8 7.6 2.8s7.6-1.25 7.6-2.8V5.6" />
      <path d="M4.4 12c0 1.55 3.4 2.8 7.6 2.8s7.6-1.25 7.6-2.8" />
    </g>
  ),
  /* three sources of truth converge into one value */
  threesources: (
    <g {...S}>
      <rect x={2} y={2.6} width={7} height={5.4} rx={1.5} />
      <rect x={2} y={9.3} width={7} height={5.4} rx={1.5} />
      <rect x={2} y={16} width={7} height={5.4} rx={1.5} />
      <path d="M9 5.3h4.5V12M9 12h4.5M9 18.7h4.5V12" />
      <rect x={15.5} y={8.4} width={6.5} height={7.2} rx={1.6} />
    </g>
  ),
  /* data broke: a gap in the chain */
  broken: (
    <g {...S}>
      <line x1={2.5} y1={12} x2={8.4} y2={12} strokeWidth={2} />
      <line x1={15.6} y1={12} x2={21.5} y2={12} strokeWidth={2} />
      <polyline points="8.4,12 11.2,7.4 12.8,16.6 15.6,12" strokeWidth={1.9} />
    </g>
  ),
  /* development: angle brackets and a slash */
  code: (
    <g {...S}>
      <polyline points="8.4,7.6 3.8,12 8.4,16.4" strokeWidth={1.9} />
      <polyline points="15.6,7.6 20.2,12 15.6,16.4" strokeWidth={1.9} />
      <line x1={13.4} y1={5.6} x2={10.6} y2={18.4} />
    </g>
  ),
  /* review: magnifying glass over lines */
  review: (
    <g {...S}>
      <circle cx={10.4} cy={10.4} r={6.6} />
      <line x1={15.4} y1={15.4} x2={20.6} y2={20.6} strokeWidth={2} />
      <line x1={7.4} y1={9} x2={13.4} y2={9} />
      <line x1={7.4} y1={12} x2={11.4} y2={12} />
    </g>
  ),
  /* hard prohibition: crossed-out circle */
  forbidden: (
    <g {...S}>
      <circle cx={12} cy={12} r={8.8} strokeWidth={1.9} />
      <line x1={5.8} y1={18.2} x2={18.2} y2={5.8} strokeWidth={1.9} />
    </g>
  ),
  /* buy-in from above: org structure */
  org: (
    <g {...S}>
      <rect x={8.5} y={2.6} width={7} height={5.2} rx={1.5} />
      <rect x={2} y={16.2} width={7} height={5.2} rx={1.5} />
      <rect x={15} y={16.2} width={7} height={5.2} rx={1.5} />
      <path d="M12 7.8v4.4M5.5 16.2v-4h13v4" />
    </g>
  ),
  /* tests exist and pass: flask */
  tested: (
    <g {...S}>
      <path d="M9.2 3v6L4.6 17.8A2 2 0 0 0 6.4 20.8h11.2a2 2 0 0 0 1.8-3L14.8 9V3" />
      <line x1={8} y1={3} x2={16} y2={3} strokeWidth={2} />
      <line x1={6.6} y1={14.6} x2={17.4} y2={14.6} />
    </g>
  ),
  /* speed: lightning bolt */
  bolt: (
    <g {...S}>
      <path d="M13.6 2.5 5.4 13.2h5.4l-.8 8.3 8.6-11h-5.6z" />
    </g>
  ),
  /* visual language: palette with a brush stroke */
  palette: (
    <g {...S}>
      <path d="M12 3.2a8.8 8.8 0 1 0 0 17.6c1.3 0 1.9-.8 1.9-1.7 0-1.5-1.3-1.8-1.3-3 0-1 .8-1.7 1.9-1.7h1.8a4.5 4.5 0 0 0 4.5-4.5C20.8 5.9 16.9 3.2 12 3.2Z" />
      <circle cx={7.8} cy={11.2} r={1.15} fill="currentColor" stroke="none" />
      <circle cx={10.4} cy={7.2} r={1.15} fill="currentColor" stroke="none" />
      <circle cx={15.2} cy={7.6} r={1.15} fill="currentColor" stroke="none" />
    </g>
  ),
  /* dependency set: package box */
  deps: (
    <g {...S}>
      <path d="M12 2.9 20.6 7v10L12 21.1 3.4 17V7z" />
      <path d="M3.4 7 12 11.2 20.6 7" />
      <line x1={12} y1={11.2} x2={12} y2={21.1} />
    </g>
  ),
  /* folder */
  folder: (
    <g {...S}>
      <path d="M2.6 19V6.2a1.6 1.6 0 0 1 1.6-1.6h4.5l2.2 2.6h9a1.6 1.6 0 0 1 1.6 1.6V19a1.6 1.6 0 0 1-1.6 1.6H4.2A1.6 1.6 0 0 1 2.6 19Z" />
      <line x1={2.6} y1={9.6} x2={21.5} y2={9.6} />
    </g>
  ),
  /* repository branch */
  branch: (
    <g {...S}>
      <circle cx={6.5} cy={5.2} r={2.4} />
      <circle cx={6.5} cy={18.8} r={2.4} />
      <circle cx={17.5} cy={9} r={2.4} />
      <path d="M6.5 7.6v8.8M17.5 11.4v.6a4 4 0 0 1-4 4H6.5" />
    </g>
  ),
};

export function Glyph({ name, size = 20 }: { name: GlyphName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {glyphs[name]}
    </svg>
  );
}
