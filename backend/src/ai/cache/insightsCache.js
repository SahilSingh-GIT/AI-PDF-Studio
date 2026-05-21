// Caches the generated Key Insights JSON for the currently active document.
// Same "single active document" idea as summaryCache.js.

let cachedInsights = null;

export const insightsCache = {
  get() {
    return cachedInsights;
  },

  set(insights) {
    cachedInsights = insights;
  },

  clear() {
    cachedInsights = null;
  },
};
