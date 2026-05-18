import { registerOperation } from '../registry.js';
import { extractTextFromPdf } from '../../services/textExtractionService.js';
import { HTTP_STATUS } from '../../constants/index.js';

registerOperation({
  id: 'native-search',
  name: 'Native Search',
  category: 'AI', // Kept AI as it relates to search capabilities
  icon: 'Search',
  order: 1,
  visible: true,
  status: 'AVAILABLE',
  requires: [], 
  provides: ['SEARCHABLE_TEXT'],
  supportedTypes: ['pdf'],
  canUndo: false,
  
  validate: (session, payload) => {
    if (!payload || !payload.query) {
      const err = new Error('Search query is required.');
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  },

  execute: async ({ document, payload }) => {
    // Rely on the decoupled Extraction Service to provide text
    const textContent = await extractTextFromPdf(document);
    
    const query = payload.query.toLowerCase();
    const matches = [];
    
    // Simple mock index finder for demonstration
    // In reality, this would map byte-offsets to page numbers
    let index = textContent.toLowerCase().indexOf(query);
    while (index !== -1) {
      matches.push({
        index,
        context: textContent.substring(Math.max(0, index - 30), index + query.length + 30).trim()
      });
      index = textContent.toLowerCase().indexOf(query, index + 1);
    }
    
    return {
      data: {
        query: payload.query,
        matchCount: matches.length,
        matches,
      },
    };
  }
});
