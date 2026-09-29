export interface FixtureContainer {
  name: string;
  path: string;
  evidence: string[];
  stack: string[];
}
export interface FixtureDefinition {
  id: string;
  path: string;
  projectName: string;
  purpose: string;
  populated: boolean;
  hasHarness: boolean;
  hasDocs: boolean;
  containers: FixtureContainer[];
}

/** Repository facts only. Requested integrations and lifecycles belong to cases. */
export const fixtures = {
  nxMonorepo: {
    id: 'nx-monorepo',
    path: 'nx-monorepo',
    projectName: 'E2E Fixture Project',
    purpose: 'A minimal disposable Nx repository for deterministic harness launch tests.',
    populated: true,
    hasHarness: false,
    hasDocs: false,
    containers: [
      { name: 'sample-app', path: 'apps/sample-app', evidence: ['package.json'], stack: [] },
    ],
  },
  multiContainerProject: {
    id: 'multi-container-project',
    path: 'multi-container-project',
    projectName: 'Multi-container Fixture Project',
    purpose:
      'A minimal disposable fixture repository used only to smoke-test the harness-bootstrap skill’s own launch flow. Not a real product.',
    populated: true,
    hasHarness: false,
    hasDocs: false,
    containers: [
      { name: 'fe', path: 'apps/fe', evidence: ['package.json'], stack: ['react'] },
      { name: 'be', path: 'apps/be', evidence: ['package.json'], stack: ['express'] },
      {
        name: 'infra',
        path: 'apps/infra',
        evidence: ['package.json', 'cdk.json'],
        stack: ['aws-cdk-lib'],
      },
      { name: 'mobile', path: 'apps/mobile', evidence: ['package.json'], stack: ['react-native'] },
    ],
  },
  installedHarness: {
    id: 'installed-harness',
    path: 'installed-harness',
    projectName: 'Installed Harness Fixture',
    purpose: 'Reserved for a project with an existing harness; not populated yet.',
    populated: false,
    hasHarness: false,
    hasDocs: false,
    containers: [],
  },
} satisfies Record<string, FixtureDefinition>;
