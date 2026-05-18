import { registerOperation } from './registry.js';
import logger from '../utils/logger.js';

// Import all operations for their side effects (registration)
import './operations/rotate.js';
import './operations/delete.js';
import './operations/reorder.js';
import './operations/summary.js';
import './operations/chat.js';
import './operations/search.js';
import './operations/merge.js';
import './operations/split.js';
import './operations/watermark.js';
import './operations/edit-content.js';

import './operations/native-pdf.js';
import './operations/extract-metadata.js';
import './operations/generate-thumbnails.js';
import './operations/extract-pages.js';
import './operations/insert-blank.js';
import './operations/duplicate-pages.js';
import './operations/page-numbers.js';
import './operations/export-word.js';
import './operations/export-powerpoint.js';
import './operations/export-text.js';
import './operations/export-images.js';

import './operations/password-protection.js';
import './operations/remove-security.js';
import './operations/permissions.js';
import './operations/digital-signature.js';


/**
 * Initialize the workflow engine.
 * Currently just logs that operations are registered via side-effects.
 */
export const initWorkflowEngine = () => {
  logger.info('[WorkflowEngine] Initialized with registered operations.');
};

export default { initWorkflowEngine };
