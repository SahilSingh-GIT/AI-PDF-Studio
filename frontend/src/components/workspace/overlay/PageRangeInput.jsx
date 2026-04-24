/**
 * components/workspace/overlay/PageRangeInput.jsx
 * 
 * Generic text input for entering page ranges (e.g. "1-3, 5").
 * Stays synchronized with the visual `selectedPages` state.
 */
import React, { useState, useEffect } from 'react';
import { PageRangeParser } from '../../../utils/PageRangeParser.js';

const PageRangeInput = ({ selectedPages, setSelection, totalPages }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);

  // Sync external visual selection changes back to the text input
  useEffect(() => {
    try {
      const parsedInput = PageRangeParser.parse(inputValue, totalPages);
      // If the external selection is functionally identical to what's already typed (even if formatted differently), don't overwrite the input
      if (JSON.stringify(parsedInput) === JSON.stringify(selectedPages)) {
        return;
      }
    } catch (e) {
      // Input is invalid, so if external selection changed, we should overwrite
    }
    
    setInputValue(PageRangeParser.stringify(selectedPages));
    setError(null);
  }, [selectedPages, totalPages]); // Do not add inputValue to dependencies to avoid infinite loops

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.trim() === '') {
      setError(null);
      setSelection([]);
      return;
    }

    try {
      const newSelection = PageRangeParser.parse(val, totalPages);
      setError(null);
      setSelection(newSelection);
    } catch (err) {
      // Don't show error immediately while typing incomplete ranges like "1-"
      if (val.endsWith('-') || val.endsWith(',')) {
        setError(null);
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-sm">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Selected Pages
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="e.g. 1-3, 5, 8-10"
        className={`w-full bg-slate-800/80 border ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-indigo-500'} text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-transparent focus:ring-1 transition-all`}
      />
      {error ? (
        <span className="text-[10px] text-rose-400">{error}</span>
      ) : (
        <span className="text-[10px] text-slate-500">Supports ranges (1-5) and specific pages (2, 4)</span>
      )}
    </div>
  );
};

export default PageRangeInput;
