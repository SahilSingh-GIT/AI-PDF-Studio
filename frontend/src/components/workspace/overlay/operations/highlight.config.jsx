import React, { useEffect } from 'react';
import { Highlighter } from 'lucide-react';
import { useOverlay } from '../../../../context/OverlayContext.jsx';

const OverlaySync = ({ setPayload, payload }) => {
  const { overlays, setDefaultOptions } = useOverlay();
  useEffect(() => {
    setPayload(prev => ({ ...prev, overlays }));
  }, [overlays, setPayload]);

  useEffect(() => {
    setDefaultOptions({
      color: payload.color || '#fbbf24',
      opacity: payload.opacity || 0.3
    });
  }, [payload.color, payload.opacity, setDefaultOptions]);

  return null;
};

export const highlightConfig = {
  id: 'highlight',
  title: 'Highlight',
  backendOperationId: 'edit-content',
  hideGrid: true,
  isFloating: true,
  
  getApplyButtonText: (selectedPages, payload) => {
    const count = payload.overlays?.length || 0;
    return count > 0 ? `Apply ${count} Edit${count > 1 ? 's' : ''}` : 'Apply Edits';
  },

  isValid: (selectedPages, payload) => {
    return payload.overlays && payload.overlays.length > 0;
  },

  renderControls: ({ payload, setPayload }) => {
    if (payload.color === undefined) {
      setTimeout(() => setPayload({ ...payload, color: '#fbbf24', opacity: 0.3 }), 0);
    }

    return (
      <div className="flex flex-col items-center justify-center w-full gap-4">
        <OverlaySync setPayload={setPayload} payload={payload} />
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
          <Highlighter className="text-amber-400" size={24} />
        </div>
        <div className="text-center max-w-sm mb-4">
          <h3 className="text-lg font-bold text-slate-200 mb-2">Highlight Area</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Choose a color, then click and drag over any area to highlight it.
          </p>
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-4">
          <div className="flex items-center gap-4 justify-center">
            {['#fbbf24', '#f87171', '#34d399', '#60a5fa'].map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${payload.color === color ? 'border-white scale-110' : 'border-transparent opacity-70'} transition-all`}
                style={{ backgroundColor: color }}
                onClick={() => setPayload({ ...payload, color })}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    version: 1,
    overlays: payload.overlays || []
  })
};

export default highlightConfig;
