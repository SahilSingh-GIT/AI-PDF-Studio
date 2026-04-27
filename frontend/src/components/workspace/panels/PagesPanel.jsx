/**
 * components/workspace/panels/PagesPanel.jsx
 *
 * Dedicated sidebar panel for navigating pages via thumbnails.
 * Reuses the ThumbnailService (PageThumbnailCard) for efficient rendering.
 * Stays synchronized with the Viewer.
 */

import React, { useEffect, useRef } from 'react';
import { useSession } from '../../../context/SessionContext.jsx';
import { useWorkflow } from '../../../context/WorkflowContext.jsx';
import { useDocumentIndex } from '../../../context/DocumentContext.jsx';
import PageThumbnailCard from '../overlay/PageThumbnailCard.jsx';
import { FileText } from 'lucide-react';

const PagesPanel = ({ tool, onClose }) => {
  const { session } = useSession();
  const { viewerState, goToPage } = useWorkflow();
  const { pdfDoc } = useDocumentIndex();
  
  const scrollContainerRef = useRef(null);

  // Auto-scroll the panel when viewerState.currentPage changes externally
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(`[data-page="${viewerState.currentPage}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [viewerState.currentPage]);

  if (!pdfDoc) {
    return (
      <div className="flex flex-col h-full bg-[#161616]">
        <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-500">
          Loading document...
        </div>
      </div>
    );
  }

  const pages = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);
  const Icon = tool.icon || FileText;

  return (
    <div className="flex flex-col h-full bg-[#161616]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333] shrink-0">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-gray-300" />
          <span className="text-sm font-semibold text-gray-200">
            {tool.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{pdfDoc.numPages} pages</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-[#262626]">
            ×
          </button>
        </div>
      </div>

      {/* Thumbnail List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
      >
        <div className="flex flex-col gap-3 pb-6">
        {pages.map(pageNum => (
          <div key={pageNum} data-page={pageNum} className="w-full">
            <PageThumbnailCard
              pdfDoc={pdfDoc}
              documentId={session?._id}
              version={session?.currentVersion || 1}
              pageNumber={pageNum}
              isSelected={viewerState.currentPage === pageNum}
              onSelect={goToPage}
              supportsSelection={true}
              // No dnd-kit props
              isDragging={false}
              setNodeRef={null}
              attributes={{}}
              listeners={{}}
              style={{}}
              compact={true}
            />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default PagesPanel;

