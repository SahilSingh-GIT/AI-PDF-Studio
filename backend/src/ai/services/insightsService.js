// Implements the Key Insights feature.
// Gemini has a large enough context window that for typical 20-100 page
// documents we can send the full text in one call and ask for structured JSON.

import { geminiProvider } from "../providers/GeminiProvider.js";
import { buildKeyInsightsPrompt } from "../prompts/insightsPrompt.js";
import { getFullDocumentText, ensureDocumentPrepared } from "./documentService.js";
import { insightsCache } from "../cache/insightsCache.js";

export async function generateKeyInsights(sessionId) {
  await ensureDocumentPrepared(sessionId);

  const cached = insightsCache.get();
  if (cached) return cached;

  const documentText = getFullDocumentText();
  const prompt = buildKeyInsightsPrompt(documentText);

  const insights = await geminiProvider.generateJSON(prompt);

  insightsCache.set(insights);
  return insights;
}
