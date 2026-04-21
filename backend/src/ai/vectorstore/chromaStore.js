// Thin wrapper around Chroma so the rest of the app never talks to
// Chroma directly. This makes it easy to swap the vector store later
// if the real project ever needs to (though the prompt asks us to
// stick with Chroma for now).

import { Chroma } from "@langchain/community/vectorstores/chroma";
import config from "../../config/env.js";
import { getEmbeddingsInstance } from "../embeddings/embeddingService.js";

let vectorStore = null;
let currentSessionId = null;

// Because there is only ever ONE active document at a time, we always
// use the same collection name and simply clear + rebuild it whenever
// a new document is uploaded. But to be absolutely safe against cross-contamination,
// we use the sessionId in the collection name.
async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const collectionName = currentSessionId ? `pdf_studio_${currentSessionId}` : config.chroma.collectionName;

  vectorStore = await Chroma.fromExistingCollection(getEmbeddingsInstance(), {
    collectionName,
    url: config.chroma.url,
  }).catch(() => {
    // Collection does not exist yet, initialize the client wrapper directly.
    return new Chroma(getEmbeddingsInstance(), {
      collectionName,
      url: config.chroma.url,
    });
  });

  return vectorStore;
}

// Wipes the current collection so the "active document" can be replaced
// by a fresh one. Simplest possible way to enforce "single active document".
export async function resetCollection(sessionId = null) {
  // If switching sessions, clear the old reference and update session ID
  if (sessionId) {
    currentSessionId = sessionId;
    vectorStore = null;
  }
  
  const store = await getVectorStore();
  try {
    await store.delete({ filter: {} });
  } catch (err) {
    // If the collection was already empty, delete() may throw. That's fine.
  }
}

// Adds chunks (with page/chunkIndex metadata) to the vector store.
export async function addChunksToStore(chunks) {
  const store = await getVectorStore();

  const texts = chunks.map((chunk) => chunk.text);
  const metadatas = chunks.map((chunk) => ({
    page: chunk.page,
    chunkIndex: chunk.chunkIndex,
  }));

  await store.addDocuments(
    texts.map((text, i) => ({ pageContent: text, metadata: metadatas[i] }))
  );
}

// Runs a similarity search and returns results together with their score.
// Score is a distance value from Chroma -> we convert it to a 0-1
// "similarity" number where higher = more similar.
export async function similaritySearchWithScore(query, topK = 5) {
  const store = await getVectorStore();
  const results = await store.similaritySearchWithScore(query, topK);

  return results.map(([doc, distance]) => ({
    text: doc.pageContent,
    page: doc.metadata.page,
    similarity: 1 / (1 + distance), // simple distance -> similarity conversion
  }));
}
