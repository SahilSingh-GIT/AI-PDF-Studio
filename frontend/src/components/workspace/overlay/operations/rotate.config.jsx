import React from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';

export const rotateConfig = {
  id: 'rotate-pages',
  title: 'Rotate Pages',
  supportsSelection: true,
  supportsDrag: false,
  
  // Dynamic apply button text based on selection
  getApplyButtonText: (selectedPages) => 
    selectedPages.length > 0 ? `Apply Rotation to ${selectedPages.length} Pages` : 'Select Pages to Rotate',
    
  // Validation before execution
  isValid: (selectedPages, payload) => 
    selectedPages.length > 0 && !!payload.angle,

  // Operation specific UI controls rendered above the grid
  renderControls: ({ payload, setPayload, selectedPages }) => {
    // Default payload for rotate
    if (payload.angle === undefined) {
      setPayload({ angle: 90 });
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-[#181818] border-b border-[#333333]">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Rotation Direction</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPayload({ angle: -90 })}
            className={`flex items-center gap-2 px-6 py-2 rounded font-medium transition-all ${
              payload.angle === -90 ? 'bg-[#333333] text-white border border-[#555555]' : 'bg-[#222222] text-gray-400 border border-[#333333] hover:bg-[#2a2a2a]'
            }`}
          >
            <RotateCcw size={16} />
            Left (-90°)
          </button>
          <button
            onClick={() => setPayload({ angle: 90 })}
            className={`flex items-center gap-2 px-6 py-2 rounded font-medium transition-all ${
              payload.angle === 90 ? 'bg-[#333333] text-white border border-[#555555]' : 'bg-[#222222] text-gray-400 border border-[#333333] hover:bg-[#2a2a2a]'
            }`}
          >
            <RotateCw size={16} />
            Right (+90°)
          </button>
        </div>
      </div>
    );

  },

  // Formatter to map local UI state to backend payload expected format
  formatPayload: (selectedPages, payload) => ({
    pages: selectedPages,
    angle: payload.angle
  })
};

export default rotateConfig;
