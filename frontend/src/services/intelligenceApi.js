import api from './api.js';

export const analyzeDocument = async (sessionId, documentId) => {
  const response = await api.post('/intelligence/analyze', { sessionId, documentId });
  return response.data;
};



export const getIntelligenceReport = async (sessionId) => {
  const response = await api.get(`/intelligence/report/${sessionId}`);
  return response.data;
};

export const getIntelligenceStatus = async (sessionId) => {
  const response = await api.get(`/intelligence/status/${sessionId}`);
  return response.data;
};