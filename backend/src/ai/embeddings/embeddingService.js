// Wraps Google's embedding model through LangChain JS.
// Every other file that needs an embedding should go through here,
// so the embedding provider can be swapped later without touching
// chat / summary / search code.

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import config from "../../config/env.js";
import { embeddingCache } from "../cache/embeddingCache.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: config.gemini.apiKey,
  model: config.gemini.embeddingModel,
});

// Embeds one piece of text (e.g. a user question or a search query).
export async function embedText(text) {
  const cached = embeddingCache.get(text);
  if (cached) return cached;

  const vector = await embeddings.embedQuery(text);
  embeddingCache.set(text, vector);
  return vector;
}

// Embeds many chunks at once (used when a new document is ingested).
export async function embedTexts(texts) {
  return embeddings.embedDocuments(texts);
}

// Exposed mainly so the Chroma vector store can reuse the same
// LangChain embeddings instance instead of creating a new one.
export function getEmbeddingsInstance() {
  return embeddings;
}
