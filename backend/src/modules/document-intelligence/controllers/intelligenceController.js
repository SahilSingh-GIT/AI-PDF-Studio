import logger from '../../../utils/logger.js';
import { IntelligenceService } from '../services/intelligenceService.js';
import DocumentSession from '../../../models/DocumentSession.js';
import Document from '../../../models/Document.js';
import DocumentIntelligence from '../../../models/DocumentIntelligence.js';
import { getAbsolutePath } from '../../../services/storageService.js';

export const analyzeDocument = async (req, res) => {
  try {
    const { sessionId, documentId } = req.body;
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const fileInfo = { path: getAbsolutePath(doc.storagePath) };
    
    // Kick off intelligence background service
    const report = await IntelligenceService.analyzeDocument(documentId, sessionId, fileInfo);
    
    res.status(200).json({ message: 'Analysis complete', report });
  } catch (error) {
    logger.error(`[IntelligenceController] Analyze error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};



export const getStatus = async (req, res) => {
  try {
    const doc = await DocumentIntelligence.findOne({ sessionId: req.params.sessionId });
    if (!doc) return res.status(200).json({ process: null });
    res.status(200).json({ process: doc.process });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReport = async (req, res) => {
  try {
    const doc = await DocumentIntelligence.findOne({ sessionId: req.params.sessionId });
    if (!doc) return res.status(200).json({ report: null });
    res.status(200).json({ report: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};