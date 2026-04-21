import { generateKeyInsights } from "../services/insightsService.js";

export async function insightsController(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "Field 'sessionId' is required." });
    }
    const insights = await generateKeyInsights(sessionId);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
}
