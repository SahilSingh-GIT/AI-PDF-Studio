import React from 'react';
import { useIntelligence } from '../../../context/IntelligenceContext.jsx';
import { useSession } from '../../../context/SessionContext.jsx';
import { useDocumentIndex } from '../../../context/DocumentContext.jsx';
import { Info, FileText, Lock, Shield, FileQuestion, Calendar } from 'lucide-react';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-2 border-b border-slate-800/50 last:border-0">
    <span className="text-slate-400 text-xs font-medium">{label}</span>
    <span className="text-slate-200 text-xs text-right break-words max-w-[60%]">{value || 'N/A'}</span>
  </div>
);

const InfoPanel = ({ onClose }) => {
  const { report } = useIntelligence();
  const { document: doc, session } = useSession();
  const { pdfDoc } = useDocumentIndex();

  const analysis = report?.analysis || {};
  
  // Dynamically determine encryption state by combining base intelligence and recent operations
  const isDocumentEncrypted = React.useMemo(() => {
    let encrypted = analysis.isEncrypted || false;
    
    if (session?.workflowHistory && session.workflowHistory.length > 0) {
      const history = [...session.workflowHistory].reverse();
      for (const op of history) {
        if (op.operation === 'password-protection') return true;
        if (op.operation === 'remove-security') return false;
      }
    }
    
    return encrypted;
  }, [analysis.isEncrypted, session]);

  const metadata = {
    title: analysis.title || doc?.name,
    author: analysis.author,
    subject: analysis.subject,
    creator: analysis.creator,
    producer: analysis.producer,
    createdAt: analysis.creationDate ? new Date(analysis.creationDate).toLocaleString() : null,
    modifiedAt: analysis.modificationDate ? new Date(analysis.modificationDate).toLocaleString() : null,
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-l border-slate-800 w-80 shadow-2xl animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-indigo-400" />
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide">Document Info</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* Document Analysis / AI Readiness */}
        <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3 text-amber-400">
            <Shield size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Document Analysis</span>
          </div>
          <div className="space-y-3">
            {analysis.isImageOnly ? (
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded flex flex-col gap-1">
                <span className="text-amber-400 text-xs font-semibold">⚠ Scanned PDF</span>
                <span className="text-slate-400 text-xs">Text is not searchable</span>
                <span className="text-slate-400 text-xs">AI features limited</span>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded flex flex-col gap-1">
                <span className="text-emerald-400 text-xs font-semibold">✓ Digital PDF</span>
                <span className="text-slate-300 text-xs">
                  {report?.intelligence?.capabilities?.Search?.available ? '✓ Search Ready' : '⚠ Search Unavailable'}
                </span>
                <span className="text-slate-300 text-xs">
                  {report?.intelligence?.capabilities?.AIChat?.available ? '✓ AI Ready' : '⚠ AI Unavailable'}
                </span>
                {analysis.wordCount !== undefined && (
                  <span className="text-slate-400 text-[10px] mt-1 pt-1 border-t border-emerald-500/20">
                    {analysis.wordCount.toLocaleString()} words detected
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Overview Card */}
        <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3 text-indigo-300">
            <FileText size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Overview</span>
          </div>
          <div className="space-y-1">
            <InfoRow label="File Name" value={doc?.originalName} />
            <InfoRow label="Type" value={doc?.extension?.toUpperCase() || 'PDF'} />
            <InfoRow label="Size" value={formatBytes(doc?.size || analysis.fileSize)} />
            <InfoRow label="Pages" value={pdfDoc?.numPages || analysis.totalPages} />
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3 text-rose-400">
            <Shield size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Security</span>
          </div>
          <div className="space-y-1">
            <InfoRow label="Encrypted" value={isDocumentEncrypted ? 'Yes' : 'No'} />
            <InfoRow label="Printing" value="Allowed" />
            <InfoRow label="Copying" value="Allowed" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoPanel;
