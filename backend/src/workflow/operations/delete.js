import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'delete-pages',
  name: 'Delete Pages',
  category: 'EDIT',
  icon: 'Trash2',
  order: 2,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !Array.isArray(payload.pages) || payload.pages.length === 0) {
      const err = new Error('Payload must contain an array of pages to delete.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  },

  execute: async ({ document, payload }) => {
    try {
      const absolutePath = getAbsolutePath(document.storagePath);
      const dataBuffer = await fs.readFile(absolutePath);
      
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const totalPages = pdfDoc.getPageCount();
      
      // Sort in descending order to avoid index shifting during removal
      const pagesToDelete = [...new Set(payload.pages)]
        .filter(p => p >= 1 && p <= totalPages)
        .sort((a, b) => b - a);
        
      if (pagesToDelete.length === totalPages) {
        throw new Error('Cannot delete all pages in a document.');
      }
      
      for (const pageNum of pagesToDelete) {
        pdfDoc.removePage(pageNum - 1);
      }
      
      const modifiedPdfBytes = await pdfDoc.save();
      const fileBuffer = Buffer.from(modifiedPdfBytes);
      
      return {
        fileBuffer,
        data: {
          pagesDeleted: pagesToDelete,
        }
      };
    } catch (err) {
      logger.error(`[DeleteOperation] Failed: ${err.message}`);
      throw new Error(`Failed to delete pages: ${err.message}`);
    }
  }
});
