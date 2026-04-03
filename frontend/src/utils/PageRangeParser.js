/**
 * utils/PageRangeParser.js
 * 
 * Shared parser for page ranges (e.g., "1-3, 5, 8-10").
 * Used across the frontend and backend to normalize selection inputs.
 */

export const PageRangeParser = {
  /**
   * Parses a range string into a sorted, deduplicated array of integers.
   * @param {string} input - The raw range string (e.g. "1, 3, 5-8")
   * @param {number} totalPages - The maximum valid page number
   * @returns {number[]} Array of normalized page numbers
   * @throws {Error} If input contains invalid formats or out of bounds pages
   */
  parse: (input, totalPages) => {
    if (!input || typeof input !== 'string') return [];
    
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    const pages = new Set();
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        
        if (isNaN(start) || isNaN(end)) {
          throw new Error(`Invalid range format: ${part}`);
        }
        
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        
        if (min < 1 || max > totalPages) {
          throw new Error(`Page range out of bounds: ${part}`);
        }
        
        for (let i = min; i <= max; i++) {
          pages.add(i);
        }
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num)) {
          throw new Error(`Invalid page number: ${part}`);
        }
        if (num < 1 || num > totalPages) {
          throw new Error(`Page number out of bounds: ${part}`);
        }
        pages.add(num);
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  },

  /**
   * Converts an array of page numbers back into a compact string representation.
   * Useful for syncing programmatic selection back to an input field.
   * e.g. [1, 2, 3, 5, 8, 9] -> "1-3, 5, 8-9"
   */
  stringify: (pagesArray) => {
    if (!pagesArray || pagesArray.length === 0) return '';
    
    const sorted = [...new Set(pagesArray)].sort((a, b) => a - b);
    const ranges = [];
    
    let start = sorted[0];
    let end = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        if (start === end) ranges.push(`${start}`);
        else ranges.push(`${start}-${end}`);
        
        start = sorted[i];
        end = sorted[i];
      }
    }
    
    if (start === end) ranges.push(`${start}`);
    else ranges.push(`${start}-${end}`);
    
    return ranges.join(', ');
  }
};
