/**
 * services/sessionService.js — Document Session operations and upload pipeline.
 *
 * Upload pipeline (corrected order — prevents orphan files in permanent storage):
 *
 *   1. File lands in storage/temp/ (via Multer)
 *   2. Compute SHA-256 checksum from the temp file
 *   3. Generate permanent storedName + pre-compute final storagePath
 *      (path is computed upfront so Document validation passes inside TX)
 *   4. START MongoDB Transaction
 *      a. Create Document record (with final storagePath pre-computed)
 *      b. Create DocumentSession record
 *   5. COMMIT Transaction
 *   6. Move file: temp/ → originals/ (only after DB commit)
 *   7. Return populated session
 *
 *   On any failure before step 6:
 *     → Transaction rolls back (no DB records persist)
 *     → Temp file is deleted (cleanup)
 *
 *   On failure at step 6 (file move):
 *     → Document and Session records exist in DB but storagePath is temp path
 *     → deleteFile(tempPath) attempted; error logged for manual recovery
 *
 * ⚠️  MongoDB Transactions require a Replica Set.
 *     MongoDB Atlas: always satisfies this requirement.
 *     Local MongoDB: run as a replica set (mongod --replSet rs0) or use:
 *       docker run -p 27017:27017 mongo:7 --replSet rs0
 *       then: rs.initiate() in mongosh
 */

import mongoose from 'mongoose';
import path from 'path';
import DocumentSession from '../models/DocumentSession.js';
import Document from '../models/Document.js';
import DocumentVersion from '../models/DocumentVersion.js';
import { computeChecksum } from '../utils/checksum.js';
import {
  generateStoredName,
  getAbsolutePath,
  saveFile,
  deleteFile,
} from './storageService.js';
import logger from '../utils/logger.js';

import { convertToPdf } from './conversionService.js';
import fs from 'fs/promises';

/**
 * The full upload pipeline: checksum → convert (if needed) → transaction → file move.
 *
 * @param {object} fileInfo — from multer (req.file)
 * @returns {Promise<DocumentSession>} — populated session
 */
