import { getStatus, ensureDocumentPrepared } from '../services/documentService.js';
import logger from '../../utils/logger.js';

export async function statusController(req, res, next) {
  try {
    const { sessionId } = req.query; // status is a GET request, so it uses query params
    
    if (!sessionId) {
      return res.status(400).json({ error: "Query parameter 'sessionId' is required." });
    }

    const status = getStatus(sessionId);
    res.json({ status });
  } catch (err) {
    next(err);
  }
}

export const getAIStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    const status = getStatus(sessionId);
    return res.status(200).json({ success: true, status });
  } catch (error) {
    next(error);
  }
};

export const prepareDocument = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    // Fire and forget (don't await) so we can respond immediately
    ensureDocumentPrepared(sessionId).catch(err => {
      logger.error(`[StatusController] Background preparation failed: ${err.message}`);
    });

    // The status should transition to PREPARING synchronously or soon after.
    // We return PREPARING directly so the frontend knows it was accepted.
    return res.status(202).json({ success: true, status: 'PREPARING' });
  } catch (error) {
    next(error);
  }
};
