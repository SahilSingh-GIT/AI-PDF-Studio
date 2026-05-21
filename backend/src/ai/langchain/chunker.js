// Splits page text into smaller overlapping chunks.
// Chunking makes embeddings more accurate (small focused pieces of text
// instead of giant blobs) and keeps prompts to Gemini within a safe size.

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import config from "../../config/env.js";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: config.rag.chunkSize,
  chunkOverlap: config.rag.chunkOverlap,
});

// Takes pages like [{ page: 1, text: "..." }, { page: 2, text: "..." }]
// and returns chunks like [{ page, chunkIndex, text }]
export async function chunkPages(pages) {
  const chunks = [];

  for (const page of pages) {
    if (!page.text || page.text.trim().length === 0) continue;

    const pieces = await splitter.splitText(page.text);

    pieces.forEach((pieceText, index) => {
      const trimmed = pieceText.trim();
      if (trimmed.length > 0) {
        chunks.push({
          page: page.page,
          chunkIndex: index,
          text: trimmed,
        });
      }
    });
  }

  return chunks;
}
