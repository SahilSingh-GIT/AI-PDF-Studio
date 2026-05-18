/**
 * workflow/capabilities.js — Capability Registry
 *
 * Maps capabilities to the operations that provide them.
 * This allows the Execution Planner to dynamically resolve prerequisites
 * without hardcoding feature names like "ocr" into other operations.
 */

import { CAPABILITIES } from './constants.js';

const capabilityRegistry = {
  [CAPABILITIES.SEARCHABLE_TEXT]: ['native-pdf', 'ocr', 'word-parser'],
  [CAPABILITIES.PAGE_METADATA]: ['extract-metadata'],
  [CAPABILITIES.THUMBNAILS]: ['generate-thumbnails'],
  [CAPABILITIES.EMBEDDINGS]: ['generate-embeddings'],
};

/**
 * Get all providers for a specific capability.
 * @param {string} capability 
 * @returns {string[]} Array of operation IDs that can provide this capability.
 */
export const getProvidersForCapability = (capability) => {
  return capabilityRegistry[capability] || [];
};

export default { getProvidersForCapability };
