/**
 * workflow/engine.js — Workflow Engine
 *
 * The core controller of AI PDF Studio's backend operations.
 * Enforces the strict pipeline:
 *  1. Execution Planner (determines which operations are needed based on capabilities)
 *  2. Operation Executor (runs the plan in order, including hidden prep tasks)
 *  3. Session Update (automatically handled by the executor)
 */

import DocumentSession from '../models/DocumentSession.js';
import { getOperation } from './registry.js';
import { buildExecutionPlan } from './planner.js';
import { executeSingleOperation } from './executor.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Execute a workflow operation on a session.
 * Standard response format:
 * { success: true, operation: "...", documentVersion: X, updatedCapabilities: [...], executionTime: ms, workspaceUpdated: true }
 */
export const executeWorkflow = async (sessionId, operationId, payload = {}) => {
  const startTime = Date.now();
  const requestId = uuidv4();
  const staleThreshold = new Date(Date.now() - 30 * 1000); // 30 seconds

  // 1. Session Locking (Acquire Lock)
  let session = await DocumentSession.findOneAndUpdate(
    {
      _id: sessionId,
      $or: [
        { 'executionLock.locked': false },
        { 'executionLock.lockedAt': { $lt: staleThreshold } },
        { 'executionLock.locked': { $exists: false } }
      ]
    },
    {
      $set: {
        'executionLock.locked': true,
        'executionLock.lockedAt': new Date(),
        'executionLock.requestId': requestId
      }
    },
    { returnDocument: 'after' }
  ).populate('document');

  if (!session) {
    // Determine if it was just locked, or if it doesn't exist
    const exists = await DocumentSession.findById(sessionId);
    if (!exists) throw new Error('Session not found');
    throw new Error('Session is currently locked by another operation.');
  }

  try {
    // 2. Validation Order
    if (session.status !== 'active') throw new Error('Session is not active');
    
    const targetOp = getOperation(operationId);
    if (!targetOp) throw new Error(`Operation ${operationId} not found`);

    if (targetOp.supportedTypes && targetOp.supportedTypes.length > 0) {
      if (!targetOp.supportedTypes.includes(session.document.extension)) {
        throw new Error(`Operation ${operationId} does not support .${session.document.extension} files`);
      }
    }

    if (targetOp.validate) {
      targetOp.validate(session, payload);
    }

    let currentDocument = session.document;

    // 3. Execution Planner
    const executionPlan = buildExecutionPlan(targetOp, session);
    logger.info(`[WorkflowEngine] Pipeline started for ${operationId}. Plan: ${executionPlan.map(op => op.id).join(' -> ')}`);

    // 4. Execute, Store, Version, Session Update (Delegated to executor.js)
    let updatedCapabilities = [];
    let operationDownloadData = null;
    
    for (const op of executionPlan) {
      const opPayload = op.id === operationId ? payload : {};
      const { newDocument, capabilitiesProvided, result } = await executeSingleOperation(session, currentDocument, op, opPayload);
      currentDocument = newDocument;
      
      if (result && result.downloadData) {
        operationDownloadData = result.downloadData;
      }
      
      if (capabilitiesProvided) {
        updatedCapabilities.push(...capabilitiesProvided);
      }
    }

    // 5. Release Lock and return Standard Response
    await DocumentSession.updateOne(
      { _id: sessionId, 'executionLock.requestId': requestId },
      { $set: { 'executionLock.locked': false, 'executionLock.lockedAt': null, 'executionLock.requestId': null } }
    );

    // Re-fetch session to ensure we have the absolute latest state (including the populated document)
    const updatedSession = await DocumentSession.findById(sessionId).populate('document');

    // Aggregate data from the last operation in the chain (usually the target operation)
    const lastHistoryEntry = updatedSession.workflowHistory[updatedSession.workflowHistory.length - 1];
    const operationData = {
      ...(lastHistoryEntry?.result || {}),
      ...(operationDownloadData || {})
    };

    const executionTime = Date.now() - startTime;
    return {
      success: true,
      operation: operationId,
      documentVersion: updatedSession.currentVersion,
      updatedCapabilities,
      executionTime,
      workspaceUpdated: true,
      session: updatedSession, // Frontend expects this for activateSession()
      operationData // Include the operation payload (e.g. downloadBuffer)
    };
  } catch (err) {
    // Release Lock on Failure
    await DocumentSession.updateOne(
      { _id: sessionId, 'executionLock.requestId': requestId },
      { $set: { 'executionLock.locked': false, 'executionLock.lockedAt': null, 'executionLock.requestId': null } }
    );

    logger.error(`[WorkflowEngine] Pipeline failed for ${operationId}: ${err.message}`);
    throw err;
  }
};

export default { executeWorkflow };
