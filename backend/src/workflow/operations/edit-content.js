import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';
import { OverlayRenderer } from '../../utils/OverlayRenderer.js';

registerOperation({
  id: 'edit-content',
  name: 'Edit Content',
  category: 'DOCUMENT',
  icon: 'Edit',
  order: 10,
  visible: false, // Internal operation, triggered by the 4 creation tools
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !payload.overlays || !Array.isArray(payload.overlays)) {
      const err = new Error('Invalid payload: overlays array is required.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  },

  execute: async ({ document, payload }) => {
    try {
      const absolutePath = getAbsolutePath(document.storagePath);
      const dataBuffer = await fs.readFile(absolutePath);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      
      // The payload structure is explicitly versioned
      // { version: 1, overlays: [...] }
      const overlays = payload.overlays || [];

      // Invoke the separated rendering utility
      await OverlayRenderer.applyOverlays(pdfDoc, overlays);

      const modifiedPdfBytes = await pdfDoc.save();
      
      return {
        fileBuffer: Buffer.from(modifiedPdfBytes),
        data: {
          overlayCount: overlays.length,
          version: payload.version
        }
      };
    } catch (err) {
      logger.error(`[EditContentOperation] Failed: ${err.message}`);
      throw new Error(`Failed to apply edits: ${err.message}`);
    }
  }
});
