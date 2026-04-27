import React, { useState } from 'react';
import { Type, Copy, Loader2, Sparkles, Globe } from 'lucide-react';
import { aiService } from '../../../../services/ai/aiService.js';
import { useSession } from '../../../../context/SessionContext.jsx';

const LANGUAGES = [
  'English',
  'Hindi',
  'Kannada',
  'Bengali',
  'Tamil',
  'Telugu'
];

const TranslatePanel = () => {
  const { session } = useSession();
  const [language, setLanguage] = useState('Hindi');
  const [isRoman, setIsRoman] = useState(false);
  const [source, setSource] = useState('summary');
  const [pageNumber, setPageNumber] = useState(1);
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setTranslation('');
    try {
      const data = await aiService.translate(language, isRoman, session?._id, source, source === 'page' ? pageNumber : null);
      setTranslation(data.translation);
    } catch (error) {
      console.error("Translate error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translation) return;
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls Area */}
      <div className="shrink-0 p-5 border-b border-slate-800 bg-slate-900/50 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Target Language
          </label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="roman-script"
            checked={isRoman}
            onChange={(e) => setIsRoman(e.target.checked)}
            disabled={language === 'English'}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-50"
          />
          <label htmlFor="roman-script" className={`text-sm text-slate-300 select-none cursor-pointer ${language === 'English' ? 'opacity-50' : ''}`}>
            Use Roman Script (English Letters)
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            What to translate
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="translateSource" 
                value="summary" 
                checked={source === 'summary'} 
                onChange={() => setSource('summary')} 
                className="text-indigo-500 bg-slate-800 border-slate-700 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">Summary</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="translateSource" 
                value="page" 
                checked={source === 'page'} 
                onChange={() => setSource('page')} 
                className="text-indigo-500 bg-slate-800 border-slate-700 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">Specific Page</span>
            </label>
          </div>
          
          {source === 'page' && (
            <div className="mt-3">
              <input 
                type="number" 
                min="1"
                value={pageNumber} 
                onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Page Number"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:shadow-none mt-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          <span>Generate Translation</span>
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Translating content...</p>
          </div>
        ) : translation ? (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 relative group">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {translation}
              </p>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                title="Copy Translation"
              >
                <Copy size={14} className={copied ? "text-emerald-400" : ""} />
              </button>
            </div>
            {copied && <p className="text-xs text-emerald-400 text-right pr-2">Copied to clipboard!</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Type size={20} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium">Select a source and language to generate a translation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatePanel;
