/**
 * controllers/documentController.js — Document route handlers.
 *
 * Currently exposes document metadata retrieval.
 * Future: add version history, reprocessing triggers, etc.
 */

import { getDocumentById } from '../services/documentService.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * GET /api/document/:documentId
 */
export const getDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const doc = await getDocumentById(documentId);

    if (!doc) {
      const err = new Error('Document not found.');
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      return next(err);
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      document: doc,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      err.message = 'Invalid document ID format.';
    }
    next(err);
  }
};
