/**
 * components/workspace/panels/SearchPanel.jsx
 *
 * Dedicated sidebar panel for text search.
 * Uses DocumentContext (Document Index Service) to search text instantly
 * and display snippets.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDocumentIndex } from '../../../context/DocumentContext.jsx';
import { useWorkflow } from '../../../context/WorkflowContext.jsx';
import { useIntelligence } from '../../../context/IntelligenceContext.jsx';
import { Search, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SearchPanel = ({ tool, onClose }) => {
  const { 
    isIndexing, 
    indexProgress, 
    search, 
    searchQuery, 
    activeMatches, 
    currentMatchIndex, 
    nextMatch, 
    prevMatch, 
    goToMatch 
  } = useDocumentIndex();
  
  const { goToPage } = useWorkflow();
  const { report } = useIntelligence();
  
  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceRef = useRef(null);

  // Sync input value with context if it changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search(val);
    }, 300);
  };

  const handleClear = () => {
    setInputValue('');
    search('');
  };

  const handleResultClick = (index, pageNum) => {
    goToMatch(index);
    goToPage(pageNum);
  };

  const currentMatch = activeMatches[currentMatchIndex];
  const isImageOnly = report?.analysis?.isImageOnly;

  return (
    <div className="flex flex-col h-full bg-slate-900/50 relative">
      {/* Header */}
      <div className="flex flex-col px-4 py-3 border-b border-white/10 shrink-0 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">
              {tool.title}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800">
            ×
          </button>
        </div>

        {/* Search Input or Warning */}
        {isImageOnly ? (
          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
            <p className="text-amber-400 text-xs text-center font-medium">This document contains no searchable text.</p>
          </div>
        ) : (
          <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search document..."
            className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
        )}

        {/* Navigation & Count */}
        {activeMatches.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {currentMatchIndex + 1} of {activeMatches.length} matches
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevMatch}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
                title="Previous Match"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={nextMatch}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
                title="Next Match"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Indexing State */}
      {isIndexing && !isImageOnly && (
        <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm p-6 text-center">
          <Loader2 className="animate-spin text-indigo-500 mb-3" size={24} />
          <p className="text-sm font-medium text-slate-200 mb-1">Indexing Document...</p>
          <p className="text-xs text-slate-400 mb-3">Analyzing text for instant search</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${indexProgress}%` }} />
          </div>
          <span className="text-[10px] text-slate-500">{indexProgress}%</span>
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        {!isIndexing && inputValue && activeMatches.length === 0 && !isImageOnly && (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-sm text-slate-400">No matches found.</p>
          </div>
        )}

        {!isIndexing && !inputValue && !isImageOnly && (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-xs text-slate-500">Enter text to search the document.</p>
          </div>
        )}

        {!isIndexing && activeMatches.length > 0 && !isImageOnly && (
          <div className="flex flex-col">
            {activeMatches.map((match, index) => {
              const isActive = index === currentMatchIndex;
              return (
                <button
                  key={match.id}
                  onClick={() => handleResultClick(index, match.page)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors
                    ${isActive ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-slate-800/50 border-l-2 border-l-transparent'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                      Page {match.page}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {/* Highlight the exact match word in the snippet */}
                    {(() => {
                      const lowerText = match.text.toLowerCase();
                      const lowerQuery = searchQuery.toLowerCase();
                      const matchIdx = lowerText.indexOf(lowerQuery);
                      if (matchIdx === -1) return match.text;
                      
                      const before = match.text.substring(0, matchIdx);
                      const matchedStr = match.text.substring(matchIdx, matchIdx + searchQuery.length);
                      const after = match.text.substring(matchIdx + searchQuery.length);
                      
                      return (
                        <>
                          {before}
                          <mark className={`${isActive ? 'bg-indigo-500/40 text-indigo-100' : 'bg-yellow-500/30 text-yellow-100'} rounded-[1px] px-0.5`}>
                            {matchedStr}
                          </mark>
                          {after}
                        </>
                      );
                    })()}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
