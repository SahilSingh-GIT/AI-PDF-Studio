/**
 * pages/WorkspacePage.jsx — Document Session Workspace Shell.
 *
 * Layout: Toolbar → Sidebar | Viewer | Right Panel
 *
 * Features:
 *   - Session restore from SessionContext (populated on mount)
 *   - Displays the active document name in the toolbar
 *   - Loading state while session is being restored
 *   - 404 state if session is not found
 *   - Delete session with cleanup
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext.jsx';
import { useIntelligence } from '../context/IntelligenceContext.jsx';
import { sessionService } from '../services/sessionService.js';
import { WorkflowProvider } from '../context/WorkflowContext.jsx';
import Toolbar from '../components/workspace/Toolbar.jsx';
import Sidebar from '../components/workspace/Sidebar.jsx';
import DocumentViewer from '../components/workspace/DocumentViewer.jsx';
import StatusBar from '../components/workspace/StatusBar.jsx';
import RightPanel from '../components/workspace/RightPanel.jsx';
import PageOperationOverlay from '../components/workspace/overlay/PageOperationOverlay.jsx';
import { DocumentProvider } from '../context/DocumentContext.jsx';
import { OverlayProvider } from '../context/OverlayContext.jsx';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/index.js';
import { useWorkflow } from '../context/WorkflowContext.jsx';

const WorkspaceContent = ({ session, setViewerCapabilities }) => {
  const { selectedOperation } = useWorkflow();
  
  const isExpandedAIMode = selectedOperation && 
    ['ai-chat', 'ai-summarize', 'ai-key-insights', 'ai-translate'].includes(selectedOperation);

  return (
    <div className="flex flex-1 overflow-hidden bg-[#121212]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Center Viewer */}
      <main
        id="workspace-viewer"
        className="flex flex-col items-center justify-center overflow-auto relative bg-[#181818]"
        style={{ 
          flex: isExpandedAIMode ? '45 1 0%' : '1 1 0%'
        }}
      >
        <DocumentViewer 
          session={session} 
          onCapabilitiesReady={setViewerCapabilities} 
        />
      </main>

      {/* Right Panel (Dynamic Tool/Info Container) */}
      <RightPanel />
    </div>
  );
};


const WorkspacePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, document: doc, loading, activateSession, clearSession } = useSession();

  const [localLoading, setLocalLoading] = useState(false);
  const [notFound,     setNotFound]     = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [viewerCapabilities, setViewerCapabilities] = useState([]);

  useEffect(() => {
    if (loading) return;

    if (session && session._id === sessionId) return;

    const load = async () => {
      setLocalLoading(true);
      try {
        const data = await sessionService.getSession(sessionId);
        if (data.session) {
          activateSession(data.session);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLocalLoading(false);
      }
    };

    load();
  }, [sessionId, loading]);

  // ── Delete session handler ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Delete this document and session? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await sessionService.deleteSession(sessionId);
      clearSession();
      navigate('/');
    } catch {
      setDeleting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading || localLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-[#444444] border-t-white animate-spin" />
          <p className="text-gray-400 text-sm">Restoring workspace...</p>
        </div>
      </div>
    );
  }

  // ── Not found state ───────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="bg-[#1c1c1c] border border-[#333333] p-10 text-center max-w-sm rounded-lg shadow-lg">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-bold text-gray-200 mb-2">Session Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">
            This session may have expired or been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded bg-[#333333] hover:bg-[#444444] border border-[#555555] text-white text-sm font-semibold transition-all"
          >
            Upload New Document
          </button>
        </div>
      </div>
    );
  }

  const documentUrl = session?.document?.extension === 'pdf' 
    ? `${API_BASE_URL}${API_ENDPOINTS.SESSION}/${session._id}/document?v=${session.currentVersion || 1}` 
    : null;

  return (
    <DocumentProvider documentUrl={documentUrl}>
      <WorkflowProvider>
        <OverlayProvider>
          <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-[#121212]">
      
            {/* Toolbar receives capabilities from the Viewer */}
            <Toolbar viewerCapabilities={viewerCapabilities} />
      
            {/* Page Operation Overlay (renders only when an operation is active) */}
            <PageOperationOverlay />

            <WorkspaceContent session={session} setViewerCapabilities={setViewerCapabilities} />

            <StatusBar sessionId={sessionId} />
          </div>
        </OverlayProvider>
      </WorkflowProvider>
    </DocumentProvider>
  );
};

export default WorkspacePage;

