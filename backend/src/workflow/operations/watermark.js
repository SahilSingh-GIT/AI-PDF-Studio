import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';
import path from 'path';

registerOperation({
  id: 'watermark',
  name: 'Watermark PDF',
  category: 'DOCUMENT',
  icon: 'Type',
  order: 4,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !payload.text) {
      const err = new Error('Watermark text must be provided.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  },

  execute: async ({ document, payload }) => {
    try {
      const absolutePath = getAbsolutePath(document.storagePath);
      const dataBuffer = await fs.readFile(absolutePath);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pages = pdfDoc.getPages();
      
      const opacity = payload.opacity !== undefined ? parseFloat(payload.opacity) : 0.5;
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = parseInt(payload.fontSize, 10) || 48;

      const angle = 45;
      const rad = (angle * Math.PI) / 180;

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        const textWidth = font.widthOfTextAtSize(payload.text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        const xCenter = width / 2;
        const yCenter = height / 2;

        const x = xCenter - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad);
        const y = yCenter - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad);

        page.drawText(payload.text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(angle),
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      
      return {
        fileBuffer: Buffer.from(modifiedPdfBytes),
        data: {
          watermarkText: payload.text
        }
      };
    } catch (err) {
      logger.error(`[WatermarkOperation] Failed: ${err.message}`);
      throw new Error(`Failed to apply watermark: ${err.message}`);
    }
  }
});
