import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../../context/WorkflowContext.jsx';
import { sidebarConfig, SIDEBAR_SCHEMA_VERSION } from '../../config/sidebarConfig.js';
import { toolRegistry } from '../../config/toolRegistry.js';
import { useIntelligence } from '../../context/IntelligenceContext.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

const STORAGE_KEY = `ai-pdf-studio-sidebar-v${SIDEBAR_SCHEMA_VERSION}`;

const Sidebar = () => {
  const { selectedOperation, setSelectedOperation } = useWorkflow();
  const { report } = useIntelligence();
  const { session } = useSession();

  // Dynamically determine encryption state by combining base intelligence and recent operations
  const isDocumentEncrypted = React.useMemo(() => {
    let encrypted = report?.analysis?.isEncrypted || false;
    
    if (session?.workflowHistory && session.workflowHistory.length > 0) {
      // Look from most recent to oldest
      const history = [...session.workflowHistory].reverse();
      for (const op of history) {
        if (op.operation === 'password-protection') return true;
        if (op.operation === 'remove-security') return false;
      }
    }
    
    return encrypted;
  }, [report, session]);
  
  // Initialize state from localStorage or defaultExpanded
  const [expandedCategories, setExpandedCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse sidebar state', e);
    }
    
    // Fallback to config defaults
    const defaults = {};
    sidebarConfig.forEach(cat => {
      defaults[cat.id] = cat.defaultExpanded;
    });
    return defaults;
  });

  // Persist state when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleSelect = (opId) => {
    if (selectedOperation === opId) {
      setSelectedOperation(null);
    } else {
      setSelectedOperation(opId);
    }
  };

  // Sort categories by order
  const sortedCategories = [...sidebarConfig].sort((a, b) => a.order - b.order);

  return (
    <aside className="w-16 lg:w-56 shrink-0 flex flex-col h-full overflow-y-auto select-none bg-[#161616] border-r border-[#333333]">
      <div className="py-4 flex flex-col gap-1">
        {sortedCategories.map(category => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCategories[category.id];

          return (
            <div key={category.id} className="flex flex-col">
              {/* Category Header */}
              <button 
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-center lg:justify-between px-2 lg:px-4 py-2 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="hidden lg:inline">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span className="hidden lg:inline" title={category.title}>
                    <CategoryIcon size={14} />
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase hidden lg:inline">
                    {category.title}
                  </span>
                  <span className="inline lg:hidden text-xs font-bold" title={category.title}>
                    <CategoryIcon size={16} />
                  </span>
                </div>
              </button>
              
              {/* Tools List */}
              {isExpanded && (
                <div className="flex flex-col gap-0.5 px-2 lg:px-3 mb-2">
                  {category.tools.map(toolId => {
                    const tool = toolRegistry[toolId];
                    if (!tool) return null;

                    const ToolIcon = tool.icon || FileText;
                    const isComingSoon = tool.status === 'coming-soon';
                    
                    let isDisabled = tool.status === 'disabled';
                    let tooltip = tool.title;
                    
                    if (tool.id === 'remove-security' && !isDocumentEncrypted) {
                      isDisabled = true;
                    }
                    
                    if (tool.id === 'edit-text' && report?.analysis?.isImageOnly) {
                      isDisabled = true;
                      tooltip = 'Text editing is available only for searchable PDFs.';
                    }
                    
                    // Dynamic capability locking based on the intelligence report
                    const capabilities = report?.intelligence?.capabilities;
                    if (capabilities) {
                      if (tool.id === 'search' && capabilities.Search?.available === false) {
                        isDisabled = true;
                        tooltip = 'Search is unavailable for this document.';
                      }
                      if (tool.id === 'ai-chat' && capabilities.AIChat?.available === false) {
                        isDisabled = true;
                        tooltip = 'AI Chat is unavailable for unsearchable documents.';
                      }
                      if ((tool.id === 'ai-summarize' || tool.id === 'ai-key-insights' || tool.id === 'ai-translate') && capabilities.AISummary?.available === false) {
                        isDisabled = true;
                        tooltip = 'AI features are unavailable for unsearchable documents.';
                      }
                      if (tool.id === 'ai-semantic-search' && capabilities.Search?.available === false) {
                        isDisabled = true;
                        tooltip = 'Semantic Search is unavailable for unsearchable documents.';
                      }
                    }
                    
                    const isUnavailable = isDisabled; // We allow clicking coming-soon to show panel
                    const isActive = selectedOperation === tool.id;

                    return (
                      <button
                        key={tool.id}
                        title={tooltip}
                        disabled={isUnavailable}
                        onClick={() => handleSelect(tool.id)}
                        className={`w-full flex items-center justify-between lg:justify-start gap-3 px-2 py-1.5 rounded transition-all text-sm ${
                          isUnavailable ? 'opacity-40 cursor-not-allowed text-gray-500' : ''
                        } ${
                          isActive 
                            ? 'bg-[#333333] text-white border border-[#555555]' 
                            : 'text-gray-300 hover:bg-[#222222] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="shrink-0">
                            <ToolIcon size={16} />
                          </span>
                          <span className="hidden lg:inline font-medium truncate text-[13px]">{tool.title}</span>
                        </div>
                        {isComingSoon && (
                          <span className="hidden lg:inline text-[9px] uppercase font-bold tracking-wider bg-[#2a2a2a] text-gray-400 border border-[#333333] px-1 rounded ml-auto">
                            Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;

