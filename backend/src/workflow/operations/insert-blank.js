import { PDFDocument, PageSizes } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'insert-blank-page',
  name: 'Insert Blank Page',
  category: 'EDIT',
  icon: 'FilePlus',
  order: 4,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || typeof payload.targetPage !== 'number') {
      const err = new Error('Payload must contain a valid targetPage.');
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
      
      // Determine insertion index (0-indexed)
      const target = payload.targetPage - 1; 
      let insertIndex = target + 1; // 'after' default
      
      if (payload.position === 'before') insertIndex = target;
      if (payload.position === 'beginning') insertIndex = 0;
      if (payload.position === 'end') insertIndex = totalPages;
      
      // Keep in bounds
      insertIndex = Math.max(0, Math.min(insertIndex, totalPages));

      // Determine dimensions
      let width, height;
      if (payload.size === 'a4') {
        [width, height] = PageSizes.A4;
      } else if (payload.size === 'letter') {
        [width, height] = PageSizes.Letter;
      } else {
        // match target page
        const pages = pdfDoc.getPages();
        const refPage = pages[Math.max(0, Math.min(target, pages.length - 1))];
        const { width: refW, height: refH } = refPage.getSize();
        width = refW;
        height = refH;
      }

      pdfDoc.insertPage(insertIndex, [width, height]);
      
      const modifiedPdfBytes = await pdfDoc.save();
      const fileBuffer = Buffer.from(modifiedPdfBytes);
      
      return {
        fileBuffer,
        data: {
          insertedIndex: insertIndex,
          size: payload.size
        }
      };
    } catch (err) {
      logger.error(`[InsertBlankOperation] Failed: ${err.message}`);
      throw new Error(`Failed to insert blank page: ${err.message}`);
    }
  }
});
