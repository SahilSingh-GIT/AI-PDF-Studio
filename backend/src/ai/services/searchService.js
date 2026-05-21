// Implements the Semantic Search feature.
// Flow: Embedding -> Similarity Search -> Top Results

import { similaritySearchWithScore } from "../vectorstore/chromaStore.js";
import { ensureDocumentPrepared } from "./documentService.js";

const DEFAULT_TOP_K = 5;

export async function semanticSearch(query, sessionId, topK = DEFAULT_TOP_K) {
  await ensureDocumentPrepared(sessionId);

  const results = await similaritySearchWithScore(query, topK);

  // Snippet = first ~200 characters of the matching chunk, so the
  // frontend doesn't have to render a huge wall of text per result.
  return results.map((result) => ({
    page: result.page,
    snippet: result.text.slice(0, 200).trim() + (result.text.length > 200 ? "..." : ""),
    similarity: Number(result.similarity.toFixed(4)),
  }));
}
