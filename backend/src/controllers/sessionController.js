/**
 * controllers/sessionController.js — Session route handlers.
 *
 * Controllers are intentionally thin:
 *   receive request → validate presence → call service → send response
 *
 * All business logic lives in sessionService.js.
 */

import {
  processUpload,
  getSessionById,
  getAllSessions,
  deleteSession,
} from '../services/sessionService.js';
import { getAbsolutePath } from '../services/storageService.js';
import { HTTP_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';
import fs from 'fs';

/**
 * POST /api/session/upload
 * Multipart/form-data — field: 'document'
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No file provided. Use the "document" field in a multipart/form-data request.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      return next(err);
    }

    const session = await processUpload(req.file);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Document uploaded and session created successfully.',
      session,
    });
  } catch (err) {
    logger.error('[SessionController] uploadDocument error:', { message: err.message });
    next(err);
  }
};


/**
 * POST /api/session/upload-temp
 * Multipart/form-data — field: 'document'
 * Uploads a temp document without creating a session.
 */
export const uploadTempDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No file provided.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      return next(err);
    }

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      path: `temp/${req.file.filename}`,
      filename: req.file.originalname,
    });
  } catch (err) {
    logger.error('[SessionController] uploadTempDocument error:', { message: err.message });
    next(err);
  }
};

/**
 * GET /api/session
 */
export const listSessions = async (req, res, next) => {
  try {
    const sessions = await getAllSessions();
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/session/:sessionId
 */
export const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await getSessionById(sessionId);

    if (!session) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        session: null,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      session,
    });
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      err.message = 'Invalid session ID format.';
    }
    next(err);
  }
};

/**
 * DELETE /api/session/:sessionId
 */
export const removeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await deleteSession(sessionId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Session and associated document deleted successfully.',
    });
  } catch (err) {
    if (err.name === 'CastError') {
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      err.message = 'Invalid session ID format.';
    }
    next(err);
  }
};

/**
 * GET /api/session/:sessionId/document
 * Streams the original document for viewing in the browser.
 */
export const downloadDocument = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await getSessionById(sessionId);

    if (!session) {
      logger.warn(`[SessionController] downloadDocument: Session not found for ID ${sessionId}`);
      const err = new Error('Session not found.');
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      return next(err);
    }
    
    if (!session.document) {
      logger.warn(`[SessionController] downloadDocument: Document not found on session ${sessionId}`);
      const err = new Error('Document not found on session.');
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      return next(err);
    }

    const doc = session.document;

    // Resolve the absolute physical path from the relative DB path
    const absolutePath = getAbsolutePath(doc.storagePath);

    if (!fs.existsSync(absolutePath)) {
      logger.error(`[SessionController] File missing on disk at path: ${absolutePath}`);
      const err = new Error('File missing from storage.');
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      return next(err);
    }

    res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    
    res.sendFile(absolutePath, (err) => {
      if (err) {
        logger.error('[SessionController] Failed to send file:', { path: absolutePath, error: err.message });
        if (!res.headersSent) {
          next(err);
        }
      }
    });
  } catch (err) {
    if (err.name === 'CastError') {
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      err.message = 'Invalid session ID format.';
    }
    next(err);
  }
};

