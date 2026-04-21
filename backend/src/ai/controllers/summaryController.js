import { summarizeDocument } from "../services/summaryService.js";

export async function summaryController(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "Field 'sessionId' is required." });
    }
    const summary = await summarizeDocument(sessionId);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
}
