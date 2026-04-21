import fs from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { getAbsolutePath } from './storageService.js';
import logger from '../utils/logger.js';

/**
 * Extract raw text from a PDF document.
 * This service abstracts the underlying extraction library (pdf-parse)
 * away from the Workflow Engine and operations.
 * 
 * @param {object} document - The Document Mongoose model instance
 * @returns {Promise<string>} The extracted text
 */
export const extractTextFromPdf = async (document) => {
  try {
    const absolutePath = getAbsolutePath(document.storagePath);
    const dataBuffer = await fs.readFile(absolutePath);
    
    // pdf-parse extracts the full text
    const data = await pdfParse(dataBuffer);
    
    logger.debug(`[TextExtractionService] Extracted ${data.text.length} characters from ${document.originalName}`);
    return data.text;
  } catch (err) {
    logger.error(`[TextExtractionService] Failed to extract text: ${err.message}`);
    throw new Error('Failed to extract text from document');
  }
};

/**
 * Extracts text from a PDF buffer, page by page.
 * We keep page numbers because Semantic Search needs to report
 * which page a matching snippet came from.
 * 
 * @param {Buffer} pdfBuffer - The raw PDF buffer
 * @returns {Promise<Array<{page: number, text: string}>>} Array of page objects
 */
export const extractTextByPage = async (pdfBuffer) => {
  const pages = [];

  // pdf-parse calls this once per page while parsing.
  // We use it to capture text per page instead of one big blob.
  const options = {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");

      pages.push({
        page: pages.length + 1,
        text: pageText,
      });

      return pageText;
    },
  };

  try {
    await pdfParse(pdfBuffer, options);
    return pages;
  } catch (err) {
    logger.error(`[TextExtractionService] Failed to extract text by page: ${err.message}`);
    throw new Error('Failed to extract text by page from document');
  }
};

export default {
  extractTextFromPdf,
  extractTextByPage,
};
