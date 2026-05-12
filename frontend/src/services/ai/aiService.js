// services/ai/aiService.js
// Provides methods to hit the real AI backend endpoints.

const API_BASE = '/api/ai';

export const aiService = {
  async getStatus(sessionId) {
    const res = await fetch(`${API_BASE}/status?sessionId=${sessionId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get AI status");
    }
    return res.json(); // { status: 'READY' | 'PREPARING' | 'NOT_PREPARED' | 'FAILED' }
  },

  async prepare(sessionId) {
    const res = await fetch(`${API_BASE}/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to trigger AI preparation");
    }
    return res.json(); // { status: 'PREPARING' }
  },

  async chat(message, sessionId) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: message, sessionId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to send chat");
    }
    // Returns { answer, usedDocumentContext, sources }
    // The UI currently expects { reply } for the answer.
    const data = await res.json();
    return { reply: data.answer, ...data };
  },

  async getSummary(sessionId) {
    const res = await fetch(`${API_BASE}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate summary");
    }
    const data = await res.json();
    return data.summary;
  },

  async getKeyInsights(sessionId) {
    const res = await fetch(`${API_BASE}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to extract insights");
    }
    const data = await res.json();
    return data.insights;
  },

  async translate(language, isRoman, sessionId, source = 'summary', pageNumber = null) {
    const baseLang = language.toLowerCase();
    const key = isRoman ? `${baseLang}_roman` : baseLang;
    
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: key, sessionId, source, pageNumber })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to translate summary");
    }
    const data = await res.json();
    // Returns { language, translatedText }
    // The UI currently expects { translation }
    return { translation: data.translatedText };
  },

  async semanticSearch(query, sessionId, topK = 5) {
    const res = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sessionId, topK })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to search");
    }
    return res.json(); // { results: [...] }
  }
};
