import { CAPABILITIES, OPERATION_STATUS } from '../constants.js';

export default {
  id: 'extract-metadata',
  name: 'Extract Metadata',
  category: 'PREP',
  visible: false,
  status: OPERATION_STATUS.AVAILABLE,
  requires: [],
  provides: [CAPABILITIES.PAGE_METADATA],
  supportedTypes: ['pdf', 'docx', 'pptx'],
  canUndo: false,
  validate: (session, payload) => {},
  execute: async ({ session, document, payload }) => {
    return {
      success: true,
      data: { message: 'Metadata extracted' },
    };
  },
};
