/**
 * workflow/operations/chat.js
 */

import { CAPABILITIES, OPERATION_STATUS } from '../constants.js';

export default {
  id: 'chat',
  name: 'AI Chat',
  category: 'AI',
  icon: 'MessageSquare',
  order: 1,
  status: OPERATION_STATUS.COMING_SOON,
  requires: [CAPABILITIES.SEARCHABLE_TEXT, CAPABILITIES.PAGE_METADATA],
  supportedTypes: ['pdf', 'docx'],
  canUndo: false, 
  validate: (session, payload) => {
    if (payload.action === 'ask' && !payload.query) {
      throw new Error('Chat query is required');
    }
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
