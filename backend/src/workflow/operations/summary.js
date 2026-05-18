/**
 * workflow/operations/summary.js
 */

import { CAPABILITIES, OPERATION_STATUS } from '../constants.js';

export default {
  id: 'summary',
  name: 'AI Summary',
  category: 'AI',
  icon: 'ListTree',
  order: 2,
  status: OPERATION_STATUS.COMING_SOON,
  requires: [CAPABILITIES.SEARCHABLE_TEXT, CAPABILITIES.PAGE_METADATA],
  supportedTypes: ['pdf', 'docx'],
  canUndo: false,
  validate: (session, payload) => {
    // Add any specific validation if needed
  },
  execute: async ({ session, document, payload }) => {
    return {
      success: false,
      data: {
        status: 'NOT_AVAILABLE',
        milestone: 7,
        message: 'This operation will be available after the AI pipeline is implemented.',
      }
    };
  },
};
