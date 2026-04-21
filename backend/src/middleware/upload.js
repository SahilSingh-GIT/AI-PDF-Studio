/**
 * middleware/upload.js — Multer upload middleware factory.
 *
 * Handles multipart/form-data file uploads.
 * Files land in storage/temp/ first, then the upload pipeline
 * moves them to storage/originals/ via storageService.
 *
 * Validation:
 *   - File type: enforced via MIME type allowlist (returns 415)
 *   - File size: 100MB limit (returns 413)
 *   - Field name: 'document' (single file)
 */

import multer from 'multer';
import path from 'path';
import { getTempDir } from '../services/storageService.js';
import { ALLOWED_MIME_TYPES, UPLOAD_FIELD_NAME, HTTP_STATUS } from '../constants/index.js';
import config from '../config/env.js';

// ── Storage Engine ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getTempDir());
  },
  filename: (_req, file, cb) => {
    // Use a safe temp name — storageService will rename on move
    const safeName = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, safeName);
  },
});

// ── File Filter ───────────────────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Unsupported file type: ${file.mimetype}. ` +
      `Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
    err.statusCode = HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE;
    err.code = 'UNSUPPORTED_FILE_TYPE';
    cb(err, false);
  }
};

// ── Multer Instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
    files: 1,
  },
});

/**
 * Middleware: single document upload.
 * Wraps multer to convert multer-specific errors into our standard error format.
 */
export const uploadSingle = (req, res, next) => {
  upload.single(UPLOAD_FIELD_NAME)(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      err.statusCode = HTTP_STATUS.PAYLOAD_TOO_LARGE;
      err.message = `File exceeds the ${config.maxFileSizeMb}MB size limit.`;
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      err.message = `Unexpected field. Use the field name "${UPLOAD_FIELD_NAME}".`;
    }

    next(err);
  });
};

export default { uploadSingle };
