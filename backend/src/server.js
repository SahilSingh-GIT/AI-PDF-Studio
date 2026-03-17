/**
 * server.js — HTTP server bootstrap.
 *
 * Responsibility: Create the HTTP server and bind it to a port.
 * All application logic lives in app.js.
 * Database and storage are initialized here, before listening.
 */

import http from 'http';
import app from './app.js';
import config from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initStorage } from './services/storageService.js';
import { initWorkflowEngine } from './workflow/index.js';
import logger from './utils/logger.js';

const server = http.createServer(app);

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`[Server] Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    await disconnectDatabase();
    logger.info('[Server] HTTP server closed. Process exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('[Server] Could not close connections in time. Forcing exit.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// ── Unhandled Rejections & Exceptions ─────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('[Server] Unhandled Promise Rejection:', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('[Server] Uncaught Exception:', { message: err.message });
  process.exit(1);
});

import { verifyDependencies } from './services/dependencyVerification.js';
import { wipeAllData } from './utils/cleanup.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const bootstrap = async () => {
  // 1. Initialize storage directories
  await initStorage();

  // 2. Connect to MongoDB (with retry logic)
  await connectDatabase();

  // 3. Verify Native Dependencies (non-fatal)
  await verifyDependencies();

  // 4. Initialize Workflow Engine
  initWorkflowEngine();

  // 4.5 Wipe old sessions on startup (single user prototype behavior)
  await wipeAllData();

  // 5. Start HTTP server
  server.listen(config.port, () => {
    logger.info('');
    logger.info('  ╔══════════════════════════════════════╗');
    logger.info('  ║       AI PDF Studio — Backend        ║');
    logger.info('  ╚══════════════════════════════════════╝');
    logger.info('');
    logger.info(`  🚀  Server   : http://localhost:${config.port}`);
    logger.info(`  📋  Env      : ${config.nodeEnv}`);
    logger.info(`  🏥  Health   : http://localhost:${config.port}/api/health`);
    logger.info(`  📤  Upload   : POST http://localhost:${config.port}/api/session/upload`);
    logger.info('');
  });
};

bootstrap();

export default server;




