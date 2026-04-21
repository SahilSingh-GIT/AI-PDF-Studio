import { extractTextByPage } from '../../services/textExtractionService.js';
import { chunkPages } from '../langchain/chunker.js';
import { resetCollection, addChunksToStore } from '../vectorstore/chromaStore.js';
import { embeddingCache } from '../cache/embeddingCache.js';
import { summaryCache } from '../cache/summaryCache.js';
import { insightsCache } from '../cache/insightsCache.js';
import { getSessionById } from '../../services/sessionService.js';
import { getAbsolutePath } from '../../services/storageService.js';
import DocumentIntelligence from '../../models/DocumentIntelligence.js';
import fs from 'fs/promises';
import logger from '../../utils/logger.js';

export const AIStatus = {
  NOT_PREPARED: 'NOT_PREPARED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  FAILED: 'FAILED'
};

// In-memory state for the currently active document
let currentSessionId = null;
let currentState = AIStatus.NOT_PREPARED;
let activeDocument = {
  totalPages: 0,
  totalChunks: 0,
  chunks: [], 
};

/**
 * Resets the active AI document state, useful when switching to a new document.
 */
async function resetActiveState(newSessionId) {
  logger.info(`[AIDocumentService] Resetting AI state for new session ${newSessionId}`);
  currentSessionId = newSessionId;
  currentState = AIStatus.NOT_PREPARED;
  activeDocument = {
    totalPages: 0,
    totalChunks: 0,
    chunks: [],
  };
  
  await resetCollection();
  embeddingCache.clear();
  summaryCache.clear();
  insightsCache.clear();
}

/**
 * Ensures the requested session is prepared for AI operations.
 * This acts as a lazy-load / state machine for the active document.
 */
export async function ensureDocumentPrepared(sessionId) {
  if (currentSessionId !== sessionId) {
    // If the session changed, reset the state
    await resetActiveState(sessionId);
  }

  if (currentState === AIStatus.READY) {
    return; // Already prepared
  }

  if (currentState === AIStatus.PREPARING) {
    // Wait until it finishes (simple polling for this prototype/milestone)
    // In a full production system this might use an EventEmitter or Promise
    logger.debug('[AIDocumentService] Another request is already preparing the document, waiting...');
    while (currentState === AIStatus.PREPARING) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (currentState === AIStatus.READY) return;
    if (currentState === AIStatus.FAILED) throw new Error("AI Preparation failed previously.");
  }

  // We are NOT_PREPARED or FAILED. Transition to PREPARING.
  currentState = AIStatus.PREPARING;
  
  try {
    logger.info(`[AIDocumentService] Starting lazy AI preparation for session ${sessionId}`);
    
    // Check Intelligence Report for readability
    const report = await DocumentIntelligence.findOne({ sessionId });
    if (report && report.analysis && report.analysis.isImageOnly) {
      throw new Error("AI is unavailable for this document. This PDF does not contain searchable text.");
    }

    // Fetch Document metadata
    const session = await getSessionById(sessionId);
    if (!session || !session.document) {
      throw new Error("Session or Document not found.");
    }

    const absolutePath = getAbsolutePath(session.document.storagePath);
    const pdfBuffer = await fs.readFile(absolutePath);

    // 1. Extract Text
    logger.debug('[AIDocumentService] Extracting text...');
    const pages = await extractTextByPage(pdfBuffer);
    
    // 2. Chunk
    logger.debug('[AIDocumentService] Chunking text...');
    const chunks = await chunkPages(pages);

    if (chunks.length === 0) {
      throw new Error("No readable text found in this PDF.");
    }

    // 3. Ingest to Chroma
    logger.debug('[AIDocumentService] Ingesting to Chroma DB...');
    await addChunksToStore(chunks);

    activeDocument = {
      totalPages: pages.length,
      totalChunks: chunks.length,
      chunks,
    };

    currentState = AIStatus.READY;
    logger.info(`[AIDocumentService] AI preparation complete for session ${sessionId}`);

  } catch (error) {
    currentState = AIStatus.FAILED;
    logger.error(`[AIDocumentService] AI preparation failed: ${error.message}`);
    throw error;
  }
}

export function getStatus(sessionId) {
  // If requesting a different session than currently active, its status is NOT_PREPARED
  if (currentSessionId !== sessionId) {
    return AIStatus.NOT_PREPARED;
  }
  return currentState;
}

export function getFullDocumentText() {
  return activeDocument.chunks.map((chunk) => chunk.text).join("\n\n");
}

export function getChunkTexts() {
  return activeDocument.chunks.map((chunk) => chunk.text);
}

export function getPageText(pageNumber) {
  const pageChunks = activeDocument.chunks.filter(c => c.page === Number(pageNumber));
  if (pageChunks.length === 0) return null;
  return pageChunks.map(c => c.text).join("\n\n");
}
