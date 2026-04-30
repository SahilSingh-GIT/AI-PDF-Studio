import React from 'react';
import PageRangeInput from '../PageRangeInput.jsx';

export const duplicateConfig = {
  id: 'duplicate-pages',
  title: 'Duplicate Pages',
  supportsSelection: true,
  supportsDrag: false,
  
  getApplyButtonText: (selectedPages) => 
    selectedPages.length > 0 ? `Duplicate ${selectedPages.length} Pages` : 'Select Pages to Duplicate',
    
  isValid: (selectedPages, payload) => selectedPages.length > 0 && payload.count >= 1,

  renderControls: ({ selectedPages, setSelection, totalPages, payload, setPayload }) => {
    if (payload.position === undefined) {
      setPayload({
        position: 'after',
        count: 1
      });
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border-b border-white/5 w-full gap-4">
        <PageRangeInput 
          selectedPages={selectedPages} 
          setSelection={setSelection} 
          totalPages={totalPages} 
        />
        <div className="flex gap-8 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Insert Position</label>
            <select
              value={payload.position}
              onChange={(e) => setPayload({ ...payload, position: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="after">After Original</option>
              <option value="end">At End of Document</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duplicate Count</label>
            <input
              type="number"
              min="1"
              max="10"
              value={payload.count}
              onChange={(e) => setPayload({ ...payload, count: parseInt(e.target.value, 10) || 1 })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 w-24"
            />
          </div>
        </div>
      </div>
    );
  },

  renderPreview: ({ selectedPages, payload }) => {
    if (selectedPages.length === 0) return null;
    return (
      <div className="p-4 bg-[#0a0f1c] text-center border-b border-white/5">
        <span className="text-xs text-slate-400">Preview:</span>
        <div className="mt-1 text-sm font-medium text-emerald-400">
          Duplicating {selectedPages.length} pages ({payload.count}x). They will be inserted {payload.position === 'after' ? 'immediately after their originals' : 'at the end of the document'}.
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    pages: selectedPages,
    position: payload.position,
    count: payload.count
  })
};

export default duplicateConfig;
