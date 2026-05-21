import express from 'express';
import { chatController } from './controllers/chatController.js';
import { summaryController } from './controllers/summaryController.js';
import { insightsController } from './controllers/insightsController.js';
import { translateController } from './controllers/translateController.js';
import { searchController } from './controllers/searchController.js';
import { statusController, prepareDocument } from './controllers/statusController.js';

const router = express.Router();

router.get('/status', statusController);
router.post('/prepare', prepareDocument);
router.post('/chat', chatController);
router.post('/summary', summaryController);
router.post('/insights', insightsController);
router.post('/translate', translateController);
router.post('/search', searchController);

export default router;
