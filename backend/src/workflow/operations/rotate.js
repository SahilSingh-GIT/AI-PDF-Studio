import { PDFDocument, degrees } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'rotate-pages',
  name: 'Rotate Pages',
  category: 'EDIT',
  icon: 'RotateCw',
  order: 1,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !Array.isArray(payload.pages) || payload.pages.length === 0) {
      const err = new Error('Payload must contain an array of pages to rotate.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
    if (typeof payload.angle !== 'number' || payload.angle % 90 !== 0) {
      const err = new Error('Angle must be a multiple of 90 degrees.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  },

  execute: async ({ document, payload }) => {
    try {
      const absolutePath = getAbsolutePath(document.storagePath);
      const dataBuffer = await fs.readFile(absolutePath);
      
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pdfPages = pdfDoc.getPages();
      
      for (const pageNum of payload.pages) {
        // 1-indexed to 0-indexed
        const index = pageNum - 1;
        if (index >= 0 && index < pdfPages.length) {
          const page = pdfPages[index];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + payload.angle));
        }
      }
      
      const modifiedPdfBytes = await pdfDoc.save();
      
      // Buffer from Uint8Array
      const fileBuffer = Buffer.from(modifiedPdfBytes);
      
      return {
        fileBuffer, // Engine will pick this up and delegate to StorageService
        data: {
          pagesRotated: payload.pages,
          angle: payload.angle
        }
      };
    } catch (err) {
      logger.error(`[RotateOperation] Failed: ${err.message}`);
      throw new Error('Failed to rotate pages in document');
    }
  }
});
