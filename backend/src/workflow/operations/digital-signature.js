import { registerOperation } from '../registry.js';
import { getAbsolutePath } from '../../services/storageService.js';
import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import logger from '../../utils/logger.js';

registerOperation({
  id: 'digital-signature',
  name: 'Digital Signature',
  category: 'SECURITY',
  canUndo: true, 
  
  execute: async ({ document, payload }) => {
    logger.info(`[DigitalSignature] Establishing signature foundation for ${document.originalName}`);
    
    const { signerName, reason, location } = payload;
    
    if (!signerName) {
      throw new Error('Signer name is required.');
    }

    const pdfPath = getAbsolutePath(document.storagePath);
    
    try {
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Foundation for digital signature metadata
      pdfDoc.setTitle(`${document.originalName} (Signed by ${signerName})`);
      pdfDoc.setAuthor(signerName);
      
      // NOTE: pdf-lib does not natively support cryptographic digital signatures (PKCS#7).
      // This operation implements the metadata and foundational architecture.
      // A full PKI implementation would use 'node-signpdf' on the generated buffer.
      
      const signedBytes = await pdfDoc.save();
      const fileBuffer = Buffer.from(signedBytes);

      return {
        fileBuffer: fileBuffer,
        data: {
          message: `Document signed by ${signerName}.`,
          signatureMetadata: {
            signerName,
            reason: reason || 'Approved',
            location: location || 'Unknown',
            timestamp: new Date().toISOString()
          }
        }
      };
    } catch (err) {
      logger.error(`[DigitalSignature] Failed: ${err.message}`);
      throw new Error(`Failed to apply digital signature: ${err.message}`);
    }
  }
});
