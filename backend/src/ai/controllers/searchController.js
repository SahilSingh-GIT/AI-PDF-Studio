import { semanticSearch } from "../services/searchService.js";

export async function searchController(req, res, next) {
  try {
    const { query, topK, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Field 'sessionId' is required." });
    }
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Field 'query' is required." });
    }

    const results = await semanticSearch(query, sessionId, topK || undefined);
    res.json({ results });
  } catch (err) {
    next(err);
  }
}
