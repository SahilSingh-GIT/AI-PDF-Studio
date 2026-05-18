/**
 * routes/workflow.js
 */

import { Router } from 'express';
import { listOperations, executeOperation } from '../controllers/workflowController.js';

const router = Router();

router.get('/operations', listOperations);
router.post('/execute', executeOperation);

export default router;
