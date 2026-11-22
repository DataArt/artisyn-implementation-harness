/**
 * The landing page's capability and pillar copy. Landing.tsx renders it with icons;
 * the get_harness_capabilities WebMCP tool returns it to agents, so both say the same.
 */
export type Capability = { title: string; text: string };
export type Pillar = { tone: 'violet' | 'blue' | 'teal'; title: string; text: string };

export const CAPABILITIES: Capability[] = [
  {
    title: 'Structured lifecycles',
    text: 'Repeatable Design and Development workflows — beyond ad-hoc prompts.',
  },
  {
    title: 'Agents and skills',
    text: 'Reusable engineering conventions and specialized, lifecycle-aware assistance.',
  },
  {
    title: 'Architecture awareness',
    text: 'Decisions and implementations checked against established constraints.',
  },
  {
    title: 'Continuous learning',
    text: 'Reflections that carry useful lessons into future work.',
  },
];

// First-viewport value statement: the three outcomes a reader should take away before scrolling.
export const PILLARS: Pillar[] = [
  {
    tone: 'violet',
    title: 'Solution Design',
    text: 'Turn requirements into a structured, reviewable design (HLD/LLD) with architectural context and guardrails.',
  },
  {
    tone: 'blue',
    title: 'Development',
    text: 'Guide AI and developers through a governed, repeatable implementation flow with quality controls and handoffs.',
  },
  {
    tone: 'teal',
    title: 'Knowledge',
    text: 'Design, code and documentation stay consistent with each other — one living knowledge base that humans and AI both rely on.',
  },
];
