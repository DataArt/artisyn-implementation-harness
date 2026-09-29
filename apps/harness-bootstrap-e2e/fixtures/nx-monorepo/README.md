A minimal Nx-shaped project root (root `package.json`/`nx.json`, one trimmed
`apps/*` workspace) used as the `--root` target for BOOT-* cases. The harness
package itself is never baked into this fixture — `installSkillPackage()`
copies the real, current `.canonical-implementation-harness` into it fresh at
test time, so cases always exercise the actual canonical content.
