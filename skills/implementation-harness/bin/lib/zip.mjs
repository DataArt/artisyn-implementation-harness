/** A small ZIP reader for the release asset: stored and deflated entries, CRC-checked, with no
 * dependencies. Everything is validated and decompressed in memory before a single file is
 * written, so a bad archive leaves the destination untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const END_OF_DIRECTORY = 0x06054b50;
const CENTRAL_ENTRY = 0x02014b50;
const LOCAL_ENTRY = 0x04034b50;
// Generous for a package of a few MB, small enough that a hostile archive cannot exhaust memory.
const MAX_ENTRY_BYTES = 128 * 1024 * 1024;
const MAX_TOTAL_BYTES = 256 * 1024 * 1024;

function unsafeName(name) {
  return (
    name === '' ||
    name.includes('\\') ||
    name.includes('\0') ||
    name.startsWith('/') ||
    /^[a-zA-Z]:/.test(name) ||
    name.split('/').some((part) => part === '..')
  );
}

function findEndOfDirectory(buffer) {
  for (
    let offset = buffer.length - 22;
    offset >= Math.max(0, buffer.length - 22 - 0xffff);
    offset -= 1
  ) {
    if (buffer.readUInt32LE(offset) === END_OF_DIRECTORY) return offset;
  }
  throw new Error('Not a ZIP archive: no end-of-directory record');
}

function readEntries(buffer) {
  const end = findEndOfDirectory(buffer);
  const count = buffer.readUInt16LE(end + 10);
  let offset = buffer.readUInt32LE(end + 16);
  let total = 0;
  const entries = [];
  for (let index = 0; index < count; index += 1) {
    if (buffer.readUInt32LE(offset) !== CENTRAL_ENTRY)
      throw new Error('Corrupt archive: bad directory entry');
    const method = buffer.readUInt16LE(offset + 10);
    const crc = buffer.readUInt32LE(offset + 16);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const size = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
    entries.push({ name, method, crc, compressedSize, size, localOffset });
    total += size;
    if (size > MAX_ENTRY_BYTES || total > MAX_TOTAL_BYTES)
      throw new Error(`Archive too large: ${name} declares ${size} bytes`);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function readData(buffer, entry) {
  const at = entry.localOffset;
  if (buffer.readUInt32LE(at) !== LOCAL_ENTRY)
    throw new Error(`Corrupt archive: bad local header for ${entry.name}`);
  const start = at + 30 + buffer.readUInt16LE(at + 26) + buffer.readUInt16LE(at + 28);
  const body = buffer.subarray(start, start + entry.compressedSize);
  let data;
  if (entry.method === 0) data = body;
  else if (entry.method === 8) {
    try {
      // Never inflate past the size the directory declares: a lying header cannot exhaust memory.
      data = zlib.inflateRawSync(body, { maxOutputLength: Math.max(entry.size, 1) });
    } catch {
      throw new Error(`Corrupt archive: ${entry.name} does not inflate to its declared size`);
    }
  } else throw new Error(`Unsupported compression method ${entry.method} for ${entry.name}`);
  if (data.length !== entry.size || zlib.crc32(data) !== entry.crc)
    throw new Error(`Corrupt archive: CRC mismatch for ${entry.name}`);
  return data;
}

/** Extract `buffer` into `destination`. Returns the written files as POSIX relative paths. */
export function extractZip(buffer, destination) {
  const entries = readEntries(buffer);
  const files = [];
  for (const entry of entries) {
    if (unsafeName(entry.name))
      throw new Error(`Unsafe path in archive, outside the destination: ${entry.name}`);
    if (!entry.name.endsWith('/')) files.push({ name: entry.name, data: readData(buffer, entry) });
  }
  const written = [];
  for (const { name, data } of files) {
    const target = path.join(destination, ...name.split('/'));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
    written.push(name);
  }
  return written;
}
