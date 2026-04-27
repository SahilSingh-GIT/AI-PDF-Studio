import React, { useState, useEffect } from 'react';
import { Key, Loader2, BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';
import { aiService } from '../../../../services/ai/aiService.js';
import { useSession } from '../../../../context/SessionContext.jsx';

const KeyInsightsPanel = () => {
  const { session } = useSession();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true); // Load immediately on mount for this panel

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const data = await aiService.getKeyInsights(session?._id);
        setInsights(data);
      } catch (error) {
        console.error("Insights error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Extracting key insights...</p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="h-full overflow-y-auto p-5 space-y-8">
      
      {/* Important Concepts */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
          <BookOpen size={16} className="text-indigo-400" />
          Important Concepts
        </h3>
        <div className="grid gap-3">
          {insights.importantConcepts.map((concept, idx) => (
            <div key={idx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
              <h4 className="text-sm font-bold text-indigo-300 mb-1">{concept.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{concept.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Important Points */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
          <Key size={16} className="text-emerald-400" />
          Key Points
        </h3>
        <ul className="space-y-2">
          {insights.importantPoints.map((point, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-300 bg-slate-800/20 p-3 rounded-lg border border-slate-700/30">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Common Mistakes */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
          <AlertTriangle size={16} className="text-amber-400" />
          Common Mistakes
        </h3>
        <ul className="space-y-3">
          {insights.commonMistakes.map((mistake, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-300 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Exam Tips */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
          <Lightbulb size={16} className="text-yellow-400" />
          Exam Tips
        </h3>
        <ul className="space-y-3 pb-4">
          {insights.examTips.map((tip, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-300 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/20">
              <Lightbulb size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              <span className="font-medium">{tip}</span>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
};

export default KeyInsightsPanel;
