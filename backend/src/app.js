/**
 * app.js — Express application factory.
 *
 * Responsibility: Configure and export the Express app instance.
 * DO NOT start the HTTP server here — that is server.js's responsibility.
 *
 * Middleware registration order matters:
 *   1. Security (Helmet)
 *   2. CORS
 *   3. Rate Limiting
 *   4. Request Logging
 *   5. Body Parsers
 *   6. Cookie Parser
 *   7. Compression
 *   8. Routes
 *   9. 404 Handler
 *  10. Global Error Handler
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';


import corsOptions from './config/cors.js';
import { defaultLimiter } from './config/rateLimit.js';
import config from './config/env.js';
import apiRouter from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { API_PREFIX } from './constants/index.js';
import logger from './utils/logger.js';

const app = express();

// ── 1. Security Headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── 2. CORS ───────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight requests

// ── 3. Rate Limiting ──────────────────────────────────────────────────────────
app.use(API_PREFIX, defaultLimiter);

// ── 4. Request Logging ────────────────────────────────────────────────────────
app.use(
  morgan(config.isDevelopment ? 'dev' : 'combined', {
    stream: { write: (msg) => logger.info(msg.trimEnd()) },
  })
);

// ── 5. Body Parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 6. Cookie Parser ──────────────────────────────────────────────────────────
app.use(cookieParser());

// ── 7. Compression ────────────────────────────────────────────────────────────
app.use(compression());

// ── 8. API Routes ─────────────────────────────────────────────────────────────

app.use(API_PREFIX, apiRouter);

// ── 9. 404 Catch-All ─────────────────────────────────────────────────────────
app.use(notFound);

// ── 10. Global Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

export default app;
