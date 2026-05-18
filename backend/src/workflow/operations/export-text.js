import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import fs from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import logger from '../../utils/logger.js';

registerOperation({
  id: 'export-text',
  name: 'Export to Text',
  category: 'EXPORT',
  canUndo: false,
  
  execute: async ({ document }) => {
    logger.info(`[ExportText] Extracting text from ${document.originalName}`);
    
    try {
      const pdfPath = getAbsolutePath(document.storagePath);
      const pdfBuffer = await fs.readFile(pdfPath);
      
      const parser = new PDFParse({ data: pdfBuffer });
      let extractedText = '';
      try {
        const pdfData = await parser.getText();
        extractedText = pdfData.text || '';
      } finally {
        await parser.destroy();
      }
      
      if (!extractedText.trim()) {
        throw new Error('No text found in the document. This might be a scanned image-based PDF which requires OCR.');
      }
      
      const textBuffer = Buffer.from(extractedText, 'utf-8');
      const downloadBufferBase64 = textBuffer.toString('base64');
      const baseName = document.originalName.replace(/\.pdf$/i, '');

      return {
        downloadData: {
          downloadFilename: `${baseName}_Exported.txt`,
          downloadBufferBase64: downloadBufferBase64,
        },
        data: {
          message: 'Text extracted successfully.'
        }
      };
    } catch (err) {
      logger.error(`[ExportText] Failed: ${err.message}`);
      throw new Error(`Failed to extract text: ${err.message}`);
    }
  }
});
