import React from 'react';
import { MousePointer2 } from 'lucide-react';

export const reorderConfig = {
  id: 'reorder-pages',
  title: 'Reorder Pages',
  supportsSelection: false,
  supportsDrag: true,
  
  getApplyButtonText: () => 'Apply New Order',
    
  // Validation: Order must have actually changed, handled in overlay if needed, 
  // but let's just make it always valid if pages exist.
  isValid: (selectedPages, payload, totalPages, pages) => true,

  renderControls: () => {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-[#181818] border-b border-[#333333]">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Reorder Instructions</h3>
        <div className="flex items-center gap-2 text-gray-200 bg-[#262626] border border-[#444444] px-4 py-2 rounded">
          <MousePointer2 size={16} />
          <span className="text-sm font-medium">Drag and drop pages in the grid below to rearrange them.</span>
        </div>
      </div>
    );
  },


  formatPayload: (selectedPages, payload, pages) => ({
    newOrder: pages // The grid's reordered array of page numbers
  })
};

export default reorderConfig;
