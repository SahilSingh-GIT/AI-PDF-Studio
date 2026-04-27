import React, { useState } from 'react';
import { Search, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { aiService } from '../../../../services/ai/aiService.js';
import { useSession } from '../../../../context/SessionContext.jsx';
import { useWorkflow } from '../../../../context/WorkflowContext.jsx';

const SemanticSearchPanel = () => {
  const { session } = useSession();
  const { goToPage } = useWorkflow();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await aiService.semanticSearch(query.trim(), session?._id);
      // Just take top 5 for simplicity as requested
      setResults(data.results.slice(0, 5));
    } catch (error) {
      console.error("Semantic Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const jumpToPage = (pageNum) => {
    goToPage(pageNum);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Input Area */}
      <div className="shrink-0 p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Semantic search..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Searching document...</p>
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Search size={20} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium">Search anything inside your document.</p>
            <p className="text-xs text-slate-600">Find concepts, definitions, and related topics.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Top Results
            </h3>
            {results.map((result, idx) => (
              <div key={idx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors group">
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  {result.snippet}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    Page {result.page}
                  </span>
                  <button
                    onClick={() => jumpToPage(result.page)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Jump</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
            <p className="text-sm font-medium">No semantic matches found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemanticSearchPanel;
