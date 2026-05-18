/**
 * logger.js — Lightweight structured logger utility.
 *
 * A thin wrapper around console that adds level prefixes, timestamps,
 * and respects the LOG_LEVEL environment variable.
 * Replace with Winston or Pino when production log shipping is needed.
 */

import config from '../config/env.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = LEVELS[config.logLevel] ?? LEVELS.debug;

const timestamp = () => new Date().toISOString();

const format = (level, message, meta) => {
  const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

const logger = {
  error: (message, meta) => {
    if (currentLevel >= LEVELS.error) console.error(format('error', message, meta));
  },
  warn: (message, meta) => {
    if (currentLevel >= LEVELS.warn) console.warn(format('warn', message, meta));
  },
  info: (message, meta) => {
    if (currentLevel >= LEVELS.info) console.info(format('info', message, meta));
  },
  debug: (message, meta) => {
    if (currentLevel >= LEVELS.debug) console.debug(format('debug', message, meta));
  },
};

export default logger;
