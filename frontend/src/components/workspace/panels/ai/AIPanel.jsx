import React, { useState, useEffect } from 'react';
import { Sparkles, X, AlertCircle } from 'lucide-react';
import ChatPanel from './ChatPanel.jsx';
import SummaryPanel from './SummaryPanel.jsx';
import KeyInsightsPanel from './KeyInsightsPanel.jsx';
import TranslatePanel from './TranslatePanel.jsx';
import SemanticSearchPanel from './SemanticSearchPanel.jsx';
import { useSession } from '../../../../context/SessionContext.jsx';
import { useIntelligence } from '../../../../context/IntelligenceContext.jsx';
import { aiService } from '../../../../services/ai/aiService.js';

const AIPanel = ({ tool, onClose }) => {
  const { session } = useSession();
  const { report } = useIntelligence();
  const [aiStatus, setAiStatus] = useState('NOT_PREPARED'); // NOT_PREPARED, PREPARING, READY, FAILED

  // Document readability check
  const isImageOnly = report?.analysis?.isImageOnly === true;

  useEffect(() => {
    let interval;

    const checkStatus = async () => {
      if (!session?._id) return;
      try {
        let res = await aiService.getStatus(session._id);
        
        if (res.status === 'NOT_PREPARED') {
          // Warm up the AI immediately for a better UX
          res = await aiService.prepare(session._id);
        }
        
        setAiStatus(res.status);

        if (res.status === 'PREPARING') {
          // Poll every 2 seconds if still preparing
          interval = setTimeout(checkStatus, 2000);
        }
      } catch (err) {
        setAiStatus('FAILED');
      }
    };

    if (!isImageOnly && session?._id) {
      checkStatus();
    }

    return () => clearTimeout(interval);
  }, [session?._id, isImageOnly]);

  if (!tool) return null;

  // Renders the correct panel
  const renderContent = () => {
    switch (tool.id) {
      case 'ai-chat': return <ChatPanel />;
      case 'ai-summarize': return <SummaryPanel />;
      case 'ai-key-insights': return <KeyInsightsPanel />;
      case 'ai-translate': return <TranslatePanel />;
      case 'ai-semantic-search': return <SemanticSearchPanel />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-6">
            <Sparkles size={32} className="mb-4 opacity-50" />
            <h3 className="text-sm font-medium mb-2">Select an AI Tool</h3>
            <p className="text-xs">Choose an AI feature from the sidebar to get started.</p>
          </div>
        );
    }
  };

  const renderStatusBadge = () => {
    if (isImageOnly) return null;

    switch (aiStatus) {
      case 'READY':
        return (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Ready
          </div>
        );
      case 'PREPARING':
        return (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
            <div className="w-3 h-3 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            Preparing AI...
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            AI Error
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Initializing...
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#161616] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-[#333333] bg-[#1c1c1c]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#2a2a2a] border border-[#444444] flex items-center justify-center text-gray-200 relative">
            {tool.icon ? React.createElement(tool.icon, { size: 16 }) : <Sparkles size={16} />}
          </div>
          <h2 className="font-semibold text-gray-200 text-sm">{tool.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {renderStatusBadge()}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#262626] rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Dynamic Panel Content */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {isImageOnly ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center p-6 space-y-4">
            <AlertCircle size={48} className="text-amber-500 opacity-80" />
            <h3 className="text-lg font-medium text-gray-300">AI Not Available</h3>
            <p className="text-sm max-w-xs">
              This document appears to be a scanned image or doesn't contain readable text. 
              AI features require searchable text to function.
            </p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default AIPanel;

