# Distribution

- [Distribution Overview](00%20Overview.md) - How the Artisyn Implementation Harness is distributed — package identity, the five pinned channels, the install contract and the inbound improvement path
- [Install](01%20Install.md) - Install checklist per channel (skills.sh, gh skill, plugin marketplace, npmjs.com, GitHub Packages npm, Release ZIP), where each channel lands, launch commands per host, how to verify a download, and install CLI init options
- [Update](02%20Update.md) - Update commands per channel, the one-time manual update for ZIP installs on 4.0.2 or earlier after the switch to v<version> tags, the 4.2.0 OG schema v1 update, the install CLI update rules, doctor, and how patch apply reads baselines after an update
- [Versioning and Releases](03%20Versioning%20and%20Releases.md) - The harness version contract — one stamped semantic version, the v<version> release tag (long tags up to 4.0.2, the v4.0.2 bridge tag), the release workflow (automatic build on merge, publish after approval) and its re-run behaviour, per-channel integrity and attestations, and rollback
