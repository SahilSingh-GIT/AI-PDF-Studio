import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import os from 'os';
import { ZipArchive } from 'archiver';
import { Poppler } from 'node-poppler';
import crypto from 'crypto';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'export-images',
  name: 'Export to Images',
  category: 'EXPORT',
  canUndo: false,
  
  execute: async ({ document }) => {
    logger.info(`[ExportImages] Generating image exports for ${document.originalName}`);
    
    const outputDir = path.join(os.tmpdir(), `img_export_${crypto.randomUUID()}`);
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
      const pdfPath = getAbsolutePath(document.storagePath);
      
      const popplerOpts = {
        pngFile: true
      };
      
      try {
        const poppler = new Poppler();
        await poppler.pdfToCairo(pdfPath, path.join(outputDir, 'page'), popplerOpts);
      } catch (err) {
        logger.error(`[ExportImages] Poppler failed: ${err.message}`);
        throw new Error('Document renderer (Poppler) is not available on the server or failed to render.');
      }
      
      const files = await fs.readdir(outputDir);
      const imageFiles = files.filter(f => f.endsWith('.png'));
        
      if (imageFiles.length === 0) {
        throw new Error('No pages were rendered from the PDF.');
      }

      // Create a ZIP archive of all the images
      const zipPath = path.join(os.tmpdir(), `zip_${crypto.randomUUID()}.zip`);
      
      await new Promise((resolve, reject) => {
        const output = createWriteStream(zipPath);
        const archive = new ZipArchive({ zlib: { level: 9 } });
        
        output.on('close', resolve);
        archive.on('error', reject);
        
        archive.pipe(output);
        archive.directory(outputDir, false);
        archive.finalize();
      });

      const zipBuffer = await fs.readFile(zipPath);
      const downloadBufferBase64 = zipBuffer.toString('base64');
      const baseName = document.originalName.replace(/\.pdf$/i, '');

      // Cleanup zip file
      try { await fs.unlink(zipPath); } catch (e) {}

      return {
        downloadData: {
          downloadFilename: `${baseName}_Images.zip`,
          downloadBufferBase64: downloadBufferBase64,
        },
        data: {
          message: 'Exported successfully as a ZIP of PNG images.'
        }
      };
    } catch (err) {
      logger.error(`[ExportImages] Failed: ${err.message}`);
      throw new Error(`Failed to export to Images: ${err.message}`);
    } finally {
      // Cleanup temp images
      try {
        await fs.rm(outputDir, { recursive: true, force: true });
      } catch (e) {
        logger.error(`[ExportImages] Failed to clean up temp dir ${outputDir}`);
      }
    }
  }
});
