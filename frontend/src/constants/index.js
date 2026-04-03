/**
 * constants/index.js — Application-wide frontend constants.
 *
 * Import from here — never hardcode strings in components or services.
 */

// ── App Identity ──────────────────────────────────────────────────────────────
export const APP_NAME    = import.meta.env.VITE_APP_NAME    || 'AI PDF Studio';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const APP_TAGLINE = 'Upload Once. Work Continuously. Download Once.';

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE_URL   = import.meta.env.VITE_API_BASE_URL   || 'http://localhost:3001/api';
export const API_TIMEOUT_MS = import.meta.env.VITE_API_TIMEOUT_MS || 600_000;

// ── Client Routes ─────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:        '/',
  WORKSPACE:   '/workspace/:sessionId',
};

// ── API Endpoints ─────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  HEALTH:   '/health',
  SESSION:  '/session',
  DOCUMENT: '/document',
  WORKFLOW: '/workflow',
};

// ── File Constraints ──────────────────────────────────────────────────────────
export const ALLOWED_FILE_TYPES = [
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
  'PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'PNG', 'JPG', 'JPEG',
];

export const MAX_FILE_SIZE_MB    = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── Operation Types (Milestone 3+) ────────────────────────────────────────────
export const OPERATIONS = {
  // ROTATE:    'rotate',
  // MERGE:     'merge',
  // SPLIT:     'split',
  // COMPRESS:  'compress',
  // SUMMARIZE: 'ai_summary',
  // CHAT:      'ai_chat',
};
