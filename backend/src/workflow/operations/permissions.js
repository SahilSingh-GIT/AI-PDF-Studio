import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { spawn } from 'child_process';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'permissions',
  name: 'Permissions',
  category: 'SECURITY',
  canUndo: true, 
  
  execute: async ({ document, payload }) => {
    logger.info(`[Permissions] Applying restrictions to ${document.originalName}`);
    
    const { ownerPassword, userPassword = '', allowPrint, allowCopy, allowEdit } = payload;
    
    if (!ownerPassword) {
      throw new Error('Owner password is required to set permissions.');
    }

    const pdfPath = getAbsolutePath(document.storagePath);
    const outputDir = os.tmpdir();
    const outputFileName = `permissions_${crypto.randomUUID()}.pdf`;
    const outputPath = path.join(outputDir, outputFileName);
    
    try {
      await new Promise((resolve, reject) => {
        // Build qpdf arguments for permissions
        const printArg = allowPrint ? 'y' : 'n';
        const modifyArg = allowEdit ? 'y' : 'n'; // simplified
        const extractArg = allowCopy ? 'y' : 'n';
        
        // qpdf --encrypt user-pw owner-pw 256 --print=y --modify=n --extract=n -- input.pdf output.pdf
        const args = [
          '--encrypt', userPassword, ownerPassword, '256',
          `--print=${printArg}`,
          `--modify=${modifyArg}`,
          `--extract=${extractArg}`,
          '--',
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
      try { await fs.unlink(outputPath); } catch (e) {}

      return {
        fileBuffer: encryptedBuffer,
        data: {
          message: 'Document permissions updated.'
        }
      };
    } catch (err) {
      logger.error(`[Permissions] Failed: ${err.message}`);
      throw new Error(`Failed to apply permissions: ${err.message}`);
    }
  }
});
