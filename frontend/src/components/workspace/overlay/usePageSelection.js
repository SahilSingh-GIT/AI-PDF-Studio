import { useState, useCallback } from 'react';

/**
 * usePageSelection
 * 
 * Reusable PageSelectionManager for PDF page operations.
 * Owns the state of selected pages, providing multi-select and deselection capabilities.
 */
export const usePageSelection = (initialSelection = []) => {
  const [selectedPages, setSelectedPages] = useState(initialSelection);

  const toggleSelection = useCallback((pageNumber) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber);
      }
      return [...prev, pageNumber];
    });
  }, []);

  const selectAll = useCallback((totalPages) => {
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(allPages);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPages([]);
  }, []);

  const setSelection = useCallback((pagesArray) => {
    setSelectedPages([...pagesArray]);
  }, []);

  return {
    selectedPages,
    toggleSelection,
    selectAll,
    clearSelection,
    setSelection
  };
};

export default usePageSelection;
