/**
 * services/api.js — Configured Axios instance factory.
 *
 * All HTTP calls in the application must go through this instance.
 * Never use raw fetch() or an unconfigured axios — always import from here.
 *
 * Architecture:
 *   Components → hooks → services/api.js → Express backend
 */

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/index.js';

// ── Create the Axios instance ─────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(API_TIMEOUT_MS),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send cookies with cross-origin requests
});

// ── Request Interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach auth token when authentication is implemented (Milestone N+)
    // const token = getAuthToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      // Network error — server is unreachable
      return Promise.reject({
        message: 'Network error: Unable to reach the server.',
        code: 'NETWORK_ERROR',
      });
    }

    // Normalize error shape to match backend envelope: { success, error, message }
    const normalized = {
      statusCode: response.status,
      message:    response.data?.message || 'An unexpected error occurred.',
      error:      response.data?.error   || 'Error',
      code:       response.data?.code,
    };

    return Promise.reject(normalized);
  }
);

export default api;
