import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'reorder-pages',
  name: 'Reorder Pages',
  category: 'EDIT',
  icon: 'Layers',
  order: 3,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !Array.isArray(payload.newOrder) || payload.newOrder.length === 0) {
      const err = new Error('Payload must contain a newOrder array of pages.');
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
      
      const newOrder = payload.newOrder;
      
      if (newOrder.length !== totalPages) {
        throw new Error(`Invalid reorder: Expected ${totalPages} pages but got ${newOrder.length}.`);
      }
      
      const sortedInput = [...newOrder].sort((a, b) => a - b);
      for (let i = 0; i < totalPages; i++) {
        if (sortedInput[i] !== i + 1) {
          throw new Error('Invalid reorder: missing or duplicate pages in the order array.');
        }
      }
      
      const newPdfDoc = await PDFDocument.create();
      const indicesToCopy = newOrder.map(pageNum => pageNum - 1);
      
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, indicesToCopy);
      for (const page of copiedPages) {
        newPdfDoc.addPage(page);
      }
      
      const modifiedPdfBytes = await newPdfDoc.save();
      const fileBuffer = Buffer.from(modifiedPdfBytes);
      
      return {
        fileBuffer,
        data: {
          newOrder
        }
      };
    } catch (err) {
      logger.error(`[ReorderOperation] Failed: ${err.message}`);
      throw new Error(`Failed to reorder pages: ${err.message}`);
    }
  }
});
