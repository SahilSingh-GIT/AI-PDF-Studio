import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import { HTTP_STATUS } from '../../constants/index.js';
import logger from '../../utils/logger.js';
import { ZipArchive } from 'archiver';

const parseRanges = (rangesArray) => {
  const parsed = [];
  for (const r of rangesArray) {
    if (r.includes('-')) {
      const parts = r.split('-');
      if (parts.length === 2) {
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          parsed.push({ start, end });
          continue;
        }
      }
    } else {
      const page = parseInt(r, 10);
      if (!isNaN(page)) {
        parsed.push({ start: page, end: page });
        continue;
      }
    }
  }
  return parsed;
};

registerOperation({
  id: 'split-pdf',
  name: 'Split PDF',
  category: 'DOCUMENT',
  icon: 'SplitSquareHorizontal',
  order: 3,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: [],
  supportedTypes: ['pdf'],
  canUndo: false, // Doesn't modify the current document
  
  validate: (session, payload) => {
    if (!payload || !Array.isArray(payload.ranges) || payload.ranges.length === 0) {
      const err = new Error('No valid page ranges provided for splitting.');
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

      const parsedRanges = parseRanges(payload.ranges);
      
      if (parsedRanges.length === 0) {
        throw new Error("Could not parse any valid ranges.");
      }

      const generatedDocs = [];

      for (const range of parsedRanges) {
        const start = Math.max(1, range.start);
        const end = Math.min(totalPages, range.end);
        
        if (start > totalPages) continue;

        const splitDoc = await PDFDocument.create();
        const indices = [];
        for (let i = start; i <= end; i++) {
          indices.push(i - 1);
        }
        
        const copiedPages = await splitDoc.copyPages(sourceDoc, indices);
        copiedPages.forEach(page => splitDoc.addPage(page));
        
        const bytes = await splitDoc.save();
        generatedDocs.push({
          name: `split_${start}-${end}.pdf`,
          buffer: Buffer.from(bytes)
        });
      }

      if (generatedDocs.length === 0) {
        throw new Error("No pages could be extracted from the provided ranges.");
      }

      if (generatedDocs.length === 1) {
        // Return single PDF
        const doc = generatedDocs[0];
        return {
          downloadData: {
            downloadFilename: doc.name,
            downloadBufferBase64: doc.buffer.toString('base64')
          },
          data: {
            filesGenerated: 1
          }
        };
      } else {
        // Zip them up
        return new Promise((resolve, reject) => {
          const bufs = [];
          const archive = new ZipArchive({ zlib: { level: 5 } });
          
          archive.on('data', data => bufs.push(data));
          
          archive.on('end', () => {
            const zipBuffer = Buffer.concat(bufs);
            resolve({
              downloadData: {
                downloadFilename: 'SplitFiles.zip',
                downloadBufferBase64: zipBuffer.toString('base64')
              },
              data: {
                filesGenerated: generatedDocs.length
              }
            });
          });
          
          archive.on('error', err => reject(err));
          
          generatedDocs.forEach(doc => {
            archive.append(doc.buffer, { name: doc.name });
          });
          
          archive.finalize();
        });
      }
    } catch (err) {
      logger.error(`[SplitOperation] Failed: ${err.message}`);
      throw new Error(`Failed to split PDF: ${err.message}`);
    }
  }
});
