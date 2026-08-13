import { Chroma } from "@langchain/community/vectorstores/chroma";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import config from "../../config/env.js";
import { getEmbeddingsInstance } from "../embeddings/embeddingService.js";
import logger from "../../utils/logger.js";

let vectorStore = null;
let currentSessionId = null;
let isMemoryStore = false;

async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const collectionName = currentSessionId ? `pdf_studio_${currentSessionId}` : config.chroma.collectionName;

  try {
    const embeddings = getEmbeddingsInstance();
    const store = new Chroma(embeddings, {
      collectionName,
      url: config.chroma.url,
    });
    // Test if Chroma is reachable
    await store.ensureCollection();
    vectorStore = store;
    isMemoryStore = false;
  } catch (err) {
    logger.warn(`[ChromaStore] Chroma DB unavailable (${err.message}). Falling back to MemoryVectorStore.`);
    vectorStore = new MemoryVectorStore(getEmbeddingsInstance());
    isMemoryStore = true;
  }

  return vectorStore;
}

export async function resetCollection(sessionId = null) {
  if (sessionId) {
    currentSessionId = sessionId;
  }
  if (vectorStore && !isMemoryStore) {
    try {
      await vectorStore.delete({ filter: {} });
    } catch (err) {
      // Ignore clear errors if collection is empty
    }
  }
  vectorStore = null;
}

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

export async function similaritySearchWithScore(query, topK = 5) {
  const store = await getVectorStore();
  const results = await store.similaritySearchWithScore(query, topK);

  return results.map(([doc, distance]) => ({
    text: doc.pageContent,
    page: doc.metadata.page,
    similarity: isMemoryStore ? (1 - distance) : (1 / (1 + distance)),
  }));
}

