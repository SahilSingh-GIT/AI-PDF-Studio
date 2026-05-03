import React from 'react';

export const splitConfig = {
  id: 'split-pdf',
  title: 'Split PDF',
  hideGrid: true, 

  getApplyButtonText: (selectedPages, payload) => 
    payload.rangesStr ? 'Split Document' : 'Enter Ranges',

  isValid: (selectedPages, payload) => !!payload.rangesStr,

  renderControls: ({ payload, setPayload }) => {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        
        <div className="text-center mb-2 max-w-md">
          <h3 className="text-xl font-bold text-slate-200 mb-2">Extract & Split</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Separate pages into multiple files. Provide page ranges separated by commas. If multiple ranges are given, they will be downloaded as a ZIP file.
          </p>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-2">
          <label className="text-sm font-medium text-slate-300">Page Ranges</label>
          <input 
            type="text"
            value={payload.rangesStr || ''}
            onChange={(e) => setPayload({ ...payload, rangesStr: e.target.value })}
            placeholder="e.g. 1-5, 8, 11-13"
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white font-mono focus:outline-none focus:border-teal-500 focus:bg-slate-800 transition-all placeholder:text-slate-500 text-sm"
          />
          <span className="text-xs text-slate-500 mt-1 block">
            Example: "1-5" creates one PDF. "1-5, 6-10" creates a ZIP with two PDFs.
          </span>
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => {
    const ranges = (payload.rangesStr || '').split(',').map(s => s.trim()).filter(Boolean);
    return { ranges };
  }
};

export default splitConfig;
