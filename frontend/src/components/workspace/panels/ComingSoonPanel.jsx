import React from 'react';
import { Hammer } from 'lucide-react';

const ComingSoonPanel = ({ tool }) => {
  if (!tool) return null;

  const Icon = tool.icon || Hammer;

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        <Icon size={16} className="text-indigo-400" />
        <span className="text-sm font-semibold text-slate-200">
          {tool.title}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
          <Icon size={32} className="text-indigo-400 opacity-80" />
        </div>
        
        <h3 className="text-base font-semibold text-slate-200 mb-2">
          Under Development
        </h3>
        
        <p className="text-sm text-slate-400 leading-relaxed max-w-[200px] mb-8">
          This feature is currently being built and will be available in a future milestone.
        </p>

        <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300 uppercase tracking-wider">
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPanel;
