import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from './SessionContext.jsx';
import { analyzeDocument, getIntelligenceReport, getIntelligenceStatus } from '../services/intelligenceApi.js';

const IntelligenceContext = createContext();

export const IntelligenceProvider = ({ children }) => {
  const { session, document } = useSession();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // The State Machine status

  useEffect(() => {
    if (session && document) {
      // Clear report when switching to a new session to prevent stale data
      setReport(prev => (prev?.sessionId === session._id ? prev : null));
      
      loadOrAnalyze();
    } else {
      setReport(null);
      setStatus(null);
    }
  }, [session, document]);



  const loadOrAnalyze = async () => {
    setLoading(true);
    // Do NOT clear the report if we are just re-polling the same session, 
    // but if it's a fresh load we could. Actually, clearing on session=null above is safer.

    try {
      let currentReport = await getIntelligenceReport(session._id);
      
      // If no report exists, the document was just uploaded. Trigger analysis.
      if (!currentReport || !currentReport.report) {
        console.log('[IntelligenceContext] No report found, triggering analysis...');
        await analyzeDocument(session._id, document._id);
        currentReport = await getIntelligenceReport(session._id);
      }

      if (currentReport && currentReport.report) {
        setReport(currentReport.report);
        setStatus(currentReport.report.process);
      }
    } catch (err) {
      console.error('Failed to load or analyze intelligence', err);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async () => {
    try {
      const res = await getIntelligenceStatus(session._id);
      if (res && res.process) {
        setStatus(res.process);
        if (res.process.state === 'READY' || res.process.state === 'SEARCH_READY' || res.process.state === 'AI_READY') {
          const fullReport = await getIntelligenceReport(session._id);
          if (fullReport && fullReport.report) {
            setReport(fullReport.report);
          }
        }
      }
    } catch (e) {
      console.error('Failed to poll status', e);
    }
  };



  return (
    <IntelligenceContext.Provider value={{ report, loading, status, pollStatus }}>
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => useContext(IntelligenceContext);