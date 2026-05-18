/**
 * workflow/registry.js — Operation Registry
 *
 * A singleton store for all available workflow operations.
 * Operations register themselves here on startup.
 */

const operations = new Map();

/**
 * Register a new operation.
 * @param {object} op - The operation definition.
 * @param {string} op.id - Unique identifier.
 * @param {string} op.name - Human readable name.
 * @param {string} op.category - 'DOCUMENT' | 'EDIT' | 'CONVERT' | 'AI'
 * @param {string} op.icon - Icon identifier for the frontend.
 * @param {number} op.order - Display order in the UI.
 * @param {boolean} op.visible - Whether it shows in the sidebar.
 * @param {string} op.status - Operation status (AVAILABLE, COMING_SOON, etc).
 * @param {string[]} op.requires - Capabilities required to run (e.g. ['SEARCHABLE_TEXT']).
 * @param {string[]} op.provides - Capabilities this operation provides (for hidden tasks).
 * @param {string[]} op.supportedTypes - Document extensions/types supported (e.g. ['pdf', 'docx']).
 * @param {boolean} op.canUndo - Whether it creates a new version.
 * @param {function} op.validate - Validation function executed before planning.
 * @param {function} op.execute - Execution function.
 */
export const registerOperation = (op) => {
  if (operations.has(op.id)) {
    throw new Error(`Operation with ID ${op.id} is already registered.`);
  }
  
  // Set defaults for optional UI fields
  const operation = {
    icon: 'FileText',
    order: 99,
    visible: true,
    status: 'AVAILABLE',
    requires: [],
    provides: [],
    supportedTypes: ['pdf'], // Assume pdf by default
    validate: (session, payload) => { /* default no-op passes */ },
    ...op
  };

  operations.set(operation.id, operation);
};

/**
 * Retrieve an operation by ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export const getOperation = (id) => {
  return operations.get(id);
};

/**
 * Get all registered operations.
 * @returns {object[]}
 */
export const getAllOperations = () => {
  return Array.from(operations.values());
};

export default { registerOperation, getOperation, getAllOperations };
