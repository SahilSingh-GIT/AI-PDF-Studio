/**
 * services/sessionService.js — Session API calls.
 *
 * All session-related HTTP calls are centralised here.
 * Components and hooks must never call api directly — always go through this service.
 *
 * Architecture:
 *   Component → useSession hook → sessionService → api (Axios) → Express backend
 */

import api from './api.js';
import { API_ENDPOINTS } from '../constants/index.js';

const BASE = API_ENDPOINTS.SESSION;

/**
 * Upload a document and create a new session.
 * Uses multipart/form-data with upload progress tracking.
 *
 * @param {File} file — the File object from the input/drop event
 * @param {function} onProgress — callback(percent: number)
 * @returns {Promise<{ success: boolean, session: object }>}
 */
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post(`${BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress?.(percent);
      }
    },
  });

  return response.data;
};
/**
 * Uploads a document to temp storage (for merge secondary files).
 * @param {File} file 
 * @returns {Promise<{ success: boolean, path: string, filename: string }>}
 */
export const uploadTempDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await api.post(`${BASE}/upload-temp`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
/**
 * Get a session by ID (with populated document).
 * @param {string} sessionId
 * @returns {Promise<{ success: boolean, session: object }>}
 */
export const getSession = async (sessionId) => {
  const response = await api.get(`${BASE}/${sessionId}`);
  return response.data;
};

/**
 * Get all active sessions.
 * @returns {Promise<{ success: boolean, count: number, sessions: object[] }>}
 */
export const getAllSessions = async () => {
  const response = await api.get(BASE);
  return response.data;
};

/**
 * Delete a session and its associated document + file.
 * @param {string} sessionId
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const deleteSession = async (sessionId) => {
  const response = await api.delete(`${BASE}/${sessionId}`);
  return response.data;
};
export const sessionService = {
  uploadDocument,
  uploadTempDocument,
  getSession,
  getAllSessions,
  deleteSession,
};

export default sessionService;
