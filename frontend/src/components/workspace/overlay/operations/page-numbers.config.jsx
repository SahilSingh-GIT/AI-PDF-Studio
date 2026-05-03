import React from 'react';
import PageRangeInput from '../PageRangeInput.jsx';

export const pageNumbersConfig = {
  id: 'page-numbers',
  title: 'Page Numbers',
  supportsSelection: true,
  supportsDrag: false,
  
  getApplyButtonText: (selectedPages) => 
    selectedPages.length > 0 ? `Apply to ${selectedPages.length} Pages` : 'Select Pages',
    
  isValid: (selectedPages, payload) => selectedPages.length > 0,

  renderControls: ({ selectedPages, setSelection, totalPages, payload, setPayload }) => {
    if (payload.position === undefined) {
      setPayload({
        position: 'bottom-center',
        format: 'current', // 'current' or 'total'
        startPage: 1, // which index in selectedPages corresponds to startNumber
        startNumber: 1, // the number to print
        fontSize: 12
      });
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border-b border-white/5 w-full gap-4">
        <PageRangeInput 
          selectedPages={selectedPages} 
          setSelection={setSelection} 
          totalPages={totalPages} 
        />
        <div className="flex flex-wrap justify-center gap-6 mt-2">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</label>
            <select
              value={payload.position}
              onChange={(e) => setPayload({ ...payload, position: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Format</label>
            <select
              value={payload.format}
              onChange={(e) => setPayload({ ...payload, format: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="current">1, 2, 3</option>
              <option value="total">1 / {totalPages}</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start At</label>
            <input
              type="number"
              min="1"
              value={payload.startNumber}
              onChange={(e) => setPayload({ ...payload, startNumber: parseInt(e.target.value, 10) || 1 })}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 w-20"
            />
          </div>

        </div>
      </div>
    );
  },

  renderPreview: ({ payload, totalPages }) => {
    let previewText = payload.format === 'total' 
      ? `${payload.startNumber} / ${totalPages}`
      : `${payload.startNumber}`;

    const getPositionStyle = () => {
      switch (payload.position) {
        case 'top-left': return 'items-start justify-start';
        case 'top-center': return 'items-start justify-center';
        case 'top-right': return 'items-start justify-end';
        case 'bottom-left': return 'items-end justify-start';
        case 'bottom-center': return 'items-end justify-center';
        case 'bottom-right': return 'items-end justify-end';
        default: return 'items-end justify-center';
      }
    };

    return (
      <div className="p-4 bg-[#0a0f1c] border-b border-white/5 flex flex-col items-center">
        <span className="text-xs text-slate-400 mb-2">Placement Preview:</span>
        <div className={`w-32 h-40 bg-white rounded shadow-sm border border-slate-300 relative p-2 flex ${getPositionStyle()}`}>
          <span className="text-slate-800 font-serif" style={{ fontSize: '10px' }}>{previewText}</span>
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    pages: selectedPages,
    position: payload.position,
    format: payload.format,
    startNumber: payload.startNumber,
    fontSize: payload.fontSize
  })
};

export default pageNumbersConfig;
