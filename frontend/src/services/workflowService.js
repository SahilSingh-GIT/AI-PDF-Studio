/**
 * services/workflowService.js
 *
 * Handles API calls to the Workflow Engine.
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/index.js';

const BASE = API_ENDPOINTS.WORKFLOW || '/workflow';

/**
 * Get all available workflow operations.
 * @returns {Promise<{ success: boolean, categories: object, operations: object[] }>}
 */
export const getOperations = async () => {
  const response = await api.get(`${BASE}/operations`);
  return response.data;
};

/**
 * Execute a workflow operation.
 * @param {string} sessionId
 * @param {string} operationId
 * @param {object} payload
 * @returns {Promise<{ success: boolean, session: object }>}
 */
export const executeWorkflow = async (sessionId, operationId, payload = {}) => {
  const response = await api.post(`${BASE}/execute`, {
    sessionId,
    operationId,
    payload,
  });
  return response.data;
};

export const workflowService = {
  getOperations,
  executeWorkflow,
};

export default workflowService;
