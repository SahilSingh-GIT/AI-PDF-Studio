/**
 * models/DocumentVersion.js — Document Version Mongoose model.
 *
 * Tracks the lineage of a document inside a session as operations are applied.
 * This is the foundation for Undo / Redo functionality.
 *
 * Fields:
 *   session          — ref to DocumentSession
 *   versionNumber    — sequential version number (1, 2, 3...)
 *   operationId      — ID of the operation that created this version (null for initial upload)
 *   operationName    — Human-readable name of the operation
 *   previousDocument — ref to the Document before the operation (null for initial)
 *   currentDocument  — ref to the Document after the operation
 */

import mongoose from 'mongoose';

const DocumentVersionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentSession',
      required: [true, 'Version must belong to a session'],
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    operationId: {
      type: String,
      default: null, // null means initial upload
    },
    operationName: {
      type: String,
      default: 'Initial Upload',
    },
    previousDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    currentDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Quickly find all versions for a session, sorted by version number.
DocumentVersionSchema.index({ session: 1, versionNumber: 1 }, { unique: true });

const DocumentVersion = mongoose.model('DocumentVersion', DocumentVersionSchema);

export default DocumentVersion;
