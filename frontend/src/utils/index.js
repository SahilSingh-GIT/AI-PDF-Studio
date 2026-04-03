/**
 * utils/index.js — Shared frontend utility functions.
 *
 * Keep functions pure and side-effect-free.
 * Group by domain as the file grows, or split into separate files.
 */

// ── File Utilities ────────────────────────────────────────────────────────────

/**
 * Format bytes into a human-readable string.
 * @param {number} bytes
 * @param {number} [decimals=2]
 * @returns {string}
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Extract filename without extension.
 * @param {string} filename
 * @returns {string}
 */
export const stripExtension = (filename) =>
  filename.replace(/\.[^/.]+$/, '');

// ── String Utilities ──────────────────────────────────────────────────────────

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Truncate a string to maxLength with an ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 40) =>
  str && str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;

// ── Date Utilities ────────────────────────────────────────────────────────────

/**
 * Format a date to a readable string.
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date));
};

// ── Class Name Utility ────────────────────────────────────────────────────────

/**
 * Merge class names, filtering out falsy values.
 * Lightweight alternative to clsx for simple cases.
 * @param {...(string|undefined|null|false)} classes
 * @returns {string}
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
