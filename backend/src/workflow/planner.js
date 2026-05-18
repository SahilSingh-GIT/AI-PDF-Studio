/**
 * workflow/planner.js — Execution Planner
 *
 * Checks required capabilities (e.g., SEARCHABLE_TEXT) against the session's
 * capabilities. If missing, it queries the Capability Registry to find a provider,
 * and recursively builds an execution graph.
 */

import { getOperation } from './registry.js';
import { getProvidersForCapability } from './capabilities.js';
import logger from '../utils/logger.js';

/**
 * Build the execution queue required to satisfy a requested operation.
 * @param {object} targetOp - The requested operation object.
 * @param {object} session - The DocumentSession.
 * @returns {object[]} Array of operations to execute in order.
 */
export const buildExecutionPlan = (targetOp, session) => {
  const plan = [];
  const visited = new Set();
  const callStack = new Set();
  const sessionCapabilities = session.capabilities || {};

  class CircularDependencyError extends Error {
    constructor(message) {
      super(message);
      this.name = 'CircularDependencyError';
    }
  }

  const resolve = (op) => {
    if (callStack.has(op.id)) {
      throw new CircularDependencyError(`Circular dependency detected involving operation: ${op.id}`);
    }
    if (visited.has(op.id)) return;
    
    callStack.add(op.id);
    visited.add(op.id);

    // If the operation requires capabilities, satisfy them first
    if (op.requires && op.requires.length > 0) {
      for (const cap of op.requires) {
        // Check if capability is already available in the session
        if (sessionCapabilities[cap] && sessionCapabilities[cap].available) {
          logger.debug(`[Planner] Capability ${cap} already satisfied for ${op.id}.`);
          continue;
        }

        logger.info(`[Planner] Capability ${cap} missing for ${op.id}. Querying registry...`);
        const providers = getProvidersForCapability(cap);
        
        if (providers.length === 0) {
          throw new Error(`[Planner] No providers registered for capability: ${cap}`);
        }

        // For Milestone 3/4, we just pick the first registered provider (or preferred one).
        // In reality, this might involve checking if the document is a native PDF vs Scanned.
        // Let's pick the last one or the first one that exists in the Operation Registry.
        let providerOp = null;
        for (const pid of providers) {
          const possibleProvider = getOperation(pid);
          if (possibleProvider) {
            providerOp = possibleProvider;
            break; // Stop at first valid provider
          }
        }

        if (!providerOp) {
          throw new Error(`[Planner] Provider operation for ${cap} not found in operation registry.`);
        }

        logger.info(`[Planner] Selected ${providerOp.id} to provide ${cap}`);
        resolve(providerOp); // Recursively resolve the provider's dependencies
      }
    }

    // Finally, add this operation to the plan
    plan.push(op);
    callStack.delete(op.id);
  };

  resolve(targetOp);

  // Development Visualization
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`\nExecution Plan for ${targetOp.id}:\n↓\n${plan.map(p => p.name).join('\n↓\n')}\n`);
  }

  return plan;
};

export default { buildExecutionPlan };
