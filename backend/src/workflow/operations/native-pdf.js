import { CAPABILITIES, OPERATION_STATUS } from '../constants.js';

export default {
  id: 'native-pdf',
  name: 'Native PDF Text Extraction',
  category: 'PREP',
  visible: false,
  status: OPERATION_STATUS.AVAILABLE,
  requires: [],
  provides: [CAPABILITIES.SEARCHABLE_TEXT],
  supportedTypes: ['pdf'],
  canUndo: false,
  execute: async ({ session, document, payload }) => {
    return {
      success: true,
      data: { message: 'Native text extracted' },
    };
  },
};
