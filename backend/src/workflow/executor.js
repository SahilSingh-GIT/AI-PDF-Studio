/**
 * workflow/executor.js — Operation Executor
 *
 * Handles the actual execution of a single workflow operation,
 * including tracking it in workflowHistory and handling versioning.
 */

import mongoose from 'mongoose';
import DocumentVersion from '../models/DocumentVersion.js';
import { getAbsolutePath, saveProcessedFile, generateStoredName } from '../services/storageService.js';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

export const executeSingleOperation = async (session, currentDocument, op, payload) => {
  logger.debug(`[OperationExecutor] Executing ${op.id}...`);

  // Record start in workflow history
  session.workflowHistory.push({
    operation: op.id,
    params: payload,
    status: 'processing',
    performedAt: new Date(),
  });
  session.activeOperation = op.id;
  await session.save();

  try {
    const startTime = Date.now();
    
    // Execute operation logic
    const result = await op.execute({
      session,
      document: currentDocument,
      payload
    });
    const endTime = Date.now();
    const duration = endTime - startTime;

    let newDocument = currentDocument;
    
    // Workflow Engine delegates file saving to StorageService
    if (result.fileBuffer) {
      newDocument = await saveProcessedFile(result.fileBuffer, currentDocument, op.id);
    } else if (result.newDocument) {
      newDocument = result.newDocument;
    }
    
    // Handle versioning if a new document was created and operation is undoable
    if (op.canUndo && newDocument._id.toString() !== currentDocument._id.toString()) {
      const mongoSession = await mongoose.startSession();
      try {
        mongoSession.startTransaction();

        session.currentVersion += 1;
        
        await DocumentVersion.create(
          [{
            session: session._id,
            versionNumber: session.currentVersion,
            operationId: op.id,
            operationName: op.name,
            previousDocument: currentDocument._id,
            currentDocument: newDocument._id,
          }],
          { session: mongoSession }
        );

        session.document = newDocument._id;
        await session.save({ session: mongoSession });

        await mongoSession.commitTransaction();
        currentDocument = newDocument;
        logger.debug(`[OperationExecutor] Created version ${session.currentVersion} for ${op.id}`);
        

        
      } catch (err) {
        await mongoSession.abortTransaction();
        throw err;
      } finally {
        await mongoSession.endSession();
      }
    }

    // If this operation provides capabilities, update capabilities state
    if (op.provides && op.provides.length > 0) {
      session.capabilities = session.capabilities || {};
      for (const cap of op.provides) {
        session.capabilities[cap] = {
          available: true,
          provider: op.id,
          version: session.currentVersion,
          generatedAt: new Date(),
        };
      }
      session.markModified('capabilities');
    }

    // Mark success with execution metrics
    const lastEntry = session.workflowHistory[session.workflowHistory.length - 1];
    lastEntry.status = 'done';
    lastEntry.result = result.data || null;
    lastEntry.duration = duration;
    session.activeOperation = null;
    await session.save();

    return { result, newDocument: currentDocument, capabilitiesProvided: op.provides };

  } catch (err) {
    // Mark failure
    const lastEntry = session.workflowHistory[session.workflowHistory.length - 1];
    lastEntry.status = 'failed';
    lastEntry.error = err.message;
    session.activeOperation = null;
    await session.save();
    
    logger.error(`[OperationExecutor] ${op.id} failed: ${err.message}`);
    throw err;
  }
};
