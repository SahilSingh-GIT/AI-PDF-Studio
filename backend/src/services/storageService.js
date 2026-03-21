/**
 * services/storageService.js — File system storage abstraction.
 *
 * All file I/O goes through this service.
 * No controller or other service should touch the filesystem directly.
 *
 * Storage layout (relative to backend/):
 *   storage/
 *     originals/    ← permanent uploaded files
 *     processed/    ← processed outputs (future)
 *     thumbnails/   ← page thumbnails (future)
 *     temp/         ← multer landing zone (cleaned after pipeline)
 *
 * When AWS S3 or GCS is needed, only this file changes.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import Document from '../models/Document.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve storage root: backend/src/services → backend/storage
const STORAGE_ROOT = path.resolve(__dirname, '../..', config.storagePath);
const ORIGINALS_DIR = path.join(STORAGE_ROOT, 'originals');
const TEMP_DIR = path.join(STORAGE_ROOT, 'temp');

/**
 * Ensure all storage directories exist on startup.
 * Called once from server.js before listening.
 */
export const initStorage = async () => {
  const dirs = [
    ORIGINALS_DIR,
    path.join(STORAGE_ROOT, 'processed'),
    path.join(STORAGE_ROOT, 'thumbnails'),
    TEMP_DIR,
  ];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
  logger.info(`[Storage] Initialized at: ${STORAGE_ROOT}`);
};

/**
 * Generate a unique stored filename that preserves the extension.
 * Format: {uuid}-{timestamp}{.ext}
 * @param {string} originalName
 * @returns {string}
 */
export const generateStoredName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `${uuidv4()}-${Date.now()}${ext}`;
};

/**
 * Move a file from temp/ to originals/ (permanent storage).
 * Called AFTER the DB transaction commits successfully.
 * @param {string} tempPath - Absolute path of the temp file
 * @param {string} storedName - Target filename in originals/
 * @returns {Promise<string>} Absolute path of the stored file
 */
export const saveFile = async (tempPath, storedName) => {
  const destPath = path.join(ORIGINALS_DIR, storedName);
  try {
    await fs.rename(tempPath, destPath);
  } catch (error) {
    if (error.code === 'EXDEV') {
      await fs.copyFile(tempPath, destPath);
      await fs.unlink(tempPath);
    } else {
      throw error;
    }
  }
  logger.debug(`[Storage] Saved: ${storedName}`);
  return destPath;
};

/**
 * Delete a file from storage by its absolute path.
 * Silently ignores ENOENT (file already gone).
 * @param {string} storagePath - Absolute path of the file to delete
 */
export const deleteFile = async (storagePath) => {
  try {
    await fs.unlink(storagePath);
    logger.debug(`[Storage] Deleted: ${storagePath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw new Error(`[Storage] Failed to delete file: ${err.message}`);
    }
    logger.warn(`[Storage] File not found during delete (already gone): ${storagePath}`);
  }
};

/**
 * Check whether a file exists at the given path.
 * @param {string} storagePath
 * @returns {Promise<boolean>}
 */
export const fileExists = async (storagePath) => {
  try {
    await fs.access(storagePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Resolve the absolute path for a file from its relative storagePath.
 * @param {string} storageRelativePath (e.g. 'originals/file.pdf')
 * @returns {string}
 */
export const getAbsolutePath = (storageRelativePath) => {
  return path.join(STORAGE_ROOT, storageRelativePath);
};

/**
 * Get the temp directory path (used by multer config).
 * @returns {string}
 */
export const getTempDir = () => TEMP_DIR;

/**
 * Save a processed file buffer to storage and create a new Document record.
 * @param {Buffer|Uint8Array} buffer - The processed file data
 * @param {object} currentDocument - The original document record
 * @param {string} operationId - The ID of the operation that created it
 * @returns {Promise<object>} The new Document record
 */
export const saveProcessedFile = async (buffer, currentDocument, operationId) => {
  const PROCESSED_DIR = path.join(STORAGE_ROOT, 'processed');
  const storedName = generateStoredName(`processed_${operationId}_${currentDocument.originalName}`);
  const destPath = path.join(PROCESSED_DIR, storedName);
  
  await fs.writeFile(destPath, buffer);
  
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  const checksum = hash.digest('hex');
  
  const [newDocument] = await Document.create([{
    originalName: currentDocument.originalName,
    storedName,
    extension: currentDocument.extension,
    mimeType: currentDocument.mimeType,
    size: buffer.length,
    storagePath: `processed/${storedName}`, // Store relative path
    checksum,
    status: 'active',
    isDeleted: false
  }]);
  
  logger.debug(`[Storage] Saved processed file: ${storedName}`);
  return newDocument;
};

export default {
  initStorage,
  generateStoredName,
  saveFile,
  deleteFile,
  fileExists,
  getAbsolutePath,
  getTempDir,
  saveProcessedFile,
};
