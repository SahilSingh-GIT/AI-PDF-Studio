/**
 * routes/document.js — Document API routes.
 *
 * GET /api/document/:documentId → get document metadata
 */

import { Router } from 'express';
import { getDocument } from '../controllers/documentController.js';

const router = Router();

router.get('/:documentId', getDocument);

export default router;
