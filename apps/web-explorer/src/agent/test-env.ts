// Imported first by tools.test.ts: commands.ts reads the version when it is first imported,
// and Next inlines it at build time, so plain Node needs it set beforehand.
process.env.HARNESS_VERSION ??= '9.9.9';
