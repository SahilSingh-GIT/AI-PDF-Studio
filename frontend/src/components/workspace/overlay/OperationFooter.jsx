import React from 'react';

/**
 * OperationFooter.jsx
 * 
 * Generic footer for the Page Operation Overlay.
 * Contains no operation-specific logic (no if rotate/delete/etc).
 */
const OperationFooter = ({ 
  onCancel, 
  onApply, 
  applyButtonText, 
  isDisabled, 
  isExecuting 
}) => {
  return (
    <footer className="shrink-0 h-16 flex items-center justify-end px-6 gap-4 border-t border-[#333333] bg-[#222222]">
      <button
        onClick={onCancel}
        disabled={isExecuting}
        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      
      <button
        onClick={onApply}
        disabled={isDisabled || isExecuting}
        className={`relative px-6 py-2 rounded text-sm font-semibold transition-all ${
          isDisabled || isExecuting
            ? 'bg-[#1c1c1c] border border-[#333333] text-gray-500 cursor-not-allowed'
            : 'bg-[#333333] hover:bg-[#444444] text-white border border-[#555555]'
        }`}
      >
        {isExecuting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Executing...
          </span>
        ) : (
          applyButtonText || 'Apply'
        )}
      </button>
    </footer>
  );
};

export default OperationFooter;

