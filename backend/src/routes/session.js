/**
 * routes/session.js — Session API routes.
 *
 * POST   /api/session/upload              → upload document + create session
 * GET    /api/session                     → list all sessions
 * GET    /api/session/:sessionId          → get session by ID
 * GET    /api/session/:sessionId/document → stream document for viewing
 * DELETE /api/session/:sessionId          → delete session + document + file
 */

import { Router } from 'express';
import { uploadSingle } from '../middleware/upload.js';
import {
  uploadDocument,
  uploadTempDocument,
  listSessions,
  getSession,
  removeSession,
  downloadDocument,
} from '../controllers/sessionController.js';

const router = Router();

router.post('/upload', uploadSingle, uploadDocument);
router.post('/upload-temp', uploadSingle, uploadTempDocument);
router.get('/', listSessions);
router.get('/:sessionId', getSession);
router.get('/:sessionId/document', downloadDocument);
router.delete('/:sessionId', removeSession);

export default router;
