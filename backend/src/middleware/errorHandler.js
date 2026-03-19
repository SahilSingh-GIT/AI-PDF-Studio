/**
 * errorHandler.js — Global error handling middleware.
 *
 * Must be registered LAST in app.js (after all routes and the 404 handler).
 * Catches all errors passed via next(err) from anywhere in the application.
 *
 * Follows a consistent JSON error envelope so the frontend can
 * reliably parse errors regardless of their origin.
 */

import config from '../config/env.js';
import logger from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/index.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Determine status code — default to 500 if not set
  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Log the full error in development, abbreviated in production
  if (config.isDevelopment) {
    logger.error(`[${req.method}] ${req.path} → ${statusCode}`, {
      message: err.message,
      stack: err.stack,
    });
  } else {
    logger.error(`[${req.method}] ${req.path} → ${statusCode}`, {
      message: err.message,
    });
  }

  // Build the response envelope
  const response = {
    success: false,
    error: err.name || 'Error',
    message: err.message || 'An unexpected error occurred.',
    statusCode,
  };

  // Include stack trace only in development
  if (config.isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
