// Implements the "Chat with PDF" feature using RAG:
// Question -> Embedding -> Similarity Search -> Relevant Chunks -> Prompt -> Gemini -> Answer

import config from "../../config/env.js";
import { similaritySearchWithScore } from "../vectorstore/chromaStore.js";
import { geminiProvider } from "../providers/GeminiProvider.js";
import { buildChatPrompt, buildFallbackChatPrompt } from "../prompts/chatPrompt.js";
import { ensureDocumentPrepared } from "./documentService.js";

const TOP_K = 5;

export async function askQuestion(question, sessionId) {
  await ensureDocumentPrepared(sessionId);

  const matches = await similaritySearchWithScore(question, TOP_K);
  // We removed the strict threshold check here to ensure RAG always uses the document
  // context when the user asks a question, instead of falling back arbitrarily.


  const prompt = buildChatPrompt(question, matches);
  const answer = await geminiProvider.generateText(prompt);

  return {
    answer,
    usedDocumentContext: true,
    sources: matches.map((m) => ({ page: m.page, similarity: m.similarity })),
  };
}
