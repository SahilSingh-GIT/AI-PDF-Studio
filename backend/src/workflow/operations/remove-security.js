import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { spawn } from 'child_process';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'remove-security',
  name: 'Remove Security',
  category: 'SECURITY',
  canUndo: true, 
  
  execute: async ({ document, payload }) => {
    logger.info(`[RemoveSecurity] Decrypting ${document.originalName}`);
    
    const { password } = payload;
    if (!password) {
      throw new Error('Current password is required to remove security.');
    }

    const pdfPath = getAbsolutePath(document.storagePath);
    const outputDir = os.tmpdir();
    const outputFileName = `decrypted_${crypto.randomUUID()}.pdf`;
    const outputPath = path.join(outputDir, outputFileName);
    
    try {
      await new Promise((resolve, reject) => {
        // qpdf --decrypt --password=password input.pdf output.pdf
        const args = [
          '--decrypt', `--password=${password}`,
          pdfPath, outputPath
        ];
        
        const proc = spawn('qpdf', args);
        let stderr = '';
        proc.stderr.on('data', data => { stderr += data.toString(); });
        
        proc.on('close', code => {
          if (code !== 0) {
            reject(new Error(`qpdf failed (incorrect password?): ${stderr}`));
          } else {
            resolve();
          }
        });
        
        proc.on('error', err => {
          reject(new Error(`qpdf is not available on the server. ${err.message}`));
        });
      });

      const decryptedBuffer = await fs.readFile(outputPath);
      
      try { await fs.unlink(outputPath); } catch (e) {}

      return {
        fileBuffer: decryptedBuffer,
        data: {
          message: 'Security removed successfully.'
        }
      };
    } catch (err) {
      logger.error(`[RemoveSecurity] Failed: ${err.message}`);
      throw new Error(`Failed to remove security: ${err.message}`);
    }
  }
});
