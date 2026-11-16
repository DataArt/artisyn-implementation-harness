---
id: a07f6c3d
purpose: Update commands per channel, the install CLI update rules, doctor, and how patch apply reads baselines after an update
keywords:
  [
    update,
    implementation-harness,
    doctor,
    install cli,
    patch apply,
    harness state,
    baseline,
    patch bundles,
  ]
---

# Update

> Applies from release 4.0.0, the first release cut by the automatic release pipeline.

Update the package through the channel it came from, then run `patch apply`.

```mermaid
flowchart LR
    CH["Channel update command\n(doctor prints it)"]
    PKG["Installed package\n(read-only, replaced)"]
    PA["patch apply"]
    ST[".harness/state/\nobjects/ baselines"]
    PF["Permanent project files"]

    CH --> PKG --> PA
    ST -->|"base bytes"| PA
    PA --> PF
    PA -->|"new baselines"| ST

    classDef channel fill:#dcfce7,stroke:#15803d,color:#14532d
    classDef consumer fill:#ede9fe,stroke:#6d28d9,color:#3b0764
    classDef state fill:#fce7f3,stroke:#be185d,color:#831843
    class CH channel
    class PKG,PA consumer
    class ST,PF state
```

## Update by channel

Each channel refreshes the package with its own pinned command; `doctor` prints the one for the recorded channel.

| Channel               | Update                                                                                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code           | `claude plugin update artisyn@dataart`                                                                                                                                                                         |
| Codex                 | `codex plugin marketplace upgrade` (not yet verified on a real Codex host)                                                                                                                                     |
| Copilot CLI           | `copilot plugin update artisyn` (not yet verified on a real Copilot CLI host)                                                                                                                                  |
| skills.sh             | `npx skills update`                                                                                                                                                                                            |
| gh skill              | `gh skill install DataArt/artisyn-implementation-harness implementation-harness@artisyn-implementation-harness-v<version> --scope project`                                                                     |
| npm (GitHub Packages) | `npx @dataart/artisyn-implementation-harness@<version> update` — the CLI updates to its own version, so pin the version you want                                                                               |
| ZIP                   | Download `artisyn-implementation-harness-v<version>.zip` and its `.sha256` from that tag's Release, or run the bundled CLI: `node <package>/bin/artisyn-implementation-harness.mjs update --version <version>` |

After every update, run `/implementation-harness patch apply`. Plugin installs use `/artisyn:implementation-harness patch apply`.

Host-native installs (marketplace, skills.sh, `gh skill`) record their channel when launch runs with `--channel`; the CLI's `update` on those installs only prints the host command above.

## CLI update rules

The CLI verifies the new package before it replaces the installed one.

| Case         | Behavior                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| npm          | Copies from the CLI's own package tree; a `--version` other than the CLI's own exits 2 and prints the `npx …@<version> update` command |
| ZIP          | Downloads the ZIP and `.sha256`, checks the ZIP bytes before extraction, extracts to a scratch folder, checks the version, then swaps  |
| Failed check | Stops. The installed package stays unchanged.                                                                                          |
| Same version | No-op                                                                                                                                  |
| Downgrade    | Exits 3 unless `--force` is passed                                                                                                     |
| `--version`  | Must be a plain semver (`1.2.3` or `1.2.3-rc.1`); anything else exits 2                                                                |

## doctor

`npx @dataart/artisyn-implementation-harness doctor` reports the health of an install and exits 1 when it finds a problem.

| Reports      | Detail                                                                    |
| ------------ | ------------------------------------------------------------------------- |
| Package      | Location and version per provider                                         |
| Version skew | Different package versions across providers                               |
| Record       | The recorded package and whether it can be found on this machine          |
| State        | Whether `.harness/state/` exists                                          |
| Commands     | The pinned update command for the recorded channel and the launch command |

## Baselines in patch apply

`patch apply` reads every base from `.harness/state/objects/`, never from the network.

- A `state/objects/<sha256>` snapshot names its object directly.
- A `release:` snapshot is a label only; the bytes are the object named by the entry's recorded sha256.
- A missing or mismatched base object stops the apply before any file is written.

→ Next: [Versioning and Releases](<./03 Versioning and Releases.md>).
