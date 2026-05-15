import React from 'react';
import { useWorkflow } from '../../context/WorkflowContext.jsx';
import { PanelRegistry } from '../../config/panelRegistry.js';
import { toolRegistry } from '../../config/toolRegistry.js';
import InfoPanel from './panels/InfoPanel.jsx';

const RightPanel = () => {
  const { selectedOperation, setSelectedOperation } = useWorkflow();
  
  // selectedOperation is a string ID. Look up the full tool object.
  const tool = selectedOperation ? toolRegistry[selectedOperation] : null;

  // Determine if a sidebar tool is active
  const isSidebarToolActive = tool && tool.panelType === 'sidebar';
  
  // Get the component to render, or default to InfoPanel if none active
  const ActiveComponent = isSidebarToolActive 
    ? (PanelRegistry[tool.componentKey] || InfoPanel)
    : InfoPanel;

  const isExpandedAIMode = selectedOperation && 
    ['ai-chat', 'ai-summarize', 'ai-key-insights', 'ai-translate'].includes(selectedOperation);

  return (
    <aside 
      className="h-full border-l border-[#333333] bg-[#161616] flex flex-col"
      style={{
        flex: isExpandedAIMode ? '55 1 0%' : '0 0 20rem'
      }}
    >
      <ActiveComponent tool={tool} onClose={() => setSelectedOperation(null)} />
    </aside>
  );
};

export default RightPanel;

