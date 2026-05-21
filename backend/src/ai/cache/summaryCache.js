// Caches the generated summary for the currently active document.
// Since there is only ever one active document, we just keep one value
// instead of keying by document id. Cleared on new upload.

let cachedSummary = null;

export const summaryCache = {
  get() {
    return cachedSummary;
  },

  set(summary) {
    cachedSummary = summary;
  },

  clear() {
    cachedSummary = null;
  },
};
