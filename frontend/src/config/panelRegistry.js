/**
 * config/panelRegistry.js
 * 
 * Maps serializable componentKey strings to React components.
 */

import ComingSoonPanel from '../components/workspace/panels/ComingSoonPanel.jsx';
import PagesPanel from '../components/workspace/panels/PagesPanel.jsx';
import SearchPanel from '../components/workspace/panels/SearchPanel.jsx';
import InfoPanel from '../components/workspace/panels/InfoPanel.jsx';
import EditContentPanel from '../components/workspace/panels/EditContentPanel.jsx';
import AIPanel from '../components/workspace/panels/ai/AIPanel.jsx';

export const PanelRegistry = {
  'coming-soon': ComingSoonPanel,
  'pages': PagesPanel,
  'search': SearchPanel,
  'document-info': InfoPanel,
  'add-text': EditContentPanel,
  'delete-text': EditContentPanel,
  'highlight': EditContentPanel,
  'add-image': EditContentPanel,
  'ai-panel': AIPanel,
};
