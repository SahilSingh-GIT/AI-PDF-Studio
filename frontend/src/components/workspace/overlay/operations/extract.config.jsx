import React from 'react';
import PageRangeInput from '../PageRangeInput.jsx';

export const extractConfig = {
  id: 'extract-pages',
  title: 'Extract Pages',
  supportsSelection: true,
  supportsDrag: false,
  
  getApplyButtonText: (selectedPages) => 
    selectedPages.length > 0 ? `Extract ${selectedPages.length} Pages` : 'Select Pages to Extract',
    
  isValid: (selectedPages, payload) => selectedPages.length > 0,

  renderControls: ({ selectedPages, setSelection, totalPages, payload, setPayload }) => {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border-b border-white/5 w-full gap-4">
        <PageRangeInput 
          selectedPages={selectedPages} 
          setSelection={setSelection} 
          totalPages={totalPages} 
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="deleteAfterExtract"
            checked={!!payload.deleteAfterExtract}
            onChange={(e) => setPayload({ ...payload, deleteAfterExtract: e.target.checked })}
            className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
          />
          <label htmlFor="deleteAfterExtract" className="text-sm font-medium text-slate-300">
            Delete extracted pages from original document
          </label>
        </div>
      </div>
    );
  },

  renderPreview: ({ selectedPages }) => {
    if (selectedPages.length === 0) return null;
    return (
      <div className="p-4 bg-[#0a0f1c] text-center border-b border-white/5">
        <span className="text-xs text-slate-400">Selected Pages to Extract:</span>
        <div className="mt-1 text-sm font-medium text-indigo-300">
          {selectedPages.join(', ')}
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    pages: selectedPages,
    deleteAfterExtract: !!payload.deleteAfterExtract
  })
};

export default extractConfig;
