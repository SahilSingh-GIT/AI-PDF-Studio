/**
 * routes/index.js — Root API router.
 *
 * Mounts all sub-routers under the /api prefix.
 *
 * Architecture:
 *   /api/health    → server health check
 *   /api/session   → document session management
 *   /api/document  → document metadata
 *   /api/ai        → AI features (Milestone 3+)
 */

import { Router } from 'express';
import healthRouter  from './health.js';
import sessionRouter from './session.js';
import documentRouter from './document.js';
import workflowRouter from './workflow.js';
import intelligenceRouter from '../modules/document-intelligence/routes.js';
import aiRouter from '../ai/routes.js';

const router = Router();

// ── Core Routes ───────────────────────────────────────────────────────────────
router.use('/health',   healthRouter);
router.use('/session',  sessionRouter);
router.use('/document', documentRouter);
router.use('/workflow', workflowRouter);
router.use('/intelligence', intelligenceRouter);

// ── Future Routes ─────────────────────────────────────────────────────────────
// router.use('/operations', operationsRouter); // Superseded by workflow
router.use('/ai', aiRouter);

export default router;
