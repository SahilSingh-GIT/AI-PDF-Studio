/**
 * controllers/workflowController.js
 */

import { executeWorkflow } from '../workflow/engine.js';
import { getAllOperations } from '../workflow/registry.js';
import { IntelligenceService } from '../modules/document-intelligence/services/intelligenceService.js';
import { getAbsolutePath } from '../services/storageService.js';
import { HTTP_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * GET /api/workflow/operations
 * Returns all registered operations grouped by category.
 */
export const listOperations = (req, res, next) => {
  try {
    const ops = getAllOperations();
    
    // Group by category
    const grouped = ops.reduce((acc, op) => {
      const { category, ...rest } = op;
      if (!acc[category]) acc[category] = [];
      acc[category].push({ id: op.id, name: op.name, dependencies: op.dependencies, canUndo: op.canUndo });
      return acc;
    }, {});

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      categories: grouped,
      operations: ops.map(op => ({ id: op.id, name: op.name, category: op.category })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/workflow/execute
 * Executes a specific workflow operation.
 */
export const executeOperation = async (req, res, next) => {
  try {
    const { sessionId, operationId, payload } = req.body;
    
    if (!sessionId || !operationId) {
      const err = new Error('sessionId and operationId are required');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      return next(err);
    }

    logger.info(`[WorkflowController] Executing ${operationId} for session ${sessionId}`);
    
    // Set state to PROCESSING (or EXPORTING if it's an export operation)
    const isExport = operationId.startsWith('export');
    await IntelligenceService.updateProcessStatus(sessionId, isExport ? 'EXPORTING' : 'PROCESSING', `Executing ${operationId}...`, 0);
    
    const result = await executeWorkflow(sessionId, operationId, payload);
    
    // Phase 7: Automatic Re-analysis in background
    if (result.workspaceUpdated && result.session && result.session.document) {
      // Fire-and-forget background re-analysis
      logger.info(`[WorkflowController] Triggering background re-analysis for session ${sessionId} after ${operationId}`);
      IntelligenceService.analyzeDocument(
        result.session.document._id, 
        result.session._id, 
        { path: getAbsolutePath(result.session.document.storagePath) }
      ).catch(err => {
        logger.error(`[WorkflowController] Background re-analysis failed: ${err.message}`);
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Workflow executed successfully',
      session: result.session, // The actual populated Mongoose document session
      executionStats: {
        operation: result.operation,
        documentVersion: result.documentVersion,
        executionTime: result.executionTime,
        workspaceUpdated: result.workspaceUpdated
      },
      operationData: result.operationData // Forward the download buffer to the client
    });
  } catch (err) {
    logger.error(`[WorkflowController] executeOperation error:`, { message: err.message });
    if (err.message.includes('not found') || err.message.includes('not active')) {
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
    }
    next(err);
  }
};
