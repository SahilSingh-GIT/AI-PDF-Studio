/**
 * rateLimit.js — Rate limiter configuration.
 *
 * Uses express-rate-limit. Configure different limiters here
 * (e.g., a stricter limiter for /api/upload in future milestones).
 */

import rateLimit from 'express-rate-limit';
import config from './env.js';

/**
 * Default API rate limiter — applied globally to all /api/* routes.
 */
export const defaultLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000 / 60) + ' minutes',
  },
  skip: (req) => {
    // Skip rate limiting for health checks and status polling/streaming
    const url = req.originalUrl || req.path;
    return url === '/api/health' || 
           url.startsWith('/api/intelligence/status') || 
           url.startsWith('/api/preparation/stream');
  },
});

/**
 * Strict limiter — reserved for sensitive routes (auth, file upload) in future milestones.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Rate limit exceeded for this operation. Please wait before retrying.',
  },
});
