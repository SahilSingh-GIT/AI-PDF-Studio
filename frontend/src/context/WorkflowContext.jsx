/**
 * context/WorkflowContext.jsx
 *
 * Manages two concerns for the workspace:
 *
 * 1. Viewer State — transient, frontend-only UI state (currentPage, totalPages, zoom).
 *    Not persisted to the backend. Lost on refresh (by design).
 *
 * 2. Workflow Operations — available operations fetched from the Workflow Engine,
 *    selected operation tracking, and operation execution.
 *
 * Architecture:
 *   - Single provider instance, mounted in WorkspacePage.
 *   - All workspace components consume this context.
 *   - No EventBus. Toolbar/PdfViewer call context functions directly.
 *   - No backend persistence of viewer state.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workflowService } from '../services/workflowService.js';
import { useSession } from './SessionContext.jsx';
import { toolRegistry } from '../config/toolRegistry.js';

const WorkflowContext = createContext(null);

export const WorkflowProvider = ({ children }) => {
  const { session, activateSession } = useSession();

  // ── Viewer State (frontend-only, not persisted) ───────────────────────────
  const [viewerState, setViewerState] = useState({
    currentPage: 1,
    totalPages: 0,
    zoom: 100,
  });

  // ── Workflow State ────────────────────────────────────────────────────────
  const [operations, setOperations] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  // ── Viewer State Mutators ─────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    setViewerState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 10, 300),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewerState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 10, 50),
    }));
  }, []);

  const zoomReset = useCallback(() => {
    setViewerState((prev) => ({ ...prev, zoom: 100 }));
  }, []);

  const setZoom = useCallback((zoomValue) => {
    setViewerState((prev) => ({ ...prev, zoom: zoomValue }));
  }, []);

  const goToPage = useCallback((page) => {
    setViewerState((prev) => {
      const clamped = Math.max(1, Math.min(page, prev.totalPages || 1));
      return { ...prev, currentPage: clamped };
    });
  }, []);

  const setTotalPages = useCallback((total) => {
    setViewerState((prev) => ({ ...prev, totalPages: total }));
  }, []);

  // ── Load available operations on mount ────────────────────────────────────
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const fetchOps = async () => {
      try {
        const data = await workflowService.getOperations();
        setOperations(data.operations);
        setCategories(data.categories);
      } catch (err) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchOps, 2000);
        } else {
          console.error('Failed to load workflow operations after retries', err);
        }
      }
    };
    fetchOps();
  }, []);

  // ── Execute an operation ──────────────────────────────────────────────────
  const executeOperation = useCallback(async (operationId, payload = {}) => {
    if (!session) return;

    setIsExecuting(true);
    setError(null);

    try {
      const tool = toolRegistry[operationId];
      const actualOperationId = tool?.backendOperationId || operationId;
      
      const result = await workflowService.executeWorkflow(session._id, actualOperationId, payload);
      activateSession(result.session);
      return result;
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsExecuting(false);
    }
  }, [session, activateSession]);

  const value = {
    // Viewer state
    viewerState,
    zoomIn,
    zoomOut,
    zoomReset,
    setZoom,
    goToPage,
    setTotalPages,

    // Workflow state
    operations,
    categories,
    selectedOperation,
    setSelectedOperation,

    // Execution
    isExecuting,
    error,
    executeOperation,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    throw new Error('useWorkflow must be used within a <WorkflowProvider>');
  }
  return ctx;
};

export default WorkflowContext;
