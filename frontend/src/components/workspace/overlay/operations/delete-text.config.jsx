import React, { useEffect } from 'react';
import { Eraser } from 'lucide-react';
import { useOverlay } from '../../../../context/OverlayContext.jsx';

const OverlaySync = ({ setPayload }) => {
  const { overlays } = useOverlay();
  useEffect(() => {
    setPayload({ overlays });
  }, [overlays, setPayload]);
  return null;
};

export const deleteTextConfig = {
  id: 'delete-text',
  title: 'Delete Text',
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

  renderControls: ({ payload, setPayload }) => (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <OverlaySync setPayload={setPayload} />
      <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center">
        <Eraser className="text-rose-400" size={24} />
      </div>
      <div className="text-center max-w-sm">
        <h3 className="text-lg font-bold text-slate-200 mb-2">Delete Text</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Click and drag over any text in the document preview to white it out.
        </p>
      </div>
    </div>
  ),

  formatPayload: (selectedPages, payload) => ({
    version: 1,
    overlays: payload.overlays || []
  })
};

export default deleteTextConfig;
