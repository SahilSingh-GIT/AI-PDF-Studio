import DocumentIntelligence from '../../../models/DocumentIntelligence.js';
import { IndexService } from './indexService.js';
import logger from '../../../utils/logger.js';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export class IntelligenceService {
  static async updateProcessStatus(sessionId, state, subState = null, progress = 0) {
    try {
      await DocumentIntelligence.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            'process.state': state,
            'process.subState': subState,
            'process.progress': progress
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      logger.warn(`[IntelligenceService] Failed to update process status: ${err.message}`);
    }
  }

  static async analyzeDocument(documentId, sessionId, fileInfo) {
    logger.info(`[IntelligenceService] Starting lightweight analysis for Document ${documentId}`);
    try {
      const pdfPath = fileInfo.path;
      const fileStats = fs.statSync(pdfPath);
      
      let totalPages = 0;
      let isEncrypted = false;
      let pdfMetadata = {};
      let isImageOnly = false;
      let textLength = 0;
      let wordCount = 0;

      try {
        const fileBuffer = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(fileBuffer, { updateMetadata: false });
        totalPages = pdfDoc.getPageCount();
        isEncrypted = pdfDoc.isEncrypted;
        
        // Attempt text extraction to detect searchability
        try {
          const parseData = await pdfParse(fileBuffer);
          const extractedText = parseData.text ? parseData.text : '';
          textLength = extractedText.length;
          
          // Scanned PDFs or images might have hidden garbled OCR noise or very sparse watermarks.
          // Instead of raw character length, we count actual alphabetical words to determine true searchability.
          const validWords = extractedText.match(/\b[a-zA-Z]{3,}\b/g) || [];
          wordCount = validWords.length;
          const avgWordsPerPage = totalPages > 0 ? wordCount / totalPages : 0;
          
          // A genuinely readable document should have at least 5 real words per page on average
          isImageOnly = totalPages > 0 && avgWordsPerPage < 5;
        } catch (e) {
          logger.warn(`[IntelligenceService] pdf-parse failed: ${e.message}`);
          isImageOnly = true;
        }

        pdfMetadata = {
          title: pdfDoc.getTitle() || '',
          author: pdfDoc.getAuthor() || '',
          subject: pdfDoc.getSubject() || '',
          creator: pdfDoc.getCreator() || '',
          producer: pdfDoc.getProducer() || '',
          creationDate: pdfDoc.getCreationDate() ? pdfDoc.getCreationDate().toISOString() : '',
          modificationDate: pdfDoc.getModificationDate() ? pdfDoc.getModificationDate().toISOString() : '',
        };
      } catch (err) {
        logger.warn(`[IntelligenceService] Error parsing PDF for metadata: ${err.message}`);
        isEncrypted = true; // Often throws if password is required
      }

      const rawAnalysis = {
        totalPages,
        fileSize: fileStats.size,
        fileName: path.basename(pdfPath),
        isEncrypted,
        isImageOnly,
        textLength,
        wordCount,
        ...pdfMetadata
      };

      const hasText = !isImageOnly && !isEncrypted;

      const capabilities = {
        Search: { available: hasText },
        CopyText: { available: hasText },
        AIChat: { available: hasText },
        AISummary: { available: hasText },
        Export: { available: true }
      };

      if (hasText) {
        await IndexService.indexDigitalText(documentId, sessionId, rawAnalysis);
      } else {
        logger.info(`[IntelligenceService] Document ${documentId} is image-only or encrypted. Skipping AI ingestion.`);
      }
      
      const intelligenceDoc = await DocumentIntelligence.findOneAndUpdate(
        { sessionId, documentId },
        {
          versionId: 1,
          process: { state: 'READY', subState: null, progress: 100 },
          analysis: rawAnalysis,
          intelligence: { capabilities }
        },
        { upsert: true, returnDocument: 'after' }
      );
      logger.info(`[IntelligenceService] Analysis complete`);
      return intelligenceDoc;
    } catch (error) {
      logger.error(`[IntelligenceService] Error analyzing: ${error.message}`);
      throw error;
    }
  }

  static async getReport(sessionId) {
    return await DocumentIntelligence.findOne({ sessionId });
  }
}