import React, { useState } from 'react';
import { FileText, Copy, Loader2, Sparkles, LayoutList } from 'lucide-react';
import { aiService } from '../../../../services/ai/aiService.js';
import { useSession } from '../../../../context/SessionContext.jsx';

const SummaryPanel = () => {
  const { session } = useSession();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await aiService.getSummary(session?._id);
      setSummaryData(data);
    } catch (error) {
      console.error("Summary error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const text = `${summaryData.overview}\n\nKey Takeaways:\n${summaryData.keyTakeaways.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Analyzing document...</p>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
          <FileText size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">Document Summary</h3>
        <p className="text-sm text-slate-400 mb-4">
          Generate a comprehensive summary of this document, including key takeaways and main topics.
        </p>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Sparkles size={16} />
          <span>Click Generate Summary</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Overview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <LayoutList size={14} className="text-indigo-400" />
            Overview
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            {summaryData.overview}
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <FileText size={14} className="text-indigo-400" />
            Detailed Summary
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            {summaryData.summary}
          </p>
        </div>

        {/* Main Topics */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Main Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {summaryData.mainTopics.map((topic, idx) => (
              <span key={idx} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/20">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Key Takeaways
          </h3>
          <ul className="space-y-2">
            {summaryData.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Bar */}
      <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700"
        >
          <Copy size={14} className={copied ? "text-emerald-400" : ""} />
          <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
        </button>
      </div>
    </div>
  );
};

export default SummaryPanel;
