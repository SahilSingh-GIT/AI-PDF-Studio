import React, { useEffect, useState, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { useWorkflow } from '../../../context/WorkflowContext.jsx';
import { useSession } from '../../../context/SessionContext.jsx';
import { useOverlay } from '../../../context/OverlayContext.jsx';
import { API_BASE_URL, API_ENDPOINTS } from '../../../constants/index.js';

import usePageSelection from './usePageSelection.js';
import PageThumbnailGrid from './PageThumbnailGrid.jsx';
import OperationFooter from './OperationFooter.jsx';

import rotateConfig from './operations/rotate.config.jsx';
import deleteConfig from './operations/delete.config.jsx';
import reorderConfig from './operations/reorder.config.jsx';
import extractConfig from './operations/extract.config.jsx';
import insertConfig from './operations/insert.config.jsx';
import duplicateConfig from './operations/duplicate.config.jsx';
import pageNumbersConfig from './operations/page-numbers.config.jsx';
import { 
  exportWordConfig, 
  exportPowerPointConfig, 
  exportTextConfig, 
  exportImagesConfig 
} from './operations/export.config.jsx';

import {
  passwordProtectionConfig,
  removeSecurityConfig,
  permissionsConfig,
  digitalSignatureConfig
} from './operations/security.config.jsx';

import mergeConfig from './operations/merge.config.jsx';
import splitConfig from './operations/split.config.jsx';
import compressConfig from './operations/compress.config.jsx';
import watermarkConfig from './operations/watermark.config.jsx';

import { PageOperationService } from '../../../services/pageOperations/PageOperationService.js';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const CONFIG_MAP = {
  'rotate-pages': rotateConfig,
  'delete-pages': deleteConfig,
  'reorder-pages': reorderConfig,
  'extract-pages': extractConfig,
  'insert-blank-page': insertConfig,
  'duplicate-pages': duplicateConfig,
  'page-numbers': pageNumbersConfig,
  'export-word': exportWordConfig,
  'export-powerpoint': exportPowerPointConfig,
  'export-images': exportImagesConfig,
  'export-text': exportTextConfig,
  'password-protection': passwordProtectionConfig,
  'remove-security': removeSecurityConfig,
  'permissions': permissionsConfig,
  'digital-signature': digitalSignatureConfig,
  'merge-pdfs': mergeConfig,
  'split-pdf': splitConfig,
  'compress-pdf': compressConfig,
  'watermark': watermarkConfig
};

/**
 * PageOperationOverlay.jsx
 * 
 * Reusable modal shell for page-based PDF operations.
 * Strictly decoupled from PDF manipulation logic; dispatches via WorkflowContext.
 */
const PageOperationOverlay = () => {
  const { session } = useSession();
  const { selectedOperation, setSelectedOperation, executeOperation, isExecuting, error: workflowError } = useWorkflow();
  const { clearOverlays } = useOverlay();
  
  // Operation State Machine: 'IDLE' | 'PREPARING' | 'READY' | 'EXECUTING' | 'FAILED'
  const [opState, setOpState] = useState('IDLE');
  const [error, setError] = useState(null);
  
  // PDF Data
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]); // Array of current page order
  const [totalPages, setTotalPages] = useState(0);
  
  // Local operation payload (for dynamic UI like rotation angle)
  const [payload, setPayload] = useState({});
  
  // Generic Selection Manager
  const { selectedPages, toggleSelection, setSelection, clearSelection } = usePageSelection();

  // 1. Resolve Configuration
  const config = useMemo(() => CONFIG_MAP[selectedOperation], [selectedOperation]);

  // 2. State Machine: Prepare / Load PDF Document
  useEffect(() => {
    if (!config || !session) {
      setOpState('IDLE');
      setPdfDoc(null);
      return;
    }

    let isMounted = true;
    
    const prepareOverlay = async () => {
      setOpState('PREPARING');
      setError(null);
      clearSelection();
      setPayload({});
      
      try {
        if (config.hideGrid) {
          if (isMounted) {
            setTotalPages(1);
            setPages([1]);
            setOpState('READY');
          }
          return;
        }

        const documentUrl = `${API_BASE_URL}${API_ENDPOINTS.SESSION}/${session._id}/document?v=${session.currentVersion || 1}`;
        const loadingTask = pdfjsLib.getDocument({ url: documentUrl });
        const doc = await loadingTask.promise;
        
        if (isMounted) {
          setPdfDoc(doc);
          const total = doc.numPages;
          setTotalPages(total);
          
          const initialPages = Array.from({ length: total }, (_, i) => i + 1);
          setPages(initialPages);
          
          setOpState('READY');
        }
      } catch (err) {
        console.error('Failed to prepare overlay document:', err);
        if (isMounted) {
          setError('Failed to load document for operation.');
          setOpState('FAILED');
        }
      }
    };

    prepareOverlay();
    
    return () => {
      isMounted = false;
    };
  }, [config, session, clearSelection]);

  // If the user switches to a non-edit operation via sidebar, clear any pending overlays
  useEffect(() => {
    if (config && config.backendOperationId !== 'edit-content') {
      clearOverlays();
    }
  }, [config, clearOverlays]);

  const handleClose = () => {
    clearOverlays(); // Cancel -> clear
    setOpState('IDLE');
    setSelectedOperation(null);
  };

  // Sync execution state from WorkflowContext
  useEffect(() => {
    if (isExecuting) {
      setOpState('EXECUTING');
    } else if (opState === 'EXECUTING') {
      // If we just finished executing, and no error occurred, close automatically
      if (!workflowError) {
        clearOverlays(); // Success -> clear
        handleClose();
      } else {
        setError(workflowError);
        setOpState('FAILED');
        // Failure -> preserve overlays
      }
    }
  }, [isExecuting, workflowError]);

  // If no operation is selected, don't render the overlay
  if (!config) return null;

  const handleApply = async () => {
    if (opState !== 'READY' && opState !== 'FAILED') return;

    try {
      setError(null);
      await PageOperationService.execute(
        config,
        selectedPages,
        payload,
        totalPages,
        pages,
        executeOperation
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`absolute inset-0 z-50 flex p-4 lg:p-10 ${config.isFloating ? 'pointer-events-none items-end justify-center' : 'items-center justify-center bg-[#000000]/80'}`}>
      <div className={`flex flex-col w-full bg-[#1c1c1c] border border-[#333333] rounded-lg shadow-xl overflow-hidden ${config.isFloating ? 'max-w-md h-auto pointer-events-auto mb-4' : 'h-full max-w-6xl max-h-[90vh]'}`}>
        
        {/* Header */}
        <header className="shrink-0 h-16 flex items-center justify-between px-6 border-b border-[#333333] bg-[#222222]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{config.title}</h2>
            {opState === 'PREPARING' && <span className="text-xs px-2 py-1 bg-[#333333] text-gray-200 border border-[#444444] rounded">Loading...</span>}
            {opState === 'FAILED' && <span className="text-xs px-2 py-1 bg-[#3a1c1c] text-red-300 border border-[#552222] rounded">Failed</span>}
          </div>
          
          <button onClick={handleClose} disabled={isExecuting} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Dynamic Controls Region */}
        {config.renderControls && opState !== 'PREPARING' && (
          <div className={`flex justify-center w-full ${config.hideGrid ? 'flex-1 flex-col items-center' : 'shrink-0'}`}>
            {config.renderControls({
              selectedPages,
              setSelection,
              payload,
              setPayload,
              totalPages,
              pages
            })}
          </div>
        )}

        {/* Dynamic Preview Region */}
        {config.renderPreview && opState !== 'PREPARING' && (
          <div className="shrink-0">
            {config.renderPreview({
              selectedPages,
              payload,
              totalPages,
              pages
            })}
          </div>
        )}
        
        {/* Error Banner */}
        {error && (
          <div className="shrink-0 bg-[#3a1c1c] border-l-4 border-red-500 p-4 text-red-300 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Grid Region */}
        {!config.hideGrid && (
          <div className="flex-1 overflow-y-auto bg-[#141414] relative">
            {opState === 'PREPARING' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                  <svg className="animate-spin w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm">Preparing pages...</p>
                </div>
              </div>
            ) : (
              <PageThumbnailGrid
                pdfDoc={pdfDoc}
                documentId={session._id}
                version={session.currentVersion}
                pages={pages}
                selectedPages={selectedPages}
                onSelectPage={toggleSelection}
                supportsSelection={config.supportsSelection}
                supportsDrag={config.supportsDrag}
                onReorder={(newOrder) => setPages(newOrder)}
              />
            )}
          </div>
        )}

        {/* Generic Footer */}
        <OperationFooter
          onCancel={handleClose}
          onApply={handleApply}
          applyButtonText={config.getApplyButtonText(selectedPages, payload, pages)}
          isExecuting={isExecuting}
          isDisabled={opState === 'PREPARING' || !config.isValid(selectedPages, payload, totalPages, pages)}
        />
        
      </div>
    </div>
  );
};

export default PageOperationOverlay;
