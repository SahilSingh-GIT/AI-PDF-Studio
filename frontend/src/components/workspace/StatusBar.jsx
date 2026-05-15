/**
 * components/workspace/StatusBar.jsx
 *
 * Bottom status bar for the workspace.
 * Always renders page info — shows loading state until document loads.
 */

import { useWorkflow } from '../../context/WorkflowContext.jsx';

const StatusBar = ({ sessionId }) => {
  const { viewerState } = useWorkflow();

  return (
    <footer
      id="workspace-statusbar"
      className="flex items-center justify-between px-4 h-6 text-[11px] shrink-0 font-medium bg-[#161616] border-t border-[#333333] text-gray-400"
    >
      <div className="flex items-center gap-4">
        <span>Session: {sessionId}</span>
        <span className="flex items-center gap-1.5 text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span>Page {viewerState.currentPage} / {viewerState.totalPages || '?'}</span>
        <span>{viewerState.zoom}%</span>
      </div>
    </footer>
  );
};

export default StatusBar;

