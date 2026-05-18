import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'page-numbers',
  name: 'Page Numbers',
  category: 'EDIT',
  icon: 'Hash',
  order: 6,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !Array.isArray(payload.pages) || payload.pages.length === 0) {
      const err = new Error('Payload must contain an array of pages to number.');
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
      
      const pagesToNumber = [...new Set(payload.pages)]
        .filter(p => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);
        
      if (pagesToNumber.length === 0) {
        throw new Error('No valid pages selected for numbering.');
      }
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = payload.fontSize || 12;
      const margin = 36; // 0.5 inch margin
      
      let currentNumber = payload.startNumber || 1;
      
      for (const pageNum of pagesToNumber) {
        const page = pdfDoc.getPage(pageNum - 1);
        const { width, height } = page.getSize();
        
        let text = `${currentNumber}`;
        if (payload.format === 'total') {
          text = `${currentNumber} / ${totalPages}`;
        }
        
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        
        let x = margin;
        let y = margin;
        
        switch (payload.position) {
          case 'top-left':
            x = margin;
            y = height - margin - textHeight;
            break;
          case 'top-center':
            x = (width / 2) - (textWidth / 2);
            y = height - margin - textHeight;
            break;
          case 'top-right':
            x = width - margin - textWidth;
            y = height - margin - textHeight;
            break;
          case 'bottom-left':
            x = margin;
            y = margin;
            break;
          case 'bottom-center':
            x = (width / 2) - (textWidth / 2);
            y = margin;
            break;
          case 'bottom-right':
            x = width - margin - textWidth;
            y = margin;
            break;
          default:
            x = (width / 2) - (textWidth / 2);
            y = margin;
        }
        
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        
        currentNumber++;
      }
      
      const modifiedPdfBytes = await pdfDoc.save();
      const fileBuffer = Buffer.from(modifiedPdfBytes);
      
      return {
        fileBuffer,
        data: {
          pagesNumbered: pagesToNumber,
          format: payload.format
        }
      };
    } catch (err) {
      logger.error(`[PageNumbersOperation] Failed: ${err.message}`);
      throw new Error(`Failed to add page numbers: ${err.message}`);
    }
  }
});
