/**
 * database.js — MongoDB connection manager.
 *
 * Handles:
 *   - Initial connection with retry logic
 *   - Connection event logging
 *   - Graceful disconnection on server shutdown
 */

import mongoose from 'mongoose';
import config from './env.js';
import logger from '../utils/logger.js';

const RETRY_INTERVAL_MS = 5000;
const MAX_RETRIES = 5;

/**
 * Connect to MongoDB with automatic retry on failure.
 * @param {number} attempt - Current attempt number (internal)
 */
export const connectDatabase = async (attempt = 1) => {
  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`[Database] ✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error(`[Database] Connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);

    if (attempt >= MAX_RETRIES) {
      logger.error('[Database] Max retries reached. Exiting process.');
      process.exit(1);
    }

    logger.info(`[Database] Retrying in ${RETRY_INTERVAL_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
    return connectDatabase(attempt + 1);
  }
};

/**
 * Gracefully close the MongoDB connection.
 * Called during server shutdown.
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('[Database] MongoDB connection closed gracefully.');
  } catch (err) {
    logger.error('[Database] Error during disconnect:', { message: err.message });
  }
};

// ── Connection Event Listeners ────────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  logger.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('[Database] MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error('[Database] MongoDB error:', { message: err.message });
});

export default { connectDatabase, disconnectDatabase };
