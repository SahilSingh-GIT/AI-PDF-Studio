/**
 * components/workspace/Toolbar.jsx
 *
 * Top toolbar for the workspace.
 * Uses WorkflowContext functions directly for zoom control (no EventBus).
 */

import { useState } from 'react';
import { APP_NAME, API_BASE_URL, API_ENDPOINTS } from '../../constants/index.js';
import { truncate, formatBytes } from '../../utils/index.js';
import { useSession } from '../../context/SessionContext.jsx';
import { useWorkflow } from '../../context/WorkflowContext.jsx';
import { 
  Undo, Redo, ZoomIn, ZoomOut, Maximize, FileText, Search, Download, Trash2, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../../services/sessionService.js';

const Toolbar = ({ viewerCapabilities = [] }) => {
  const { session, document: doc, clearSession } = useSession();
  const { viewerState, zoomIn, zoomOut, zoomReset, goToPage } = useWorkflow();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const docName = doc?.originalName || 'Untitled Document';
  const docSize = doc?.size ? formatBytes(doc.size) : '';
  const docExt  = doc?.extension?.toUpperCase() || '';

  const handleDownload = async () => {
    if (isDownloading) return; // Prevent duplicate downloads
    
    setIsDownloading(true);
    let objectUrl = null;
    
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.SESSION}/${session._id}/document?v=${session.currentVersion}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response type: Expected a PDF document.');
      }
      
      const blob = await response.blob();
      objectUrl = window.URL.createObjectURL(blob);
      
      let filename = 'document.pdf';
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      } else if (docName && docName !== 'Untitled Document') {
        filename = docName;
      }
      
      if (session.currentVersion > 1) {
        filename = filename.replace(/(\.[\w\d_-]+)$/i, '_edited$1');
      }

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove(); // Cleanup immediately
    } catch (err) {
      console.error('[Download Error]', err);
      window.alert('Failed to download document. Please try again.');
    } finally {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this document and session? This cannot be undone.')) return;
    try {
      await sessionService.deleteSession(session._id);
      clearSession();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 h-14 shrink-0 z-10 bg-[#1c1c1c] border-b border-[#333333]">
      {/* Left — Identity & Document Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded bg-[#2a2a2a] border border-[#444444] flex items-center justify-center text-sm shrink-0">
          <FileText size={18} className="text-gray-200" />
        </div>
        <span className="text-sm font-semibold text-gray-300 shrink-0 hidden sm:inline">{APP_NAME}</span>
        <span className="text-gray-500 text-sm shrink-0 hidden sm:inline">/</span>
        
        <span className="text-sm font-medium text-gray-200 truncate" title={docName}>
          {truncate(docName, 40)}
        </span>
        
        {docExt && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 hidden md:inline bg-[#2a2a2a] border border-[#444444] text-gray-300">
            {docExt}
          </span>
        )}
      </div>

      {/* Center — Standard Tools */}
      <div className="flex items-center justify-center gap-1 shrink-0">
        <ToolButton icon={<Undo size={16} />} title="Undo" disabled />
        <ToolButton icon={<Redo size={16} />} title="Redo" disabled />
        
        <div className="w-px h-5 mx-2 bg-[#333333]" />
        
        {viewerCapabilities.includes('search') && (
          <>
            <ToolButton icon={<Search size={16} />} title="Search" />
            <div className="w-px h-5 mx-2 bg-[#333333]" />
          </>
        )}
        
        {viewerCapabilities.includes('page-nav') && (
          <>
            <div className="flex items-center gap-1 bg-[#262626] border border-[#333333] rounded px-2 py-1 mx-1">
              <ToolButton 
                icon={<ChevronLeft size={16} />} 
                title="Previous Page" 
                onClick={() => goToPage(viewerState.currentPage - 1)}
                disabled={viewerState.currentPage <= 1}
              />
              <span className="text-xs font-mono text-gray-300 select-none px-2">
                Page {viewerState.currentPage} / {viewerState.totalPages || '?'}
              </span>
              <ToolButton 
                icon={<ChevronRight size={16} />} 
                title="Next Page" 
                onClick={() => goToPage(viewerState.currentPage + 1)}
                disabled={!viewerState.totalPages || viewerState.currentPage >= viewerState.totalPages}
              />
            </div>
            <div className="w-px h-5 mx-2 bg-[#333333]" />
          </>
        )}
        
        {viewerCapabilities.includes('zoom') && (
          <>
            <ToolButton icon={<ZoomOut size={16} />} title="Zoom Out" onClick={zoomOut} />
            <span className="text-xs font-mono w-12 text-center text-gray-300 select-none">
              {viewerState.zoom}%
            </span>
            <ToolButton icon={<ZoomIn size={16} />} title="Zoom In" onClick={zoomIn} />
            <ToolButton icon={<Maximize size={16} />} title="Fit Page" onClick={zoomReset} />
          </>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-[#2a2a2a] hover:bg-[#333333] border border-[#444444] text-gray-200 transition-colors ${
            isDownloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          <span className="hidden sm:inline">Download</span>
        </button>
        
        <button
          onClick={handleDelete}
          title="Delete Session"
          className="w-8 h-8 rounded flex items-center justify-center transition-colors bg-[#2a1a1a] hover:bg-[#3d1f1f] text-red-400 border border-[#4a2424]"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </header>
  );
};

const ToolButton = ({ icon, title, onClick, disabled }) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
      disabled ? 'opacity-30 cursor-not-allowed text-gray-500' : 'hover:bg-[#333333] text-gray-300'
    }`}
  >
    {icon}
  </button>
);

export default Toolbar;

