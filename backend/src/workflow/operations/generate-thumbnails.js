import { CAPABILITIES, OPERATION_STATUS } from '../constants.js';

export default {
  id: 'generate-thumbnails',
  name: 'Generate Thumbnails',
  category: 'PREP',
  visible: false,
  status: OPERATION_STATUS.AVAILABLE,
  requires: [],
  provides: [CAPABILITIES.THUMBNAILS],
  supportedTypes: ['pdf', 'image'],
  canUndo: false,
  validate: (session, payload) => {},
  execute: async ({ session, document, payload }) => {
    return {
      success: true,
      data: { message: 'Thumbnails generated' },
    };
  },
};
