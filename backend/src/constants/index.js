/**
 * constants/index.js — Shared backend constants.
 *
 * Import from this file — never hardcode strings in route/controller files.
 */

// ── API ───────────────────────────────────────────────────────────────────────
export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

// ── HTTP Status Codes ─────────────────────────────────────────────────────────
export const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  ACCEPTED:              202,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  UNPROCESSABLE_ENTITY:  422,
  PAYLOAD_TOO_LARGE:     413,
  UNSUPPORTED_MEDIA_TYPE:415,
  TOO_MANY_REQUESTS:     429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE:   503,
};

// ── File Upload ───────────────────────────────────────────────────────────────
export const UPLOAD_FIELD_NAME = 'document';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
];

export const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg',
];

// ── Document Status ───────────────────────────────────────────────────────────
export const DOCUMENT_STATUS = {
  ACTIVE:     'active',
  PROCESSING: 'processing',
  DELETED:    'deleted',
};

// ── Session Status ────────────────────────────────────────────────────────────
export const SESSION_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  ERROR:  'error',
};

// ── Operation Types (Milestone 3+) ────────────────────────────────────────────
export const OPERATION_TYPES = {
  // ROTATE:    'rotate',
  // MERGE:     'merge',
  // COMPRESS:  'compress',
  // OCR:       'ocr',
  // AI_SUMMARY:'ai_summary',
  // AI_CHAT:   'ai_chat',
};
