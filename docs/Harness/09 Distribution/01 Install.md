---
id: 5b93d0e8
purpose: Install checklist per channel (skills.sh, gh skill, plugin marketplace, npmjs.com, GitHub Packages npm, Release ZIP), where each channel lands, launch commands per host, how to verify a download, and install CLI init options
keywords:
  [
    install,
    implementation-harness,
    checklist,
    github packages,
    npmjs,
    npmrc,
    release zip,
    plugin marketplace,
    skills.sh,
    gh skill,
    install cli,
    init,
    doctor,
    attestation,
    launch,
  ]
---

# Install

Pick one channel. Every channel installs the same package. The project's state lives in `.harness/state/`. After the install, run the launch command (see Launch below).

| #   | Channel                    | Pick it when                                                   |
| --- | -------------------------- | -------------------------------------------------------------- |
| 1   | skills.sh (available soon) | You want a one-command install and don't need a pinned version |
| 2   | gh skill                   | You already work through the GitHub CLI                        |
| 3   | Plugin marketplace         | Your agent host installs plugins from a marketplace            |
| 4   | npmjs.com (available soon) | You want an npm install without a token                        |
| 5   | GitHub Packages (npm)      | You have a GitHub token with `read:packages`                   |
| 6   | Release ZIP                | You want verified files and no token                           |

