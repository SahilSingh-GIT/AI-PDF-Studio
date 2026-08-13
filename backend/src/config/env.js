/**
 * env.js — Centralized environment variable loader and validator.
 *
 * All modules must import config from here — never from process.env directly.
 * This ensures a single source of truth and catches missing variables early.
 */

import 'dotenv/config';

const getEnv = (key, defaultValue) => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
  return value;
};

const config = {
  // ── Server ──────────────────────────────────────────────────────────────────
  port: parseInt(getEnv('PORT', '3001'), 10),
  nodeEnv: getEnv('NODE_ENV', 'development'),

  // ── CORS ────────────────────────────────────────────────────────────────────
  frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),

  // ── Rate Limiting ───────────────────────────────────────────────────────────
  rateLimitWindowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  rateLimitMax: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),

  // ── Database ─────────────────────────────────────────────────────────────────
  mongodbUri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/ai-pdf-studio'),

  // ── File Storage ─────────────────────────────────────────────────────────────
  storagePath: getEnv('STORAGE_PATH', './storage'),
  maxFileSizeMb: parseInt(getEnv('MAX_FILE_SIZE_MB', '100'), 10),

  // ── Logging ─────────────────────────────────────────────────────────────────
  logLevel: getEnv('LOG_LEVEL', 'debug'),

  // ── Derived helpers ─────────────────────────────────────────────────────────
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // ── AI and Vector DB ────────────────────────────────────────────────────────
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '', // Left empty so it doesn't crash if missing immediately
    chatModel: getEnv('CHAT_MODEL', 'gemini-1.5-flash'),
    embeddingModel: getEnv('EMBEDDING_MODEL', 'text-embedding-004'),
  },

  chroma: {
    url: getEnv('CHROMA_URL', 'http://localhost:8000'),
    collectionName: getEnv('CHROMA_COLLECTION_NAME', 'pdf_studio'),
  },

  rag: {
    similarityThreshold: parseFloat(getEnv('SIMILARITY_THRESHOLD', '0.65')),
    chunkSize: parseInt(getEnv('CHUNK_SIZE', '1000'), 10),
    chunkOverlap: parseInt(getEnv('CHUNK_OVERLAP', '200'), 10),
  },
};

export default config;
