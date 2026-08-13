// Wraps Google's embedding model through LangChain JS.
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import config from "../../config/env.js";
import { embeddingCache } from "../cache/embeddingCache.js";
import logger from "../../utils/logger.js";

let embeddingsInstance = null;
let currentApiKey = null;

export function getEmbeddingsInstance() {
  const apiKey = process.env.GEMINI_API_KEY || config.gemini.apiKey;
  if (!apiKey) {
    logger.error('[EmbeddingService] GEMINI_API_KEY is missing');
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in your server environment settings.");
  }

  if (!embeddingsInstance || currentApiKey !== apiKey) {
    currentApiKey = apiKey;
    embeddingsInstance = new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: config.gemini.embeddingModel || 'text-embedding-004',
    });
  }
  return embeddingsInstance;
}

export async function embedText(text) {
  const cached = embeddingCache.get(text);
  if (cached) return cached;

  const embeddings = getEmbeddingsInstance();
  const vector = await embeddings.embedQuery(text);
  embeddingCache.set(text, vector);
  return vector;
}

export async function embedTexts(texts) {
  const embeddings = getEmbeddingsInstance();
  return embeddings.embedDocuments(texts);
}

