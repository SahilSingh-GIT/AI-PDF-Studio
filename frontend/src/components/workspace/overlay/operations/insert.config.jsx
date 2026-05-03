import React from 'react';

export const insertConfig = {
  id: 'insert-blank-page',
  title: 'Insert Blank Page',
  supportsSelection: true,
  supportsDrag: false,
  
  getApplyButtonText: (selectedPages) => {
    if (selectedPages.length === 0) return 'Select Target Page';
    return `Insert Blank Page`;
  },
    
  isValid: (selectedPages, payload) => selectedPages.length === 1,

  renderControls: ({ selectedPages, payload, setPayload }) => {
    // Default payload for insert
    if (payload.position === undefined) {
      setPayload({ 
        position: 'after', 
        size: 'match' // 'match', 'a4', 'letter'
      });
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border-b border-white/5 w-full gap-4">
        <div className="flex gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</label>
            <select
              value={payload.position}
              onChange={(e) => setPayload({ ...payload, position: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="after">After Selected Page</option>
              <option value="before">Before Selected Page</option>
              <option value="beginning">At Beginning</option>
              <option value="end">At End</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Size</label>
            <select
              value={payload.size}
              onChange={(e) => setPayload({ ...payload, size: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="match">Match Target Page</option>
              <option value="a4">A4 (210 x 297 mm)</option>
              <option value="letter">Letter (8.5 x 11 in)</option>
            </select>
          </div>
        </div>
      </div>
    );
  },

  renderPreview: ({ selectedPages, payload, totalPages }) => {
    if (selectedPages.length !== 1) {
      return (
        <div className="p-4 bg-[#0a0f1c] text-center border-b border-white/5 text-amber-400 text-sm">
          Please select exactly one target page.
        </div>
      );
    }
    
    const target = selectedPages[0];
    let insertIndex = target; // defaults to 'after', so index is target
    if (payload.position === 'before') insertIndex = target - 1;
    if (payload.position === 'beginning') insertIndex = 0;
    if (payload.position === 'end') insertIndex = totalPages;

    return (
      <div className="p-4 bg-[#0a0f1c] text-center border-b border-white/5">
        <span className="text-xs text-slate-400">Preview:</span>
        <div className="mt-1 text-sm font-medium text-emerald-400">
          Inserting 1 blank page at position {insertIndex + 1} (between page {insertIndex === 0 ? 'Start' : insertIndex} and {insertIndex === totalPages ? 'End' : insertIndex + 1}).
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    targetPage: selectedPages[0],
    position: payload.position,
    size: payload.size
  })
};

export default insertConfig;
