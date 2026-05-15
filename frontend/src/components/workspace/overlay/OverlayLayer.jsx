import React, { useState, useRef, useEffect } from 'react';
import { useOverlay } from '../../../context/OverlayContext.jsx';
import { useWorkflow } from '../../../context/WorkflowContext.jsx';
import OverlayObject from './OverlayObject.jsx';

const OverlayLayer = ({ pageNumber, zoom, unscaledViewport }) => {
  const { overlays, addOverlay, updateOverlay, deleteOverlay, defaultOptions, placementMode, setPlacementMode } = useOverlay();
  const { selectedOperation } = useWorkflow();
  const layerRef = useRef(null);

  const scale = zoom / 100;
  
  // Only render overlays for this page
  const pageOverlays = overlays.filter(o => o.pageIndex === pageNumber);

  // If we're not in an edit-content mode, and there are no overlays, render nothing
  // (Wait, we should always render overlays if they exist, but only capture clicks if in edit mode)
  const isEditMode = ['add-text', 'delete-text', 'highlight', 'add-image'].includes(selectedOperation);

  // --- HIGHLIGHT TEXT SELECTION LOGIC ---
  useEffect(() => {
    if (selectedOperation !== 'highlight') return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      
      // Ensure the selection is within this specific page's container
      const container = layerRef.current?.parentElement;
      if (!container || !container.contains(range.commonAncestorContainer)) return;

      const rects = range.getClientRects();
      const containerRect = container.getBoundingClientRect();
      const scale = containerRect.width / unscaledViewport.width;

      const newHighlights = [];
      
      for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        
        // Convert screen rect to unscaled PDF rect
        const scaledX = rect.left - containerRect.left;
        const scaledY = rect.top - containerRect.top;
        
        const unscaledX = scaledX / scale;
        const unscaledY = scaledY / scale;
        const unscaledWidth = rect.width / scale;
        const unscaledHeight = rect.height / scale;

        // In PDF coordinates, Y=0 is bottom
        const pdfX = unscaledX;
        const pdfY = unscaledViewport.height - unscaledY;

        newHighlights.push({
          id: crypto.randomUUID(),
          type: 'highlight',
          pageIndex: pageNumber,
          x: pdfX,
          y: pdfY - unscaledHeight, // Bottom-left corner
          width: unscaledWidth,
          height: unscaledHeight,
          rotation: 0,
          style: {
            color: defaultOptions.color || '#fbbf24',
            opacity: defaultOptions.opacity || 0.3
          },
          content: {}
        });
      }

      newHighlights.forEach(h => addOverlay(h));
      selection.removeAllRanges(); // Clear selection after highlighting
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [selectedOperation, pageNumber, unscaledViewport, defaultOptions, addOverlay]);

  // --- PLACEMENT LOGIC ---
  const handlePointerDown = (e) => {
    if (!isEditMode || selectedOperation === 'highlight' || !placementMode) return;
    
    // Don't trigger if they clicked an existing overlay object (it will stop propagation)
    if (e.target !== layerRef.current) return;

    // Get coordinates relative to the unscaled viewport
    const containerRect = layerRef.current.parentElement.getBoundingClientRect();
    const scale = containerRect.width / unscaledViewport.width;
    
    const scaledX = e.clientX - containerRect.left;
    const scaledY = e.clientY - containerRect.top;
    
    const unscaledX = scaledX / scale;
    const unscaledY = scaledY / scale;
    
    // PDF coordinates: (0,0) is bottom-left
    const pdfX = unscaledX;
    const pdfY = unscaledViewport.height - unscaledY;

    // Default sizes in PDF points
    let width = selectedOperation === 'add-image' ? 200 : 150;
    let height = selectedOperation === 'add-image' ? 150 : 50;
    
    let type = selectedOperation === 'add-text' ? 'text' 
             : selectedOperation === 'delete-text' ? 'delete' 
             : 'image';

    const newOverlay = {
      id: crypto.randomUUID(),
      type,
      pageIndex: pageNumber,
      x: pdfX,
      y: pdfY - height, // Adjust y to be the bottom-left of the initial box
      width,
      height,
      rotation: 0,
      style: {
        color: defaultOptions.color || '#000000',
        bgColor: defaultOptions.bgColor || '#ffffff',
        fontSize: defaultOptions.fontSize || 16,
        opacity: defaultOptions.opacity !== undefined ? defaultOptions.opacity : 1
      },
      content: {
        text: type === 'text' ? (defaultOptions.text || 'New Text') : '',
        imagePath: type === 'image' ? (defaultOptions.imagePath || '') : '',
        previewUrl: type === 'image' ? (defaultOptions.previewUrl || '') : ''
      }
    };

    addOverlay(newOverlay);
    setPlacementMode(false); // Turn off placement mode after one drop
  };

  return (
    <div
      ref={layerRef}
      className={`absolute top-0 left-0 ${placementMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
      style={{
        width: `${unscaledViewport.width}px`,
        height: `${unscaledViewport.height}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
      onPointerDown={handlePointerDown}
    >
      {pageOverlays.map(overlay => (
        <OverlayObject
          key={overlay.id}
          overlay={overlay}
          isEditMode={isEditMode}
          unscaledViewport={unscaledViewport}
          updateOverlay={updateOverlay}
          deleteOverlay={deleteOverlay}
        />
      ))}
    </div>
  );
};

export default OverlayLayer;
