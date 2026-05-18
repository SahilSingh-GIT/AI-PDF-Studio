import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'duplicate-pages',
  name: 'Duplicate Pages',
  category: 'EDIT',
  icon: 'Copy',
  order: 5,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: true,
  
  validate: (session, payload) => {
    if (!payload || !Array.isArray(payload.pages) || payload.pages.length === 0) {
      const err = new Error('Payload must contain an array of pages to duplicate.');
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
      
      const pagesToDuplicate = [...new Set(payload.pages)]
        .filter(p => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);
        
      if (pagesToDuplicate.length === 0) {
        throw new Error('No valid pages selected for duplication.');
      }
      
      const count = Math.max(1, payload.count || 1);
      
      // Copy all needed pages first
      // 0-indexed
      const indicesToCopy = pagesToDuplicate.map(p => p - 1);
      
      // We need `count` copies of each page.
      // pdf-lib's copyPages takes an array of indices. We can pass the indices multiple times.
      // Wait, copyPages returns an array of copied pages corresponding to the indices provided.
      // E.g., copyPages(pdfDoc, [1, 1, 1]) gives 3 copies of page 1.
      
      let copiedPages = [];
      if (payload.position === 'after') {
        // We will insert them manually. 
        // We need `count` copies for each page.
        const flatIndices = [];
        for (const idx of indicesToCopy) {
          for (let i = 0; i < count; i++) {
            flatIndices.push(idx);
          }
        }
        copiedPages = await pdfDoc.copyPages(pdfDoc, flatIndices);
        
        // We must insert them from highest index to lowest so we don't mess up earlier indices!
        // But the flatIndices are sorted ascending. We need to iterate backwards by groups.
        
        let copiedIdx = copiedPages.length - 1;
        for (let i = indicesToCopy.length - 1; i >= 0; i--) {
          const originalIndex = indicesToCopy[i];
          // We want to insert `count` copies *after* originalIndex.
          // That means inserting at `originalIndex + 1`.
          // Since we are going backwards, inserting at originalIndex + 1 won't affect indices < originalIndex.
          for (let c = 0; c < count; c++) {
            const pageToInsert = copiedPages[copiedIdx];
            pdfDoc.insertPage(originalIndex + 1, pageToInsert);
            copiedIdx--;
          }
        }
      } else {
        // position === 'end'
        // Just copy all pages `count` times and append at the end.
        const flatIndices = [];
        for (let i = 0; i < count; i++) {
          for (const idx of indicesToCopy) {
            flatIndices.push(idx);
          }
        }
        copiedPages = await pdfDoc.copyPages(pdfDoc, flatIndices);
        for (const page of copiedPages) {
          pdfDoc.addPage(page);
        }
      }
      
      const modifiedPdfBytes = await pdfDoc.save();
      const fileBuffer = Buffer.from(modifiedPdfBytes);
      
      return {
        fileBuffer,
        data: {
          pagesDuplicated: pagesToDuplicate,
          count
        }
      };
    } catch (err) {
      logger.error(`[DuplicateOperation] Failed: ${err.message}`);
      throw new Error(`Failed to duplicate pages: ${err.message}`);
    }
  }
});
