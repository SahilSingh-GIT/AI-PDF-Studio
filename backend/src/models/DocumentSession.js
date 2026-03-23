/**
 * models/DocumentSession.js — Document Session Mongoose model.
 *
 * Represents the active working session for an uploaded document.
 * Every uploaded document produces exactly one DocumentSession.
 *
 * Architecture:
 *   DocumentSession → Document (populated on retrieval)
 *
 * Future versions will point currentVersion to different processed files.
 * workflowHistory accumulates every operation applied in the session.
 *
 * Fields:
 *   document        — ref to Document
 *   status          — session lifecycle state
 *   currentVersion  — increments with each destructive operation
 *   activeOperation — name of any currently running operation (null if idle)
 *   workflowHistory — ordered log of all operations applied
 */

import mongoose from 'mongoose';

const WorkflowEntrySchema = new mongoose.Schema(
  {
    operation: { type: String, required: true },
    params: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'done',
    },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    performedAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
  },
  { _id: false }
);

const DocumentSessionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Session must reference a Document'],
      index: true,
    },
    originalDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'closed', 'error'],
        message: 'Session status must be active, closed, or error',
      },
      default: 'active',
      index: true,
    },
    currentVersion: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1'],
    },
    activeOperation: {
      type: String,
      default: null,
    },
    executionLock: {
      locked: { type: Boolean, default: false },
      lockedAt: { type: Date, default: null },
      requestId: { type: String, default: null },
    },
    capabilities: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // e.g., { SEARCHABLE_TEXT: { available: true, provider: 'ocr' } }
    },
    workflowHistory: {
      type: [WorkflowEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
DocumentSessionSchema.virtual('isActive').get(function () {
  return this.status === 'active';
});

DocumentSessionSchema.virtual('operationCount').get(function () {
  return this.workflowHistory.length;
});

// ── Indexes ───────────────────────────────────────────────────────────────────
DocumentSessionSchema.index({ status: 1, createdAt: -1 });

const DocumentSession = mongoose.model('DocumentSession', DocumentSessionSchema);

export default DocumentSession;
