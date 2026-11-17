/** Nx Release changelog renderer for the harness, in the format semantic-release wrote with the
 * conventionalcommits preset (the root CHANGELOG.md keeps examples):
 *
 *   ## [4.1.0](<repo>/compare/<previous tag>...<tag>) (2026-11-20)
 *
 *   ### ⚠ BREAKING CHANGES
 *   - **harness:** <breaking note>
 *
 *   ### Features
 *   - **harness:** <subject> ([abc1234](<repo>/commit/<hash>))
 *
 * Sections: breaking changes, then Features, Bug Fixes, Performance Improvements, Reverts. Bullets
 * are sorted by scope, then subject. The first release has no previous tag, so its heading has no
 * compare link. Hidden commit types (refactor, docs, chore, ci, test, ...) stay out. Wired in
 * nx.json (`release.changelog`). Nx loads it with require(), which loads an ES module on Node 24.
 */
import { execFileSync } from 'node:child_process';
import changelogRenderer from 'nx/release/changelog-renderer';

const DefaultChangelogRenderer = changelogRenderer.default ?? changelogRenderer;

const REPO_URL = 'https://github.com/DataArt/artisyn-implementation-harness';
const TAG_PREFIX = 'v';
const SECTIONS = [
  ['feat', 'Features'],
  ['fix', 'Bug Fixes'],
  ['perf', 'Performance Improvements'],
  ['revert', 'Reverts'],
];

const git = (args) => {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
};

/** The release before this one: the newest harness tag reachable from HEAD. */
const previousTag = () =>
  git(['tag', '--merged', 'HEAD', '--list', `${TAG_PREFIX}*`, '--sort=-version:refname'])
    .split('\n')
    .find(Boolean);

const today = () => new Date().toISOString().slice(0, 10);
const scopeOf = (change) => (change.scope ? `**${change.scope}:** ` : '');
const byScopeThenSubject = (a, b) =>
  (a.scope ?? '').localeCompare(b.scope ?? '') || a.description.localeCompare(b.description);

export default class HarnessChangelogRenderer extends DefaultChangelogRenderer {
  async render() {
    this.preprocessChanges();
    if (this.shouldRenderEmptyEntry()) return this.renderEmptyEntry();

    const version = this.changelogEntryVersion;
    const previous = previousTag();
    const title = previous
      ? `## [${version}](${REPO_URL}/compare/${previous}...${TAG_PREFIX}${version}) (${today()})`
      : `## ${version} (${today()})`;
    const out = [title];

    const breaking = this.relevantChanges.filter((change) => change.isBreaking);
    if (breaking.length > 0) {
      out.push('', '### ⚠ BREAKING CHANGES', '');
      for (const change of [...breaking].sort(byScopeThenSubject)) {
        const note = this.extractBreakingChangeExplanation(change.body) ?? change.description;
        out.push(`- ${scopeOf(change)}${note.trim().replace(/\s*\n\s*/g, ' ')}`);
      }
    }

    const types = this.conventionalCommitsConfig?.types ?? {};
    for (const [type, heading] of SECTIONS) {
      if (types[type]?.changelog?.hidden) continue;
      const changes = this.relevantChanges.filter((change) => change.type === type);
      if (changes.length === 0) continue;
      out.push('', `### ${heading}`, '');
      for (const change of [...changes].sort(byScopeThenSubject)) {
        const hash = change.shortHash;
        const full = hash ? git(['rev-parse', hash]) || hash : '';
        const link = hash ? ` ([${hash}](${REPO_URL}/commit/${full}))` : '';
        out.push(`- ${scopeOf(change)}${change.description}${link}`);
      }
    }
    return out.join('\n');
  }
}
