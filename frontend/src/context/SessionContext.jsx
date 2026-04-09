/**
 * context/SessionContext.jsx — Document Session global state.
 *
 * Responsibilities:
 *   - Store the active session, document, loading, and error state
 *   - Persist ONLY the sessionId in localStorage (never the full document)
 *   - On mount: read sessionId → GET /api/session/:id → restore workspace
 *   - Provide useSession() hook for all consumers
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sessionService } from '../services/sessionService.js';

const SESSION_STORAGE_KEY = 'pdf_studio_session_id';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session,  setSession]  = useState(null);
  const [document, setDocument] = useState(null);
  const [loading,  setLoading]  = useState(true);   // true on mount (restoring)
  const [error,    setError]    = useState(null);

  // ── Restore session from localStorage on mount ────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedId) {
        setLoading(false);
        return;
      }

      try {
        const data = await sessionService.getSession(storedId);
        if (data.session && data.session.document) {
          setSession(data.session);
          setDocument(data.session.document);
        } else {
          // Session exists but document was deleted — clear stale ID
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (err) {
        // Session not found on server — clear stale ID
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setError(null); // Not a user-facing error on restore failure
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  // ── Activate a new session (called after upload) ──────────────────────────
  const activateSession = useCallback((sessionData) => {
    setSession(sessionData);
    setDocument(sessionData.document);
    setError(null);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionData._id);
  }, []);

  // ── Clear the active session (called after delete) ────────────────────────
  const clearSession = useCallback(() => {
    setSession(null);
    setDocument(null);
    setError(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  // ── Set error state ───────────────────────────────────────────────────────
  const setSessionError = useCallback((err) => {
    setError(err);
  }, []);

  const value = {
    session,
    document,
    loading,
    error,
    activateSession,
    clearSession,
    setSessionError,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

/**
 * useSession — hook to consume the SessionContext.
 * Throws if used outside of SessionProvider.
 */
export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a <SessionProvider>');
  }
  return ctx;
};

export default SessionContext;
