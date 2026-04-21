import { translateContent } from "../services/translateService.js";
import { getSupportedLanguages } from "../prompts/translatePrompt.js";

export async function translateController(req, res, next) {
  try {
    const { language, sessionId, source, pageNumber } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Field 'sessionId' is required." });
    }
    if (!language) {
      return res.status(400).json({
        error: `Field 'language' is required. Supported: ${getSupportedLanguages().join(", ")}`,
      });
    }

    const result = await translateContent(language, sessionId, source, pageNumber);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
