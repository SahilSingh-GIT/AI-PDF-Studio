import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const deleteConfig = {
  id: 'delete-pages',
  title: 'Delete Pages',
  supportsSelection: true,
  supportsDrag: false,
  
  getApplyButtonText: (selectedPages) => 
    selectedPages.length > 0 ? `Delete ${selectedPages.length} Pages` : 'Select Pages to Delete',
    
  isValid: (selectedPages, payload, totalPages) => 
    selectedPages.length > 0 && selectedPages.length < totalPages, // Cannot delete all pages

  renderControls: ({ selectedPages, totalPages }) => {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border-b border-white/5">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Delete Confirmation</h3>
        
        {selectedPages.length === 0 ? (
          <p className="text-sm text-slate-500">Select one or more pages from the grid below to delete.</p>
        ) : selectedPages.length === totalPages ? (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">You cannot delete all pages in a document.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-lg">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">
              Warning: This action will permanently remove {selectedPages.length} selected {selectedPages.length === 1 ? 'page' : 'pages'}.
            </span>
          </div>
        )}
      </div>
    );
  },

  formatPayload: (selectedPages) => ({
    pages: selectedPages
  })
};

export default deleteConfig;
