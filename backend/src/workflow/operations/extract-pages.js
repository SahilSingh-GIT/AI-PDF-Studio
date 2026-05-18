import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'extract-pages',
  name: 'Extract Pages',
  category: 'EDIT',
  icon: 'Download',
  order: 3,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !Array.isArray(payload.pages) || payload.pages.length === 0) {
      const err = new Error('Payload must contain an array of pages to extract.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  },

  execute: async ({ document, payload }) => {
    try {
      const absolutePath = getAbsolutePath(document.storagePath);
      const dataBuffer = await fs.readFile(absolutePath);
      
      const sourceDoc = await PDFDocument.load(dataBuffer);
      const totalPages = sourceDoc.getPageCount();
      
      // Sort in ascending order for extraction
      const pagesToExtract = [...new Set(payload.pages)]
        .filter(p => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);
        
      if (pagesToExtract.length === 0) {
        throw new Error('No valid pages selected for extraction.');
      }
      
      // Create a new document for extracted pages
      const extractedDoc = await PDFDocument.create();
      
      // pdf-lib copyPages uses 0-indexed page numbers
      const indicesToCopy = pagesToExtract.map(p => p - 1);
      const copiedPages = await extractedDoc.copyPages(sourceDoc, indicesToCopy);
      
      copiedPages.forEach(page => extractedDoc.addPage(page));
      
      const extractedPdfBytes = await extractedDoc.save();
      const downloadBufferBase64 = Buffer.from(extractedPdfBytes).toString('base64');
      
      let fileBuffer = null;

      if (payload.deleteAfterExtract) {
        // If all pages are to be deleted, throw error
        if (pagesToExtract.length === totalPages) {
          throw new Error('Cannot delete all pages from original document during extraction.');
        }

        // Remove from end to start to avoid index shifting
        const pagesToDelete = [...pagesToExtract].sort((a, b) => b - a);
        for (const pageNum of pagesToDelete) {
          sourceDoc.removePage(pageNum - 1);
        }
        
        const modifiedPdfBytes = await sourceDoc.save();
        fileBuffer = Buffer.from(modifiedPdfBytes);
      }
      
      return {
        // Only return fileBuffer if we mutated the document (deleteAfterExtract)
        // If fileBuffer is provided, WorkflowEngine creates a new version.
        fileBuffer: fileBuffer,
        downloadData: {
          downloadFilename: 'Extract.pdf',
          downloadBufferBase64: downloadBufferBase64,
        },
        data: {
          pagesExtracted: pagesToExtract,
          deletedFromOriginal: !!payload.deleteAfterExtract
        }
      };
    } catch (err) {
      logger.error(`[ExtractOperation] Failed: ${err.message}`);
      throw new Error(`Failed to extract pages: ${err.message}`);
    }
  }
});