The examples use version `4.0.0`. Put the version you want in its place — `4.0.0` or higher. All released versions are on the [releases page](https://github.com/DataArt/artisyn-implementation-harness/releases).

Run the commands below in the project that installs the harness. Inside the harness source repository, use `yarn` instead of `npm`/`npx`.

## 1. skills.sh (available soon)

The harness is not listed on skills.sh yet. skills.sh installs from the default branch; it can include changes that are not in a released version yet. The listing shows only `implementation-harness`; the repository's own lifecycle skills are marked `metadata.internal: true`.

**Lands in:** the provider skills folders the tool detects, e.g. `.claude/skills/implementation-harness/` and `.agents/skills/implementation-harness/`. The installed commit is recorded in `skills-lock.json`.

```bash
npx skills add DataArt/artisyn-implementation-harness --skill implementation-harness
```

## 2. gh skill

You need the [GitHub CLI](https://cli.github.com/).

**Lands in:** `.github/skills/implementation-harness/`, pinned to the release tag.

Pin the release tag with `@`:

```bash
gh skill install DataArt/artisyn-implementation-harness implementation-harness@artisyn-implementation-harness-v4.0.0 --scope project
```

## 3. Plugin marketplace

All three hosts read the same marketplace, `dataart`, and install the same plugin, `artisyn`. The
marketplace pins a release tag, so a new version appears only after its release is approved and
published.

**Lands in:** the host's plugin cache, outside the project — for Claude Code, `~/.claude/plugins/cache/dataart/artisyn/<version>/`. The cache holds only the harness skill package, not the repository. The project itself only records the marketplace and plugin references.

### Install

#### Claude Code

```bash
claude plugin marketplace add DataArt/artisyn-implementation-harness --scope project
claude plugin install artisyn@dataart --scope project
```

`--scope project` declares the marketplace and the plugin in the project's `.claude/settings.json`,
so everyone who opens the project gets the same plugin. Without it, both go to your user settings
and apply to all your projects, but not to your teammates.

#### Codex

```bash
codex plugin marketplace add DataArt/artisyn-implementation-harness
```

Then install `artisyn` from `/plugins`.

#### Copilot CLI

```bash
copilot plugin marketplace add DataArt/artisyn-implementation-harness
copilot plugin install artisyn@dataart
```

## 4. npmjs.com (available soon)

The package is not published to npmjs.com yet. Once it is, no token or `.npmrc` is needed.

**Lands in:** the first detected provider's skills folder, e.g. `.claude/skills/implementation-harness/` — pass `--provider claude|codex|copilot` to choose. `init` also creates `.harness/state/` and prints the launch command.

### Install

```bash
npx @dataart/artisyn-implementation-harness@4.0.0 init
npx @dataart/artisyn-implementation-harness@4.0.0 doctor
```

## 5. GitHub Packages (npm)

You need a GitHub token with `read:packages`. Create one under [Settings → Personal access tokens](https://github.com/settings/personal-access-tokens).

**Lands in:** the first detected provider's skills folder, e.g. `.claude/skills/implementation-harness/` — pass `--provider claude|codex|copilot` to choose. `init` also creates `.harness/state/` and prints the launch command.

### Install

Add `.npmrc` to the project. The scope line can be committed. The token comes from the environment, never from the repository.

```ini
@dataart:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Put the token in the environment:

```bash
export GITHUB_TOKEN=github_pat_...
```

Install and check:

```bash
npx @dataart/artisyn-implementation-harness@4.0.0 init
npx @dataart/artisyn-implementation-harness@4.0.0 doctor
```

## 6. Release ZIP

No token needed. The attestation check in step 3 uses the [GitHub CLI](https://cli.github.com/).

**Lands in:** the provider skills folder you unzip into (`.claude/skills/`, `.agents/skills/` or `.github/skills/`). The install CLI path behaves like the npm channels: it picks the folder, creates `.harness/state/` and prints the launch command.

### Install

1. On the [releases page](https://github.com/DataArt/artisyn-implementation-harness/releases), open the release for the version, e.g. [v4.0.0](https://github.com/DataArt/artisyn-implementation-harness/releases/tag/artisyn-implementation-harness-v4.0.0).
2. Download `artisyn-implementation-harness-v4.0.0.zip` and `artisyn-implementation-harness-v4.0.0.zip.sha256`. Don't use GitHub's "Source code (zip)": it is the whole repository.
3. Verify:

   ```bash
   shasum -a 256 -c artisyn-implementation-harness-v4.0.0.zip.sha256
   gh attestation verify artisyn-implementation-harness-v4.0.0.zip --repo DataArt/artisyn-implementation-harness
   ```

4. Install one of two ways:
   - Unzip into the provider skills folder: `.claude/skills/`, `.agents/skills/` or `.github/skills/`. The ZIP's top folder is already `implementation-harness/`.
   - Or unzip outside the project and run the bundled install CLI from the project root:

     ```bash
     node implementation-harness/bin/artisyn-implementation-harness.mjs init --channel zip
     ```

     `--channel zip` lets `update` fetch later releases as ZIPs.

## Launch

Run the launch command once. The command depends on the host and on whether the harness came in as a skill (channels 1, 2, 4, 5, 6) or as the marketplace plugin (channel 3).

| Host        | Skill install                    | Plugin install                           |
| ----------- | -------------------------------- | ---------------------------------------- |
| Claude Code | `/implementation-harness launch` | `/artisyn:implementation-harness launch` |
| Codex       | `$implementation-harness launch` | `$artisyn:implementation-harness launch` |
| Copilot CLI | `/implementation-harness launch` | `/artisyn:implementation-harness launch` |

On Codex, if the plugin's skill is listed without a prefix, use `$implementation-harness launch`.

To check the install itself, run the install CLI's `doctor` (channels 4–6): it reports the installed packages, their versions and the health of `.harness/state/`, and exits 1 when it finds a problem.

## Known limits

- On Windows, keep the project path short. Paths inside the package reach about 165 characters; the Windows limit is 260.

## Verifying a download

Every release artifact has a build attestation from the release workflow.

| Artifact              | How to verify                                                                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release ZIP           | `shasum -a 256 -c` on the `.sha256` file, then `gh attestation verify` on the ZIP (channel 6, Install step 3)                                                                                                              |
| GitHub Packages (npm) | The published package is the attested tarball. Fetch it with `npm pack @dataart/artisyn-implementation-harness@4.0.0`, then run `gh attestation verify` on the `.tgz` with `--repo DataArt/artisyn-implementation-harness` |

## Install CLI options

The install CLI (`init`, `update`, `doctor`) ships in the npm package and the ZIP. It needs Node 22.2 or newer.

| Option / variable                   | Effect                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `--provider claude\|codex\|copilot` | Provider to install for; repeatable. Default: detect `.claude/`, `.agents/`, `.github/` in that order. None found exits 2 |
| `--channel npm\|zip`                | How the package was obtained. Default `npm`                                                                               |
| `--force`                           | Replace a different installed version                                                                                     |
| `--dir <path>`                      | Project root. Default: the git top level, else the working directory                                                      |
| `ARTISYN_HARNESS_PROJECT_ROOT`      | Environment override for the project root (CI and tests); checked before git                                              |
| `--release-base-url <url>`          | Release origin for the zip channel's `update`. `https:` or loopback `http:` only                                          |

→ Next: [Update](<./02 Update.md>).
