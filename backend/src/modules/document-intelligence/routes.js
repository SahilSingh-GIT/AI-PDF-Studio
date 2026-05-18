import express from 'express';
import * as intelligenceController from './controllers/intelligenceController.js';

const router = express.Router();

router.post('/analyze', intelligenceController.analyzeDocument);

router.get('/status/:sessionId', intelligenceController.getStatus);
router.get('/report/:sessionId', intelligenceController.getReport);

export default router;