import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { spawn } from 'child_process';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'password-protection',
  name: 'Password Protection',
  category: 'SECURITY',
  canUndo: true, 
  
  execute: async ({ document, payload }) => {
    logger.info(`[PasswordProtection] Applying encryption to ${document.originalName}`);
    
    const { password } = payload;
    if (!password) {
      throw new Error('Password is required for encryption.');
    }

    const pdfPath = getAbsolutePath(document.storagePath);
    const outputDir = os.tmpdir();
    const outputFileName = `encrypted_${crypto.randomUUID()}.pdf`;
    const outputPath = path.join(outputDir, outputFileName);
    
    try {
      await new Promise((resolve, reject) => {
        // qpdf --encrypt user-pw owner-pw 256 -- input.pdf output.pdf
        const args = [
          '--encrypt', password, password, '256', '--',
          pdfPath, outputPath
        ];
        
        const proc = spawn('qpdf', args);
        let stderr = '';
        proc.stderr.on('data', data => { stderr += data.toString(); });
        
        proc.on('close', code => {
          if (code !== 0) {
            reject(new Error(`qpdf failed with code ${code}: ${stderr}`));
          } else {
            resolve();
          }
        });
        
        proc.on('error', err => {
          reject(new Error(`qpdf is not available on the server. ${err.message}`));
        });
      });

      const encryptedBuffer = await fs.readFile(outputPath);
      
      // Cleanup temp file
      try { await fs.unlink(outputPath); } catch (e) {}

      return {
        fileBuffer: encryptedBuffer,
        data: {
          message: 'Document successfully encrypted.'
        }
      };
    } catch (err) {
      logger.error(`[PasswordProtection] Failed: ${err.message}`);
      throw new Error(`Failed to apply password protection: ${err.message}`);
    }
  }
});
