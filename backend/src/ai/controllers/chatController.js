import { askQuestion } from "../services/chatService.js";

export async function chatController(req, res, next) {
  try {
    const { question, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Field 'sessionId' is required." });
    }
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Field 'question' is required." });
    }

    const result = await askQuestion(question, sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
