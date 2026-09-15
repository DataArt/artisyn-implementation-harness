// Helpers owned by the dev metrics CLI; no dependency on another flow.
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

/** Throw an Error with the given message. */
export const fail = (message) => {
  throw new Error(message);
};

/**
 * Assert that a value is truthy.
 * @template T
 * @param {T} value
 * @param {string} message Error message when the value is falsy.
 * @returns {T} The value itself.
 */
export const need = (value, message) => value || fail(message);

/**
 * Assert that a value is one of the allowed values.
 * @template T
 * @param {T} value
 * @param {readonly T[]} values
 * @returns {T} The value itself.
 */
export const member = (value, values) =>
  values.includes(value) ? value : fail(`Expected one of ${values.join(', ')}; got ${value}`);

/** @returns {string} The current UTC timestamp in ISO-8601 with a trailing Z. */
export const utc = () => new Date().toISOString();

/**
 * Whether a value is a parseable UTC ISO-8601 timestamp (`...Z`).
 * @param {unknown} value
 * @returns {boolean}
 */
export const stamp = (value) =>
  typeof value === 'string' &&
  /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) &&
  Number.isFinite(Date.parse(value));

/**
 * Signed duration from `a` to `b`.
 * @param {string} a Start timestamp.
 * @param {string} b End timestamp.
 * @returns {number} Seconds; negative when `b` precedes `a`.
 */
export const seconds = (a, b) => (Date.parse(b) - Date.parse(a)) / 1000;

/**
 * A unit's most recent attempt.
 * @param {{attempts: object[]}} unit
 * @returns {object|undefined}
 */
export const last = (unit) => unit.attempts.at(-1);

/**
 * Write a file via a unique temp file and rename, so readers never observe
 * a torn write; the temp file is removed on failure.
 * @param {string} file Destination path.
 * @param {string} value Full file contents.
 */
export const atomic = (file, value) => {
  const temp = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temp, value);
    fs.renameSync(temp, file);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
};

/**
 * Escape a value for a one-line Markdown table cell.
 * @param {unknown} value Nullish values render as "unavailable".
 * @returns {string}
 */
export const escapeMarkdownCell = (value) =>
  String(value ?? 'unavailable')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
