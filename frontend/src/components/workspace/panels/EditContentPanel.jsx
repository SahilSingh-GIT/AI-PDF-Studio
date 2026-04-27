import React, { useEffect, useState, useRef } from 'react';
import { useOverlay } from '../../../context/OverlayContext.jsx';
import { useWorkflow } from '../../../context/WorkflowContext.jsx';
import { useSession } from '../../../context/SessionContext.jsx';
import { 
  Type, 
  Trash, 
  Highlighter, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  Settings2, 
  Palette, 
  Eye, 
  MousePointer2 
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../../constants/index.js';

const EditContentPanel = ({ tool, onClose }) => {
  const { 
    overlays, 
    clearOverlays, 
    defaultOptions, 
    setDefaultOptions, 
    placementMode, 
    setPlacementMode 
  } = useOverlay();
  
  const { executeOperation, isExecuting, error: workflowError } = useWorkflow();
  const [localError, setLocalError] = useState(null);

  // Initialize defaults when tool changes
  useEffect(() => {
    setPlacementMode(false);
    
    if (tool.id === 'add-text') {
      setDefaultOptions({
        text: defaultOptions.text || 'New Text',
        fontSize: defaultOptions.fontSize || 16,
        color: defaultOptions.color || '#000000',
        bgColor: defaultOptions.bgColor || '#ffffff'
      });
    } else if (tool.id === 'delete-text') {
      setDefaultOptions({
        bgColor: defaultOptions.bgColor || '#ffffff'
      });
    } else if (tool.id === 'highlight') {
      setDefaultOptions({
        color: defaultOptions.color || '#fbbf24',
        opacity: defaultOptions.opacity || 0.3
      });
    } else if (tool.id === 'add-image') {
      setDefaultOptions({
        opacity: defaultOptions.opacity || 1
      });
    }
  }, [tool.id]);

  const handleApply = async () => {
    if (overlays.length === 0) return;
    setLocalError(null);
    try {
      const payload = {
        version: 1,
        overlays: overlays
      };
      const result = await executeOperation('edit-content', payload);
      if (result && !result.error) {
        clearOverlays();
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const renderAddText = () => (
    <div className="space-y-5">
      <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/50 space-y-3 shadow-sm">
        <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
          <Type size={14} /> Content
        </label>
        <textarea
          value={defaultOptions.text || ''}
          onChange={(e) => setDefaultOptions({ ...defaultOptions, text: e.target.value })}
          className="w-full h-20 bg-slate-900/60 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
          placeholder="Enter text..."
        />
      </div>
      
      <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/50 space-y-3.5 shadow-sm">
        <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
          <Settings2 size={14} /> Appearance
        </label>
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Font Size</span>
          <input
            type="number"
            value={defaultOptions.fontSize || 16}
            onChange={(e) => setDefaultOptions({ ...defaultOptions, fontSize: parseInt(e.target.value, 10) })}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Text</span>
            <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-md border border-slate-700 hover:border-slate-600 transition-colors">
              <input 
                type="color" 
                value={defaultOptions.color || '#000000'}
                onChange={(e) => setDefaultOptions({ ...defaultOptions, color: e.target.value })}
                className="w-full h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Background</span>
            <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-md border border-slate-700 hover:border-slate-600 transition-colors">
              <input 
                type="color" 
                value={defaultOptions.bgColor || '#ffffff'}
                onChange={(e) => setDefaultOptions({ ...defaultOptions, bgColor: e.target.value })}
                className="w-full h-6 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setPlacementMode(!placementMode)}
        className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${
          placementMode 
            ? 'bg-indigo-600 text-white ring-1 ring-indigo-400' 
            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-slate-600'
        }`}
      >
        <MousePointer2 size={16} />
        {placementMode ? 'Click on PDF to Place' : 'Pick & Place Text'}
      </button>
    </div>
  );

  const renderDeleteText = () => (
    <div className="space-y-5">
      <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg flex items-start gap-3 text-xs text-rose-300 leading-relaxed">
        <Trash size={16} className="mt-0.5 shrink-0" />
        <p>This tool places a solid box to cover and visually redact areas from the document.</p>
      </div>

      <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/50 space-y-3 shadow-sm">
        <label className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <Palette size={14} /> Redaction Color
        </label>
        
        <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-md border border-slate-700 hover:border-slate-600 transition-colors">
          <input 
            type="color" 
            value={defaultOptions.bgColor || '#ffffff'}
            onChange={(e) => setDefaultOptions({ ...defaultOptions, bgColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">Box Color</span>
            <span className="text-[10px] text-slate-400">Usually white to match paper</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setPlacementMode(!placementMode)}
        className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${
          placementMode 
            ? 'bg-rose-600 text-white ring-1 ring-rose-400' 
            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-slate-600'
        }`}
      >
        <MousePointer2 size={16} />
        {placementMode ? 'Click on PDF to Redact' : 'Pick & Redact Area'}
      </button>
    </div>
  );

  const renderHighlight = () => (
    <div className="space-y-5">
      <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-lg flex items-start gap-3 text-xs text-amber-300 leading-relaxed">
        <MousePointer2 size={16} className="mt-0.5 shrink-0" />
        <p>Simply select text directly on the document with your cursor to highlight it instantly.</p>
      </div>
      
      <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/50 space-y-4 shadow-sm">
        <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Palette size={14} /> Style Settings
        </label>
        
        <div className="space-y-2.5">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Color</span>
          <div className="flex items-center gap-2.5">
            {['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#d946ef'].map(color => (
              <button
                key={color}
                className={`w-7 h-7 rounded-full border-2 transition-all ${defaultOptions.color === color ? 'border-white scale-110 shadow-sm ring-1 ring-offset-1 ring-offset-slate-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                style={{ backgroundColor: color, '--tw-ring-color': color }}
                onClick={() => setDefaultOptions({ ...defaultOptions, color })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={12} /> Opacity
            </span>
            <span className="text-xs text-slate-300">{Math.round((defaultOptions.opacity || 0.3) * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.1" 
            value={defaultOptions.opacity || 0.3}
            onChange={(e) => setDefaultOptions({ ...defaultOptions, opacity: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );

  const AddImageControls = () => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      setLocalError(null);
      try {
        const formData = new FormData();
        formData.append('document', file);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SESSION}/upload-temp`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        
        const objectUrl = URL.createObjectURL(file);

        setDefaultOptions({ 
          ...defaultOptions,
          imagePath: data.path,
          originalName: data.filename,
          previewUrl: objectUrl
        });
        
        setPlacementMode(true);
      } catch (err) {
        setLocalError(err.message);
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-5">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg" 
          onChange={handleFileChange}
        />
        
        <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/50 space-y-3 shadow-sm">
          <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={14} /> Image Source
          </label>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-5 bg-slate-900/60 border border-slate-700 border-dashed hover:bg-slate-800 hover:border-emerald-500/50 rounded-lg text-slate-300 transition-all flex flex-col items-center justify-center gap-2"
          >
            {uploading ? (
              <span className="text-emerald-400 flex items-center gap-2 text-sm font-medium">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <>
                <Upload size={18} className="text-slate-400" />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium">{defaultOptions.imagePath ? 'Change Image' : 'Select Image'}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG up to 10MB</span>
                </div>
              </>
            )}
          </button>
        </div>

        {defaultOptions.imagePath && (
          <div className="bg-slate-800/40 rounded-lg p-3.5 border border-slate-700/50 space-y-3.5 shadow-sm">
            <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Settings2 size={14} /> Image Settings
            </label>
            
            <div className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-700 p-2 rounded-md text-slate-300 text-xs">
              <img src={defaultOptions.previewUrl} alt="Preview" className="w-7 h-7 object-cover rounded shadow-sm bg-black/20" />
              <span className="truncate font-medium flex-1 text-slate-200">{defaultOptions.originalName}</span>
              <Check size={14} className="text-emerald-500" />
            </div>

            <div className="space-y-2 pt-1.5 border-t border-slate-700/50">
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={12} /> Opacity
                </span>
                <span className="text-xs text-slate-300">{Math.round((defaultOptions.opacity || 1) * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.1" 
                value={defaultOptions.opacity || 1}
                onChange={(e) => setDefaultOptions({ ...defaultOptions, opacity: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setPlacementMode(!placementMode)}
              className={`w-full mt-3 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${
                placementMode 
                  ? 'bg-emerald-600 text-white ring-1 ring-emerald-400' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <MousePointer2 size={16} />
              {placementMode ? 'Click on PDF to Place' : 'Pick & Place Image'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-l border-slate-800 w-80 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 shrink-0 bg-slate-800/10">
        <div className="flex items-center gap-2.5 text-slate-200">
          <div className="text-indigo-400">
            {tool.icon && <tool.icon size={18} />}
          </div>
          <h3 className="font-semibold text-sm tracking-wide">{tool.title}</h3>
        </div>
        <button 
          onClick={() => {
            clearOverlays();
            onClose();
          }} 
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800"
        >
          ×
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/50">
        {tool.id === 'add-text' && renderAddText()}
        {tool.id === 'delete-text' && renderDeleteText()}
        {tool.id === 'highlight' && renderHighlight()}
        {tool.id === 'add-image' && <AddImageControls />}
        
        {(localError || workflowError) && (
          <div className="mt-4 p-3 border-l-2 border-rose-500 bg-rose-500/10 text-rose-300 text-xs rounded-r-md">
            {localError || workflowError}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-800 p-4 bg-slate-900/95 space-y-3.5 shadow-lg relative z-10">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 uppercase tracking-wider">
          <span>Pending Edits</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">{overlays.length}</span>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={clearOverlays}
            disabled={overlays.length === 0 || isExecuting}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 disabled:text-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700 disabled:border-transparent"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            disabled={overlays.length === 0 || isExecuting}
            className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-indigo-400/50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isExecuting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Applying...
              </>
            ) : (
              'Apply Edits'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditContentPanel;
