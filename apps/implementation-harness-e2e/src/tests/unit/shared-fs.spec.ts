import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { isExcluded, isUnder, walkFiles } from '../../utils/fs.ts';

const roots: string[] = [];
function tmpRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shared-fs-test-'));
  roots.push(root);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('walkFiles', () => {
  // The six call sites this replaced disagreed here: some guarded the missing
  // directory themselves, others threw ENOENT.
  it('returns nothing for a directory that does not exist', () => {
    expect(walkFiles(path.join(tmpRoot(), 'absent'))).toEqual([]);
  });

  it('recurses into subdirectories and returns absolute paths', () => {
    const root = tmpRoot();
    fs.mkdirSync(path.join(root, 'nested/deeper'), { recursive: true });
    fs.writeFileSync(path.join(root, 'top.md'), '');
    fs.writeFileSync(path.join(root, 'nested/deeper/leaf.md'), '');
    expect(walkFiles(root).sort()).toEqual(
      [path.join(root, 'nested/deeper/leaf.md'), path.join(root, 'top.md')].sort()
    );
  });

  it('skips symlinked files and directories', () => {
    const root = tmpRoot();
    fs.writeFileSync(path.join(root, 'real.md'), '');
    fs.mkdirSync(path.join(root, 'target'));
    fs.writeFileSync(path.join(root, 'target/inner.md'), '');
    fs.symlinkSync(path.join(root, 'real.md'), path.join(root, 'link.md'));
    fs.symlinkSync(path.join(root, 'target'), path.join(root, 'linkdir'), 'dir');
    expect(walkFiles(root).sort()).toEqual(
      [path.join(root, 'real.md'), path.join(root, 'target/inner.md')].sort()
    );
  });
});

describe('isUnder', () => {
  it('matches the base itself and its descendants, not a sibling with a shared prefix', () => {
    expect(isUnder('/a/pkg', '/a/pkg')).toBe(true);
    expect(isUnder(path.join('/a/pkg', 'deep', 'file.md'), '/a/pkg')).toBe(true);
    expect(isUnder('/a/pkg-other/file.md', '/a/pkg')).toBe(false);
  });

  it('isExcluded matches against any of the bases', () => {
    expect(isExcluded(path.join('/a/two', 'f.md'), ['/a/one', '/a/two'])).toBe(true);
    expect(isExcluded(path.join('/a/three', 'f.md'), ['/a/one', '/a/two'])).toBe(false);
  });
});
