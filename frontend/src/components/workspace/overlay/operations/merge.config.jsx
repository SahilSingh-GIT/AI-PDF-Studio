import React from 'react';
import { sessionService } from '../../../../services/sessionService.js';

export const mergeConfig = {
  id: 'merge-pdfs',
  title: 'Merge PDFs',
  hideGrid: true, 

  getApplyButtonText: (selectedPages, payload) => 
    payload.documents?.length > 0 ? `Merge ${payload.documents.length + 1} Documents` : 'Select Documents',

  isValid: (selectedPages, payload) => payload.documents?.length > 0,

  renderControls: ({ payload, setPayload }) => {
    const onFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setPayload({ ...payload, uploading: true });
      try {
        const result = await sessionService.uploadTempDocument(file);
        if (result.success && result.path) {
           const docs = payload.documents || [];
           const names = payload.documentNames || [];
           setPayload({ 
             ...payload, 
             documents: [...docs, result.path],
             documentNames: [...names, result.filename || file.name],
             uploading: false
           });
        }
      } catch (err) {
        alert("Failed to upload file: " + err.message);
        setPayload({ ...payload, uploading: false });
      }
      e.target.value = '';
    };

    const location = payload.location || 'After Last Page';

    return (
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </div>
        
        <div className="text-center mb-2 max-w-md">
          <h3 className="text-xl font-bold text-slate-200 mb-2">Merge Documents</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Combine multiple PDF files into one. Upload the documents you want to merge and choose where to insert them.
          </p>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-4">
          <label className={`w-full py-4 px-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center cursor-pointer text-indigo-400 hover:bg-slate-700/50 hover:border-indigo-500/50 transition-all ${payload.uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="font-medium text-sm">{payload.uploading ? "Uploading..." : "+ Upload PDF to Merge"}</div>
            <input 
              type="file" 
              className="hidden" 
              accept="application/pdf"
              onChange={onFileChange} 
            />
          </label>
          
          {payload.documents?.length > 0 && (
            <div className="w-full p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Ready to merge</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                {payload.documents.map((d, i) => (
                  <li key={i} className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded border border-slate-700/50">
                    <span className="truncate max-w-[200px]" title={d}>
                      {payload.documentNames ? payload.documentNames[i] : "Document"}
                    </span>
                    <button 
                      className="text-rose-400 hover:text-rose-300 ml-4 p-1"
                      onClick={() => {
                        const newDocs = payload.documents.filter((_, idx) => idx !== i);
                        const newNames = payload.documentNames ? payload.documentNames.filter((_, idx) => idx !== i) : [];
                        setPayload({ ...payload, documents: newDocs, documentNames: newNames });
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium text-slate-300">Insertion Location</label>
            <select 
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all text-sm w-full"
              value={location}
              onChange={(e) => setPayload({ ...payload, location: e.target.value })}
            >
              <option value="Before First Page">Before First Page</option>
              <option value="After Last Page">After Last Page</option>
            </select>
          </div>
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    documents: payload.documents || [],
    location: payload.location || 'After Last Page'
  })
};

export default mergeConfig;
