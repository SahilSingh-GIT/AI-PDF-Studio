export class TimeoutManager {
  /**
   * Calculates a reasonable timeout in milliseconds based on the page count.
   * Small PDFs (1-30 pages) get 60 seconds.
   * Medium (30-100 pages) get 3 minutes.
   * Large (100-500 pages) get 5 minutes.
   * Massive (500+ pages) get 10 minutes.
   * @param {number} pageCount 
   * @returns {number} Timeout in milliseconds
   */
  static getTimeoutForPageCount(pageCount = 1) {
    if (pageCount <= 30) return 60 * 1000;
    if (pageCount <= 100) return 3 * 60 * 1000;
    if (pageCount <= 500) return 5 * 60 * 1000;
    return 10 * 60 * 1000;
  }
}
