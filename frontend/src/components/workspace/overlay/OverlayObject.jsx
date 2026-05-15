import React, { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

const OverlayObject = ({ overlay, isEditMode, unscaledViewport, updateOverlay, deleteOverlay }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const objectRef = useRef(null);

  // Convert PDF coordinates to CSS Top-Left coordinates
  // PDF Y=0 is bottom. CSS Top=0 is top.
  // So Top = viewport.height - pdf.y - pdf.height
  const cssTop = unscaledViewport.height - overlay.y - overlay.height;
  const cssLeft = overlay.x;

  const handlePointerDown = (e) => {
    if (!isEditMode) return;
    e.stopPropagation(); // prevent layer from creating a new object
    
    // Simple drag implementation
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startOverlayX = overlay.x;
    const startOverlayY = overlay.y;

    const onPointerMove = (moveEvent) => {
      // Find delta in screen space
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Since we don't have zoom passed directly easily, we can compute scale from getBoundingClientRect
      // Because we know unscaledViewport.width
      const containerRect = objectRef.current.parentElement.getBoundingClientRect();
      const scale = containerRect.width / unscaledViewport.width;

      const unscaledDeltaX = deltaX / scale;
      const unscaledDeltaY = deltaY / scale;

      updateOverlay(overlay.id, {
        x: startOverlayX + unscaledDeltaX,
        y: startOverlayY - unscaledDeltaY // Y decreases as we go down visually
      });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleResizePointerDown = (e) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = overlay.width;
    const startHeight = overlay.height;

    const onPointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const containerRect = objectRef.current.parentElement.getBoundingClientRect();
      const scale = containerRect.width / unscaledViewport.width;

      let newWidth = startWidth + deltaX / scale;
      let newHeight = startHeight + deltaY / scale;

      // Minimum sizes
      if (newWidth < 20) newWidth = 20;
      if (newHeight < 20) newHeight = 20;

      updateOverlay(overlay.id, {
        width: newWidth,
        height: newHeight
      });
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const renderContent = () => {
    if (overlay.type === 'text') {
      if (isEditing) {
        return (
          <textarea
            autoFocus
            className="w-full h-full border-none outline-none resize-none p-1"
            style={{ 
              color: overlay.style.color, 
              backgroundColor: overlay.style.bgColor || 'transparent',
              fontSize: `${overlay.style.fontSize}px` 
            }}
            value={overlay.content.text}
            onChange={(e) => updateOverlay(overlay.id, { content: { ...overlay.content, text: e.target.value } })}
            onBlur={() => setIsEditing(false)}
          />
        );
      }
      return (
        <div 
          className="w-full h-full whitespace-pre-wrap flex items-start p-1"
          style={{ 
            color: overlay.style.color, 
            backgroundColor: overlay.style.bgColor || 'transparent',
            fontSize: `${overlay.style.fontSize}px` 
          }}
          onDoubleClick={() => isEditMode && setIsEditing(true)}
        >
          {overlay.content.text}
        </div>
      );
    }
    
    if (overlay.type === 'highlight') {
      return (
        <div 
          className="w-full h-full"
          style={{ backgroundColor: overlay.style.color, opacity: overlay.style.opacity }}
        />
      );
    }

    if (overlay.type === 'delete') {
      return (
        <div 
          className="w-full h-full"
          style={{ backgroundColor: overlay.style.bgColor || '#ffffff' }}
        />
      );
    }

    if (overlay.type === 'image') {
      const src = overlay.content.previewUrl || overlay.content.imagePath;
      if (src) {
        return <img src={src} alt="Overlay" className="w-full h-full object-contain bg-black/5" style={{ opacity: overlay.style.opacity !== undefined ? overlay.style.opacity : 1 }} draggable="false" />;
      }
      return <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs">Image Placeholder</div>;
    }

    return null;
  };

  return (
    <div
      ref={objectRef}
      className={`absolute group ${isEditMode ? 'pointer-events-auto cursor-move hover:ring-2 ring-indigo-500/50' : 'pointer-events-none'}`}
      style={{
        left: `${cssLeft}px`,
        top: `${cssTop}px`,
        width: `${overlay.width}px`,
        height: `${overlay.height}px`,
        transform: `rotate(${overlay.rotation}deg)`,
      }}
      onPointerDown={handlePointerDown}
    >
      {renderContent()}

      {/* Delete Button (visible on hover in edit mode) */}
      {isEditMode && (
        <button
          className="absolute -top-4 -right-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-white/20 z-10"
          onClick={(e) => {
            e.stopPropagation();
            deleteOverlay(overlay.id);
          }}
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Resize Handle */}
      {isEditMode && (
        <div 
          className="absolute right-0 bottom-0 w-6 h-6 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end justify-end"
          onPointerDown={handleResizePointerDown}
        >
          <div className="w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-sm translate-x-1/2 translate-y-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default OverlayObject;
