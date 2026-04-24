import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'pdfjs-dist/web/pdf_viewer.css';
import { useWorkflow } from '../../context/WorkflowContext.jsx';
import { useDocumentIndex } from '../../context/DocumentContext.jsx';
import OverlayLayer from './overlay/OverlayLayer.jsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const HighlightLayer = ({ pageNumber, zoom, unscaledViewport }) => {
  const { activeMatches, currentMatchIndex } = useDocumentIndex();
  const matchesOnThisPage = activeMatches.filter(m => m.page === pageNumber);

  if (matchesOnThisPage.length === 0) return null;

  const scale = zoom / 100;

  return (
    <div 
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: `${unscaledViewport.width}px`,
        height: `${unscaledViewport.height}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {matchesOnThisPage.map((match) => {
        const isCurrent = activeMatches[currentMatchIndex]?.id === match.id;
        return match.boundingBoxes.map((box, bIdx) => {
          const tx = box.transform[4];
          const ty = box.transform[5];
          // Font size is roughly box.transform[0] (or scaleY)
          const fontSize = box.transform[0];
          
          // Convert from bottom-left to top-left
          const top = unscaledViewport.height - ty - fontSize;

          return (
            <div
              key={`${match.id}_${bIdx}`}
              className={`absolute rounded-[2px] ${isCurrent ? 'bg-indigo-500/40 ring-1 ring-indigo-500' : 'bg-yellow-500/30'}`}
              style={{
                left: `${tx}px`,
                top: `${top}px`,
                width: `${box.width}px`,
                height: `${fontSize * 1.2}px`, // Slight padding
              }}
            />
          );
        });
      })}
    </div>
  );
};

const PdfPage = ({ pdfDoc, pageNumber, zoom }) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [unscaledViewport, setUnscaledViewport] = useState(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !textLayerRef.current) return;
    let cancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const scale = zoom / 100;
        const viewport = page.getViewport({ scale });
        const unscaled = page.getViewport({ scale: 1 });
        setUnscaledViewport(unscaled);

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderTask = page.render({
          canvasContext: context,
          transform,
          viewport,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;

        if (cancelled) return;

        // Render TextLayer
        const textContent = await page.getTextContent();
        if (cancelled) return;

        const textLayerDiv = textLayerRef.current;
        textLayerDiv.innerHTML = '';
        textLayerDiv.style.width = canvas.style.width;
        textLayerDiv.style.height = canvas.style.height;
        textLayerDiv.style.setProperty('--scale-factor', scale);

        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: viewport
        });
        await textLayer.render();

      } catch (err) {
        if (err.name !== 'RenderingCancelledException' && !cancelled) {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, zoom]);

  return (
    <div className="mb-8 flex justify-center w-full" id={`pdf-page-${pageNumber}`}>
      <div 
        className="relative shadow-2xl rounded-sm bg-white overflow-hidden" 
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
      >
        {/* 1. Canvas Layer */}
        <canvas ref={canvasRef} className="block" />
        
        {/* 2. Text Layer (for native selection, CSS handled by pdf_viewer.css) */}
        <div ref={textLayerRef} className="textLayer absolute top-0 left-0" />
        
        {/* 3. Highlight Layer */}
        {unscaledViewport && (
          <HighlightLayer 
            pageNumber={pageNumber} 
            zoom={zoom} 
            unscaledViewport={unscaledViewport} 
          />
        )}
        
        {/* 4. Overlay Layer (Edit Content) */}
        {unscaledViewport && (
          <OverlayLayer
            pageNumber={pageNumber}
            zoom={zoom}
            unscaledViewport={unscaledViewport}
          />
        )}
      </div>
    </div>
  );
};

const PdfViewer = () => {
  const { viewerState, setTotalPages, goToPage, setZoom } = useWorkflow();
  const { pdfDoc, isPasswordRequired, passwordError, isUnlocking, submitPassword } = useDocumentIndex();
  const observerRef = useRef(null);
  const currentPageRef = useRef(viewerState.currentPage);
  const [passwordInput, setPasswordInput] = useState('');
  
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(null);

  // Fetch unscaled width of first page for auto-fit calculations
  useEffect(() => {
    if (pdfDoc) {
      pdfDoc.getPage(1).then(page => {
        const vp = page.getViewport({ scale: 1 });
        setPageWidth(vp.width);
      }).catch(err => console.error("Could not get page 1 width", err));
    }
  }, [pdfDoc]);

  // Auto-fit zoom when container resizes
  useEffect(() => {
    if (!containerRef.current || !pageWidth || !setZoom) return;
    
    let timeoutId;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        // Thin margin: p-2 is 8px each side (16px total) + 16px for scrollbar = 32px
        const availableWidth = containerWidth - 32;
        let idealZoom = Math.floor((availableWidth / pageWidth) * 100);
        idealZoom = Math.max(50, Math.min(idealZoom, 300));
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setZoom(idealZoom);
        }, 10); // execute almost immediately
      }
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [pageWidth, setZoom]);

  // Sync ref so the IntersectionObserver always sees the latest without re-creating itself
  useEffect(() => {
    currentPageRef.current = viewerState.currentPage;
  }, [viewerState.currentPage]);

  // Sync total pages when pdfDoc is ready
  useEffect(() => {
    if (pdfDoc) {
      setTotalPages(pdfDoc.numPages);
    }
  }, [pdfDoc, setTotalPages]);

  const pages = pdfDoc ? Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1) : [];
  const isProgrammaticScrollRef = useRef(false);

  // Smooth-scroll when currentPage is changed via Toolbar controls
  useEffect(() => {
    const pageEl = document.getElementById(`pdf-page-${viewerState.currentPage}`);
    if (pageEl && !isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = true;
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
  }, [viewerState.currentPage]);

  // Setup intersection observer to update current page on user scroll
  useEffect(() => {
    if (!pdfDoc) return;

    const options = {
      root: document.getElementById('workspace-viewer'),
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (isProgrammaticScrollRef.current) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageStr = entry.target.id.split('-').pop();
          const pageNum = parseInt(pageStr, 10);
          if (pageNum && pageNum !== currentPageRef.current) {
            goToPage(pageNum);
          }
        }
      });
    }, options);

    const observer = observerRef.current;
    
    // Slight delay to allow DOM to render before observing
    const timeout = setTimeout(() => {
      pages.forEach(pageNum => {
        const el = document.getElementById(`pdf-page-${pageNum}`);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [pdfDoc, pages.length, goToPage]);

  if (isPasswordRequired) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-[#121212]">
        <div className="bg-[#1c1c1c] p-8 rounded-lg border border-[#333333] shadow-lg max-w-sm w-full flex flex-col items-center">
          <div className="w-12 h-12 bg-[#2a2a2a] border border-[#444444] rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Protected Document</h3>
          <p className="text-xs text-gray-400 text-center mb-6">
            This document is encrypted. Enter the password to unlock and view the contents.
          </p>
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (passwordInput && !isUnlocking) submitPassword(passwordInput); 
            }} 
            className="flex flex-col gap-3 w-full"
          >
            <input 
              type="password" 
              placeholder="Enter password..." 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              disabled={isUnlocking}
              className={`w-full bg-[#161616] border rounded p-2.5 text-sm text-gray-200 focus:outline-none transition-colors
                ${passwordError ? 'border-red-500' : 'border-[#444444] focus:border-[#666666]'}
              `}
              autoFocus
            />
            {passwordError && (
              <span className="text-[10px] text-red-400 font-medium px-1">Incorrect password. Please try again.</span>
            )}
            <button 
              type="submit" 
              disabled={!passwordInput || isUnlocking}
              className="w-full py-2.5 mt-2 bg-[#333333] hover:bg-[#444444] disabled:bg-[#222222] disabled:text-gray-500 text-white rounded border border-[#555555] font-medium transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isUnlocking ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Unlocking...
                </>
              ) : (
                'Unlock Document'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!pdfDoc) {
    return <div className="text-slate-400 flex items-center justify-center w-full h-full">Loading document...</div>;
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center overflow-auto w-full h-full p-2 relative">
      {pages.map(pageNum => (
        <PdfPage 
          key={pageNum}
          pdfDoc={pdfDoc}
          pageNumber={pageNum}
          zoom={viewerState.zoom}
        />
      ))}
    </div>
  );
};

export default PdfViewer;
