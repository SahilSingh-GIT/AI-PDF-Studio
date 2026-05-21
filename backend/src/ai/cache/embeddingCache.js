// Very simple in-memory cache for embeddings.
// Since there is only one active document and one user at a time,
// we don't need anything fancier than a plain Map.
// This gets cleared whenever a new document is ingested (see documentService.js).

const cacheMap = new Map();

export const embeddingCache = {
  get(text) {
    return cacheMap.get(text);
  },

  set(text, vector) {
    cacheMap.set(text, vector);
  },

  clear() {
    cacheMap.clear();
  },

  size() {
    return cacheMap.size;
  },
};
