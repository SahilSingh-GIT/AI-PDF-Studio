// Implements the Summary feature (NOT RAG - it reads the whole document).
// Flow: Entire document -> Chunk -> Summarize each part -> Combine -> Return

import { geminiProvider } from "../providers/GeminiProvider.js";
import { buildChunkSummaryPrompt, buildFinalSummaryPrompt } from "../prompts/summaryPrompt.js";
import { getChunkTexts, ensureDocumentPrepared } from "./documentService.js";
import { summaryCache } from "../cache/summaryCache.js";

// How many chunks we group together before asking Gemini to summarize them.
// Grouping keeps the number of API calls reasonable for a 20-100 page document.
const CHUNKS_PER_GROUP = 5;

function groupChunks(chunkTexts) {
  const groups = [];
  for (let i = 0; i < chunkTexts.length; i += CHUNKS_PER_GROUP) {
    groups.push(chunkTexts.slice(i, i + CHUNKS_PER_GROUP).join("\n\n"));
  }
  return groups;
}

export async function summarizeDocument(sessionId) {
  await ensureDocumentPrepared(sessionId);

  const cached = summaryCache.get();
  if (cached) return cached;

  const chunkTexts = getChunkTexts();
  const groups = groupChunks(chunkTexts);

  // Step 1 (map): summarize each group on its own.
  const groupSummaries = [];
  for (const group of groups) {
    const prompt = buildChunkSummaryPrompt(group);
    const summary = await geminiProvider.generateText(prompt);
    groupSummaries.push(summary);
  }

  // Step 2 (reduce): merge all the small summaries into one final summary.
  const finalPrompt = buildFinalSummaryPrompt(groupSummaries);
  const finalSummary = await geminiProvider.generateJSON(finalPrompt);

  summaryCache.set(finalSummary);
  return finalSummary;
}
