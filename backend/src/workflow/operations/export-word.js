import { registerOperation } from '../registry.js';
import { ExportEngine } from './export/exportEngine.js';
import { WordExporter } from './export/exporters/wordExporter.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'export-word',
  name: 'Export to Word',
  category: 'EXPORT',
  canUndo: false, // Does not mutate the workspace document
  
  execute: async ({ document, payload }) => {
    logger.info(`[ExportWord] Generating high-fidelity DOCX for ${document.originalName}`);
    
    try {
      const exporter = new WordExporter();
      const downloadData = await ExportEngine.execute(document, exporter);
      return downloadData;
    } catch (err) {
      logger.error(`[ExportWord] Failed: ${err.message}`);
      throw new Error(err.message);
    }
  }
});
