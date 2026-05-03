import React, { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useOverlay } from '../../../../context/OverlayContext.jsx';
import { useSession } from '../../../../context/SessionContext.jsx';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../constants/index.js';

const OverlaySync = ({ setPayload, payload }) => {
  const { overlays, setDefaultOptions } = useOverlay();
  useEffect(() => {
    setPayload(prev => ({ ...prev, overlays }));
  }, [overlays, setPayload]);

  useEffect(() => {
    setDefaultOptions({
      imagePath: payload.imagePath || ''
    });
  }, [payload.imagePath, setDefaultOptions]);

  return null;
};

// AddImageControls handles the actual file upload to the temp storage endpoint
const AddImageControls = ({ payload, setPayload }) => {
  const { session } = useSession();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SESSION}/upload-temp`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      
      setPayload({ ...payload, imagePath: data.path, originalName: data.filename });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
        <ImageIcon className="text-emerald-400" size={24} />
      </div>
      <div className="text-center max-w-sm">
        <h3 className="text-lg font-bold text-slate-200 mb-2">Add Image</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          Select an image below, then click anywhere on the document to place it.
        </p>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-4 items-center">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg" 
          onChange={handleFileChange}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-6 py-2.5 bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 hover:border-emerald-500/50 rounded-lg text-white font-medium transition-all flex items-center gap-2 text-sm"
        >
          {uploading ? (
            <span className="text-emerald-400">Uploading...</span>
          ) : (
            <>
              <Upload size={16} />
              {payload.imagePath ? 'Change Image' : 'Select Image'}
            </>
          )}
        </button>

        {payload.imagePath && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            Image ready: {payload.originalName}
          </div>
        )}

        {error && (
          <div className="text-xs text-rose-400 text-center w-full">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export const addImageConfig = {
  id: 'add-image',
  title: 'Add Image',
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
    <>
      <OverlaySync setPayload={setPayload} payload={payload} />
      <AddImageControls payload={payload} setPayload={setPayload} />
    </>
  ),

  formatPayload: (selectedPages, payload) => ({
    version: 1,
    overlays: payload.overlays || []
  })
};

export default addImageConfig;
