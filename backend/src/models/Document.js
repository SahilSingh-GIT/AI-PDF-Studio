/**
 * models/Document.js — Document Mongoose model.
 *
 * Represents a single uploaded file in the system.
 * Every uploaded file has exactly one Document record.
 *
 * Fields:
 *   originalName  — filename as uploaded by the user
 *   storedName    — UUID-based filename used in storage/originals/
 *   extension     — lowercase file extension (e.g. 'pdf')
 *   mimeType      — MIME type string (e.g. 'application/pdf')
 *   size          — file size in bytes
 *   storagePath   — absolute path to the stored file
 *   checksum      — SHA-256 hex digest — prevents redundant AI processing
 *   status        — lifecycle state of the document
 *   isDeleted     — soft-delete flag
 */

import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
      maxlength: [500, 'Filename cannot exceed 500 characters'],
    },
    storedName: {
      type: String,
      required: [true, 'Stored filename is required'],
      unique: true,
      trim: true,
    },
    extension: {
      type: String,
      required: [true, 'File extension is required'],
      lowercase: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be at least 1 byte'],
    },
    storagePath: {
      type: String,
      required: [true, 'Storage path is required'],
      trim: true,
    },
    checksum: {
      type: String,
      required: [true, 'Checksum is required'],
      trim: true,
      index: true, // indexed for future duplicate detection
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'processing', 'deleted'],
        message: 'Status must be active, processing, or deleted',
      },
      default: 'active',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'uploadedAt',
      updatedAt: 'updatedAt',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
DocumentSchema.virtual('sizeInMb').get(function () {
  return parseFloat((this.size / (1024 * 1024)).toFixed(2));
});

// ── Indexes ───────────────────────────────────────────────────────────────────
DocumentSchema.index({ isDeleted: 1, status: 1 });

const Document = mongoose.model('Document', DocumentSchema);

export default Document;
