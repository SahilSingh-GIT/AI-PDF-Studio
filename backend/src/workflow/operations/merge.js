import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';
import path from 'path';

registerOperation({
  id: 'merge-pdfs',
  name: 'Merge PDFs',
  category: 'DOCUMENT',
  icon: 'Layers',
  order: 2,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !payload.documents || payload.documents.length === 0) {
      const err = new Error('No documents provided for merging.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  },

  execute: async ({ document, payload }) => {
    try {
      const absolutePath = getAbsolutePath(document.storagePath);
      const dataBuffer = await fs.readFile(absolutePath);
      const mainDoc = await PDFDocument.load(dataBuffer);
      const totalPages = mainDoc.getPageCount();

      const location = payload.location || 'After Last Page';
      
      let insertionIndex = location === 'Before First Page' ? 0 : totalPages;

      for (const tempDocPath of payload.documents) {
        const tempAbsPath = getAbsolutePath(tempDocPath);
        const tempBuffer = await fs.readFile(tempAbsPath);
        const tempPdf = await PDFDocument.load(tempBuffer);
        
        const copiedPages = await mainDoc.copyPages(tempPdf, tempPdf.getPageIndices());
        
        for (let i = 0; i < copiedPages.length; i++) {
          mainDoc.insertPage(insertionIndex + i, copiedPages[i]);
        }
        insertionIndex += copiedPages.length;
      }

      const mergedPdfBytes = await mainDoc.save();
      
      return {
        fileBuffer: Buffer.from(mergedPdfBytes),
        data: {
          documentsMerged: payload.documents.length,
          location
        }
      };
    } catch (err) {
      logger.error(`[MergeOperation] Failed: ${err.message}`);
      throw new Error(`Failed to merge PDFs: ${err.message}`);
    }
  }
});
