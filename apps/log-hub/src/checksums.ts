import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verifies every file named in a `SHA256SUMS`-format listing against the files actually present
 * under `dir`. Throws a descriptive error naming the first mismatching or missing file; does
 * nothing else on success.
 *
 * SHA256SUMS line format: `<64-hex-char digest><two spaces><filename>` (the standard `sha256sum`
 * output format), one entry per line. Blank lines and trailing CRLF are tolerated.
 */
export function verifySha256Sums(dir: string, sumsFileContent: string): void {
  const lines = sumsFileContent
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.trim().length > 0);

  for (const line of lines) {
    const match = /^([0-9a-f]{64})\s{2}(.+)$/i.exec(line.trim());
    if (!match) {
      throw new Error(`SHA256SUMS: could not parse line: ${JSON.stringify(line)}`);
    }
    const [, expectedDigest, filename] = match;
    const filePath = join(dir, filename);

    let contents: Buffer;
    try {
      contents = readFileSync(filePath);
    } catch {
      throw new Error(
        `SHA256SUMS: file missing or unreadable: ${filename} (expected at ${filePath})`
      );
    }

    const actualDigest = createHash('sha256').update(contents).digest('hex');
    if (actualDigest.toLowerCase() !== expectedDigest.toLowerCase()) {
      throw new Error(
        `SHA256SUMS: checksum mismatch for ${filename} — expected ${expectedDigest}, got ${actualDigest}`
      );
    }
  }
}
