/**
 * services/documentService.js — Document database query operations.
 *
 * Document creation is handled inside sessionService.processUpload()
 * within a MongoDB transaction — it is not exposed here to prevent
 * any code path from creating a Document outside the upload pipeline.
 *
 * This service exposes read and soft-delete operations used by
 * controllers and session teardown.
 */

import Document from '../models/Document.js';
import logger from '../utils/logger.js';

/**
 * Find a Document by its MongoDB _id (excludes soft-deleted).
 * @param {string} id
 * @returns {Promise<Document|null>}
 */
export const getDocumentById = async (id) => {
  return Document.findOne({ _id: id, isDeleted: false });
};

/**
 * Soft-delete a document (marks isDeleted: true, status: 'deleted').
 * The physical file must be removed separately by storageService.
 * @param {string} id
 * @param {object} [session] — optional Mongoose session for transactions
 * @returns {Promise<Document|null>}
 */
export const softDeleteDocument = async (id, session) => {
  const options = session ? { returnDocument: 'after', session } : { returnDocument: 'after' };
  const doc = await Document.findByIdAndUpdate(
    id,
    { isDeleted: true, status: 'deleted' },
    options
  );
  if (doc) logger.debug(`[DocumentService] Soft-deleted document: ${id}`);
  return doc;
};

export default { getDocumentById, softDeleteDocument };