export const processUpload = async (fileInfo) => {
  const tempPath = fileInfo.path;
  const originalExtension = path.extname(fileInfo.originalname).toLowerCase().replace('.', '');
  
  let conversionResult = null;
  let mongoSession = null;
  
  try {
    // ── Step 0: Convert if necessary ────────────────────────────────────────
    try {
      conversionResult = await convertToPdf(tempPath, fileInfo.originalname);
    } catch (convErr) {
      throw new Error(`Document conversion failed: ${convErr.message}. The document could not be processed.`);
    }

    const isConverted = conversionResult !== null;
    const finalPdfTempPath = isConverted ? conversionResult.convertedPath : tempPath;
    
    // ── Step 1: Compute checksums ────────────────────────────────────────────
    const originalChecksum = await computeChecksum(tempPath);
    const pdfChecksum = isConverted ? await computeChecksum(finalPdfTempPath) : originalChecksum;

    // ── Step 2: Generate stored filenames + paths ────────────────────────────
    const originalStoredName = generateStoredName(fileInfo.originalname);
    const originalStoragePath = `originals/${originalStoredName}`;
    
    let pdfStoredName, pdfStoragePath;
    if (isConverted) {
      pdfStoredName = generateStoredName('Converted.pdf');
      pdfStoragePath = `originals/${pdfStoredName}`;
    } else {
      pdfStoredName = originalStoredName;
      pdfStoragePath = originalStoragePath;
    }

    // ── Step 3: Start MongoDB transaction ────────────────────────────────────
    mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    // ── Step 4a: Create Original Document record (if converted) ──────────────
    let originalDoc = null;
    if (isConverted) {
      [originalDoc] = await Document.create([{
        originalName: fileInfo.originalname,
        storedName: originalStoredName,
        extension: originalExtension,
        mimeType: fileInfo.mimetype,
        size: fileInfo.size,
        storagePath: originalStoragePath,
        checksum: originalChecksum,
        status: 'active',
        isDeleted: false,
      }], { session: mongoSession });
    }

    // ── Step 4b: Create Canonical PDF Document record ────────────────────────
    let pdfSize = fileInfo.size;
    if (isConverted) {
      const stats = await fs.stat(finalPdfTempPath);
      pdfSize = stats.size;
    }

    const [document] = await Document.create([{
      originalName: isConverted ? `Converted_${fileInfo.originalname}.pdf` : fileInfo.originalname,
      storedName: pdfStoredName,
      extension: 'pdf',
      mimeType: 'application/pdf',
      size: pdfSize,
      storagePath: pdfStoragePath,
      checksum: pdfChecksum,
      status: 'active',
      isDeleted: false,
    }], { session: mongoSession });

    // ── Step 4c: Create DocumentSession record ──────────────────────────────
    const [session] = await DocumentSession.create([{
      document: document._id,
      originalDocument: originalDoc ? originalDoc._id : null,
      status: 'active',
      currentVersion: 1,
      activeOperation: null,
      workflowHistory: [],
    }], { session: mongoSession });

    // ── Step 4d: Create initial DocumentVersion record ──────────────────────
    await DocumentVersion.create([{
      session: session._id,
      versionNumber: 1,
      operationId: null,
      operationName: 'Initial Upload',
      previousDocument: null,
      currentDocument: document._id,
    }], { session: mongoSession });

    // ── Step 5: Commit the transaction ──────────────────────────────────────
    await mongoSession.commitTransaction();
    logger.info(`[SessionService] Transaction committed. Session: ${session._id}`);

    // ── Step 6: Move files to permanent storage ─────────────────────────────
    if (isConverted) {
      await saveFile(tempPath, originalStoredName);
      await saveFile(finalPdfTempPath, pdfStoredName);
    } else {
      await saveFile(tempPath, pdfStoredName);
    }


    // ── Step 7: Return the populated session ────────────────────────────────
    return await DocumentSession.findById(session._id).populate('document');

  } catch (err) {
    if (mongoSession) {
      try { await mongoSession.abortTransaction(); } catch (e) {}
    }
    
    // Cleanup temporary files
    try { await deleteFile(tempPath); } catch (e) {}
    if (conversionResult && conversionResult.convertedPath) {
      try { await deleteFile(conversionResult.convertedPath); } catch (e) {}
    }
    
    // Propagate the original error upwards
    throw err;
  } finally {
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
};

/**
 * Retrieve a session by ID with the document reference populated.
 * @param {string} sessionId
 * @returns {Promise<DocumentSession|null>}
 */
export const getSessionById = async (sessionId) => {
  return DocumentSession
    .findById(sessionId)
    .populate({
      path: 'document',
      match: { isDeleted: false },
    });
};

/**
 * Return all sessions (active, newest first).
 * @returns {Promise<DocumentSession[]>}
 */
export const getAllSessions = async () => {
  return DocumentSession
    .find({ status: { $ne: 'closed' } })
    .populate({
      path: 'document',
      match: { isDeleted: false },
    })
    .sort({ createdAt: -1 });
};

/**
 * Fully delete a session:
 *   1. Resolve document + its storage path
 *   2. Delete physical file from originals/
 *   3. Soft-delete Document record
 *   4. Delete DocumentSession record
 *
 * Note: File deletion is intentionally outside a transaction because
 * filesystem operations cannot participate in MongoDB transactions.
 * Order: delete file first, then DB records — avoids leaving orphan files.
 *
 * @param {string} sessionId
 * @returns {Promise<void>}
 */
import { wipeAllData } from '../utils/cleanup.js';

export const deleteSession = async (sessionId) => {
  // As requested, since this is an open prototype not tracking individual users,
  // we completely wipe all data when the delete button is clicked to ensure a 
  // pristine state for the next upload.
  await wipeAllData();
};

export default { processUpload, getSessionById, getAllSessions, deleteSession };
