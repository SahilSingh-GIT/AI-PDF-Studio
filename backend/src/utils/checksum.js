/**
 * utils/checksum.js — SHA-256 file checksum utility.
 *
 * Computes a SHA-256 hex digest by streaming the file through Node's
 * built-in crypto module. No external dependencies required.
 *
 * Why SHA-256?
 *   - Collision-resistant enough for document deduplication
 *   - Future: if the same file is uploaded twice, skip redundant AI processing
 */

import { createHash } from 'crypto';
import { createReadStream } from 'fs';

/**
 * Compute the SHA-256 checksum of a file.
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<string>} Hex-encoded SHA-256 digest
 */
export const computeChecksum = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(new Error(`Checksum failed for ${filePath}: ${err.message}`)));
  });
};

export default { computeChecksum };
