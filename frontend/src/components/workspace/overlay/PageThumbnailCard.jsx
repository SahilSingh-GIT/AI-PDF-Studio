import React, { useEffect, useState, useRef } from 'react';
import { ThumbnailCache } from '../../../utils/ThumbnailCache.js';

/**
 * PageThumbnailCard.jsx
 *
 * Reusable card representing a single PDF page.
 * Responsibilities:
 * - Render thumbnail efficiently using ThumbnailCache.
 * - Display page number and selection state.
 * - Accept dnd-kit sortable refs/listeners (passed as props if drag enabled).
 */
const PageThumbnailCard = ({
  pdfDoc,
  documentId,
  version,
  pageNumber,
  isSelected,
  onSelect,
  supportsSelection,
  compact = false,
  
  // Dnd-kit sortable props (injected by grid if drag supported)
  isDragging,
  setNodeRef,
  attributes,
  listeners,
  style
}) => {
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pdfDoc) return;

    // 1. Check Cache
    const cached = ThumbnailCache.get(documentId, version, pageNumber);
    if (cached) {
      setDataUrl(cached);
      setLoading(false);
      return;
    }

    // 2. Generate if not cached
    let cancelled = false;
    let renderTask = null;

    const generateThumbnail = async () => {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        // Render at a fixed, small scale for thumbnails (e.g. max width 200px)
        const viewport = page.getViewport({ scale: 1 });
        const scale = 200 / viewport.width; // Fixed width of 200px for thumbnail
        const scaledViewport = page.getViewport({ scale: Math.min(scale, 1) });

        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        renderTask = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        });

        await renderTask.promise;
        if (cancelled) return;

        // Convert to image URL for caching and smooth dragging
        const url = canvas.toDataURL('image/jpeg', 0.8);
        ThumbnailCache.set(documentId, version, pageNumber, url);
        setDataUrl(url);
      } catch (err) {
        if (err.name !== 'RenderingCancelledException' && !cancelled) {
          console.error(`Failed to render thumbnail for page ${pageNumber}`, err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      cancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, documentId, version, pageNumber]);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0.4 : 1,
        transformOrigin: '0 0'
      }}
      className={`relative flex flex-col items-center select-none transition-all
        ${compact ? 'p-2 rounded border border-[#333333]' : 'p-3 rounded-lg bg-[#222222] border border-[#333333]'}
        ${supportsSelection ? 'cursor-pointer' : ''}
        ${!compact && supportsSelection ? 'hover:bg-[#2a2a2a]' : ''}
        ${compact && supportsSelection && !isSelected ? 'hover:border-[#555555] hover:bg-[#262626]' : ''}
        ${isDragging ? 'cursor-grabbing z-50 shadow-xl scale-105' : ''}
        ${!isDragging && !supportsSelection ? 'cursor-grab' : ''}
        ${isSelected ? (compact ? 'border-white bg-[#333333]' : 'ring-2 ring-white bg-[#333333]') : (!compact ? 'ring-1 ring-white/5' : 'border-[#333333]')}
      `}
      onClick={() => supportsSelection && onSelect && onSelect(pageNumber)}
      {...attributes}
      {...listeners}
    >
      {/* Selection Checkbox indicator (Hidden in compact mode) */}
      {supportsSelection && !compact && (
        <div className={`absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center transition-colors
          ${isSelected ? 'bg-white text-black font-bold' : 'bg-[#181818] border border-[#444444]'}
        `}>
          {isSelected && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Thumbnail Wrapper */}
      <div className={`w-full flex items-center justify-center overflow-hidden
        ${compact ? 'mb-2' : 'bg-[#141414] rounded-sm mb-3 shadow-inner h-40'}
      `}>
        {loading && !dataUrl && (
          <div className={`animate-pulse w-full bg-[#2a2a2a] ${compact ? 'aspect-[3/4] rounded-sm' : 'h-full'}`} />
        )}
        
        {/* We use a hidden canvas for generation, and an <img> tag for actual display (faster for DnD) */}
        <canvas ref={canvasRef} className="hidden" />
        
        {dataUrl && (
          <img 
            src={dataUrl} 
            alt={`Page ${pageNumber}`}
            className={`max-w-full max-h-full object-contain ${compact ? 'border border-[#444444] shadow-md rounded-[1px]' : 'drop-shadow-md'}`}
            draggable={false} // Native drag disabled to allow dnd-kit to handle it
          />
        )}
      </div>

      <div className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold ${isSelected && compact ? 'text-white' : 'text-gray-400'}`}>
        Page {pageNumber}
      </div>
    </div>
  );
};

export default PageThumbnailCard;

