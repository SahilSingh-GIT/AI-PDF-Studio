/**
 * services/pageOperations/PageOperationService.js
 * 
 * Standardizes the execution pipeline for all page-modifying operations.
 * Enforces Validation -> Payload Construction -> Workflow Execution.
 */

export const PageOperationService = {
  /**
   * Executes a page operation through the Workflow Engine.
   * 
   * @param {Object} config - The operation configuration object (e.g. rotateConfig)
   * @param {number[]} selectedPages - The normalized array of selected pages
   * @param {Object} payload - The dynamic UI state for the operation (e.g. angle)
   * @param {number} totalPages - Total pages in the document
   * @param {number[]} currentPagesOrder - The current working order of pages in the preview grid
   * @param {Function} executeOperation - The bound WorkflowContext execution function
   * @throws {Error} If validation fails or execution throws
   */
  execute: async (config, selectedPages, payload, totalPages, currentPagesOrder, executeOperation) => {
    // 1. Validate
    if (!config.isValid(selectedPages, payload, totalPages, currentPagesOrder)) {
      throw new Error('Invalid selection or parameters. Please review your input.');
    }

    // 2. Build Payload
    const finalPayload = config.formatPayload(selectedPages, payload, currentPagesOrder);

    // 3. Execute via Workflow Engine
    // The Workflow Engine internally manages Version History and Session Refresh.
    const result = await executeOperation(config.id, finalPayload);
    
    // 4. Centralized Download Handling
    if (result && result.operationData && result.operationData.downloadBufferBase64) {
      const byteCharacters = atob(result.operationData.downloadBufferBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const filename = result.operationData.downloadFilename || 'Download.pdf';
      const isZip = filename.toLowerCase().endsWith('.zip');
      const blob = new Blob([byteArray], { type: isZip ? 'application/zip' : 'application/pdf' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.operationData.downloadFilename || 'Download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return result;
  }
};
