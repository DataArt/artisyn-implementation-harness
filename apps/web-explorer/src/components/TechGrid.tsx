import {
  siReact,
  siTypescript,
  siVite,
  siTailwindcss,
  siReactquery,
  siRadixui,
  siTerraform,
  siDocker,
  siNx,
} from 'simple-icons';

type Brand = { title: string; hex: string; path: string };

const SLATE = '#5B7083';

export type Tech = {
  /** simple-icons brand */
  brand?: Brand;
  /** lettered tile fallback where no official mark exists (kept generic — no vendor lock-in implied) */
  letter?: string;
  color?: string;
  name: string;
  note: string;
};

export const stack = {
  app: [
    { brand: siReact, name: 'React 19', note: 'the entire frontend' },
    { brand: siTypescript, name: 'TypeScript', note: 'strict, across every layer' },
    { brand: siVite, name: 'Vite', note: 'build and dev server' },
    { brand: siTailwindcss, name: 'Tailwind', note: 'styling' },
    { brand: siRadixui, name: 'Radix UI', note: 'base components' },
    { brand: siReactquery, name: 'TanStack Query', note: 'data fetching and caching' },
    {
      letter: 'BFF',
      color: SLATE,
      name: 'Backend-for-frontend',
      note: 'any Node framework, OpenAPI-documented',
    },
  ] as Tech[],
  data: [
    { letter: 'DB', color: SLATE, name: 'Relational database', note: 'precomputed for reads' },
    { letter: 'OR', color: SLATE, name: 'ORM', note: 'schema and migrations' },
    { letter: 'DW', color: SLATE, name: 'Data warehouse', note: 'upstream data source' },
  ] as Tech[],
  platform: [
    { letter: 'C', color: SLATE, name: 'Cloud provider', note: 'compute, storage, secrets' },
    { letter: 'Fn', color: SLATE, name: 'Serverless functions', note: 'compute pipeline' },
    { brand: siTerraform, name: 'IaC (Terraform or CDK)', note: 'infrastructure as code' },
    { brand: siDocker, name: 'Docker', note: 'BFF images' },
    { letter: 'CI', color: SLATE, name: 'Managed CI/CD', note: 'build & deploy pipelines' },
    { brand: siNx, name: 'Nx', note: 'monorepo' },
  ] as Tech[],
};

function Mark({ tech }: { tech: Tech }) {
  if (tech.brand) {
    return (
      <svg viewBox="0 0 24 24" className="tech__mark" role="img" aria-label={tech.brand.title}>
        <path d={tech.brand.path} fill={`#${tech.brand.hex}`} />
      </svg>
    );
  }
  return (
    <span className="tech__letter" style={{ background: tech.color }} aria-hidden>
      {tech.letter}
    </span>
  );
}

export function TechGrid({ items }: { items: Tech[] }) {
  return (
    <div className="tech-grid">
      {items.map((t) => (
        <div className="tech" key={t.name}>
          <Mark tech={t} />
          <div>
            <div className="tech__name">{t.name}</div>
            <div className="tech__note">{t.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
