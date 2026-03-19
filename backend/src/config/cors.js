/**
 * cors.js — CORS configuration factory.
 *
 * Centralizes origin allow-list and options so CORS policy
 * can be adjusted in one place as the application grows.
 */

import config from './env.js';

const allowedOrigins = [
  config.frontendUrl,
  // Add additional trusted origins here when needed (staging, preview URLs, etc.)
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Disposition', 'X-Request-Id'],
  optionsSuccessStatus: 200, // Legacy browser compatibility
};

export default corsOptions;
