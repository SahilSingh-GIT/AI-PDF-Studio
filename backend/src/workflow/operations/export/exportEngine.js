import { TemporaryDirectoryManager } from './managers/tempManager.js';
import { TimeoutManager } from './managers/timeoutManager.js';

export class ExportEngine {
  /**
   * Orchestrates the execution of a specific exporter using isolated temporary directories
   * and strict timeouts, while abstracting the underlying conversion technology.
   * 
   * @param {Object} document - The PDF document object from the workspace
   * @param {Object} exporter - An instance of an Exporter interface (e.g. WordExporter)
   * @returns {Promise<Object>} The downloadData object expected by the Workflow Engine
   */
  static async execute(document, exporter) {
    // 1. Create an isolated temporary environment
    const { dirPath, jobId, cleanup } = await TemporaryDirectoryManager.createIsolatedJobContext();
    
    // Default timeout calculation (could be enhanced if we pre-extract page counts)
    const timeoutMs = TimeoutManager.getTimeoutForPageCount(50); // Default to medium timeout

    try {
      // 2. Delegate the actual conversion to the engine-agnostic Exporter interface
      const downloadData = await exporter.export(document, dirPath, timeoutMs);
      return downloadData;
    } finally {
      // 3. Guarantee cleanup of the temporary environment
      await cleanup();
    }
  }
}
