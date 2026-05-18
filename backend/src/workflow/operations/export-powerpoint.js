import { registerOperation } from '../registry.js';
import { ExportEngine } from './export/exportEngine.js';
import { PowerPointExporter } from './export/exporters/powerPointExporter.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'export-powerpoint',
  name: 'Export to PowerPoint',
  category: 'EXPORT',
  canUndo: false, // Does not mutate the workspace document
  
  execute: async ({ document, payload }) => {
    logger.info(`[ExportPPTX] Generating high-fidelity PPTX for ${document.originalName}`);
    
    try {
      const exporter = new PowerPointExporter();
      const downloadData = await ExportEngine.execute(document, exporter);
      return downloadData;
    } catch (err) {
      logger.error(`[ExportPPTX] Failed: ${err.message}`);
      throw new Error(err.message);
    }
  }
});
