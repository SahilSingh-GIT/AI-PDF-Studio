import React, { useEffect } from 'react';
import { Type } from 'lucide-react';
import { useOverlay } from '../../../../context/OverlayContext.jsx';

const OverlaySync = ({ setPayload, payload }) => {
  const { overlays, setDefaultOptions } = useOverlay();
  useEffect(() => {
    setPayload(prev => ({ ...prev, overlays }));
  }, [overlays, setPayload]);
  
  useEffect(() => {
    setDefaultOptions({
      text: payload.defaultText || 'New Text',
      fontSize: payload.fontSize || 16
    });
  }, [payload.defaultText, payload.fontSize, setDefaultOptions]);

  return null;
};

export const addTextConfig = {
  id: 'add-text',
  title: 'Add Text',
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
    if (payload.defaultText === undefined) {
      setTimeout(() => setPayload({ ...payload, defaultText: 'New Text', fontSize: 16 }), 0);
    }

    return (
      <div className="flex flex-col items-center justify-center w-full gap-4">
        <OverlaySync setPayload={setPayload} payload={payload} />
        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
          <Type className="text-indigo-400" size={24} />
        </div>
        <div className="text-center max-w-sm mb-2">
          <h3 className="text-lg font-bold text-slate-200 mb-2">Add Text</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Enter your text below, then click anywhere on the document to place it.
          </p>
        </div>
        <div className="flex flex-col w-full max-w-sm gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Text to Add</label>
            <input 
              type="text"
              value={payload.defaultText || ''}
              onChange={(e) => setPayload({ ...payload, defaultText: e.target.value })}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">Font Size</label>
            <input 
              type="number"
              value={payload.fontSize || 16}
              onChange={(e) => setPayload({ ...payload, fontSize: parseInt(e.target.value, 10) })}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
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

export default addTextConfig;
