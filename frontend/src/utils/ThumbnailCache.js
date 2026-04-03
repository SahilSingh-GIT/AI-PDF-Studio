/**
 * utils/ThumbnailCache.js
 *
 * An in-memory cache for PDF page thumbnails.
 * Keyed by: DocumentId, CurrentVersion, PageNumber.
 * Ensures fast rendering in the PageOperationOverlay across multiple opens.
 */

class ThumbnailCacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get the cache key for a specific page.
   */
  _getKey(documentId, version, pageNumber) {
    return `${documentId}-v${version}-p${pageNumber}`;
  }

  /**
   * Retrieve a cached thumbnail data URL.
   */
  get(documentId, version, pageNumber) {
    const key = this._getKey(documentId, version, pageNumber);
    return this.cache.get(key);
  }

  /**
   * Store a generated thumbnail data URL.
   * Automatically clears any old versions of the same document to prevent memory leaks.
   */
  set(documentId, version, pageNumber, dataUrl) {
    // Garbage collect old versions for this document before setting the new one
    this._invalidateOldVersions(documentId, version);

    const key = this._getKey(documentId, version, pageNumber);
    this.cache.set(key, dataUrl);
  }

  /**
   * Clears old versions of the document from the cache.
   */
  _invalidateOldVersions(documentId, currentVersion) {
    const prefix = `${documentId}-v`;
    const currentPrefix = `${documentId}-v${currentVersion}-`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix) && !key.startsWith(currentPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache (useful on unmount or session switch).
   */
  clear() {
    this.cache.clear();
  }
}

export const ThumbnailCache = new ThumbnailCacheManager();
