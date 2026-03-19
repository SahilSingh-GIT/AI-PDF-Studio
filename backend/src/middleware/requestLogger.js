/**
 * requestLogger.js — HTTP request logging middleware.
 *
 * Uses morgan with environment-appropriate format:
 * - development: 'dev' (colored, concise)
 * - production:  'combined' (standard Apache format, suitable for log shippers)
 */

import morgan from 'morgan';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Stream morgan output through our logger
const stream = {
  write: (message) => logger.info(message.trimEnd()),
};

const requestLogger = morgan(
  config.isDevelopment ? 'dev' : 'combined',
  { stream }
);

export default requestLogger;
