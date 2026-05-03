import React from 'react';

export const watermarkConfig = {
  id: 'watermark',
  title: 'Watermark PDF',
  hideGrid: true, // Applies to all pages

  getApplyButtonText: (selectedPages, payload) => 'Apply Watermark',

  isValid: (selectedPages, payload) => !!payload.text,

  renderControls: ({ payload, setPayload }) => {
    if (payload.text === undefined) {
      setTimeout(() => setPayload({ ...payload, text: '', opacity: 0.5, fontSize: 48 }), 0);
    }
    
    return (
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C12 2 5 9.5 5 14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14C19 9.5 12 2 12 2Z" />
          </svg>
        </div>
        
        <div className="text-center mb-2 max-w-md">
          <h3 className="text-xl font-bold text-slate-200 mb-2">Apply Watermark</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Stamp every page of the document with diagonal text to indicate status or ownership (e.g. DRAFT, CONFIDENTIAL).
          </p>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-4">
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-medium text-slate-300">Watermark Text</label>
            <input 
              type="text"
              value={payload.text || ''}
              onChange={(e) => setPayload({ ...payload, text: e.target.value })}
              placeholder="e.g. CONFIDENTIAL"
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:bg-slate-800 transition-all placeholder:text-slate-500 text-sm"
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-medium text-slate-300">Font Size</label>
            <input 
              type="number"
              value={payload.fontSize || 48}
              onChange={(e) => setPayload({ ...payload, fontSize: e.target.value })}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:bg-slate-800 transition-all placeholder:text-slate-500 text-sm"
            />
          </div>
          
          <div className="flex flex-col w-full gap-2 mt-1">
            <label className="text-sm font-medium text-slate-300 flex justify-between">
              <span>Opacity</span>
              <span>{Math.round((payload.opacity || 0.5) * 100)}%</span>
            </label>
            <input 
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={payload.opacity || 0.5}
              onChange={(e) => setPayload({ ...payload, opacity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    text: payload.text || '',
    fontSize: payload.fontSize || 48,
    opacity: payload.opacity || 0.5
  })
};

export default watermarkConfig;
