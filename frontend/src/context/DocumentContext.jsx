/**
 * context/DocumentContext.jsx — Document Index Service
 *
 * Single source of truth for the active document's text and indexing data.
 * Background-indexes the PDF upon load. 
 * Exposes search functionality that returns structured match objects.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

const DocumentContext = createContext(null);

export const useDocumentIndex = () => useContext(DocumentContext);

export const DocumentProvider = ({ documentUrl, children }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  
  // Active search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatches, setActiveMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // Security state
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const passwordCallbackRef = useRef(null);
  
  const submitPassword = useCallback((password) => {
    if (passwordCallbackRef.current) {
      setIsUnlocking(true);
      setPasswordError(false);
      passwordCallbackRef.current(password);
    }
  }, []);

  // The actual background index: Array of pages, each with fullText and items mapped
  const indexRef = useRef([]);

  useEffect(() => {
    if (!documentUrl) {
      setPdfDoc(null);
      indexRef.current = [];
      setActiveMatches([]);
      return;
    }

    let cancelled = false;

    const loadAndIndex = async () => {
      try {
        setPdfDoc(null);
        setIsIndexing(false);
        setIndexProgress(0);
        indexRef.current = [];
        setActiveMatches([]);
        setCurrentMatchIndex(-1);

        const loadingTask = pdfjsLib.getDocument({ url: documentUrl });
        
        loadingTask.onPassword = (updatePassword, reason) => {
          setIsPasswordRequired(true);
          setIsUnlocking(false);
          // reason === 2 means incorrect password
          if (reason === 2) {
            setPasswordError(true);
          }
          passwordCallbackRef.current = updatePassword;
        };

        const doc = await loadingTask.promise;
        if (cancelled) return;

        setIsPasswordRequired(false);
        setIsUnlocking(false);
        setPasswordError(false);

        setPdfDoc(doc);
        setIsIndexing(true);

        const numPages = doc.numPages;
        const pageIndexes = [];

        // Process sequentially to not block the main thread too heavily
        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const textContent = await page.getTextContent();
          
          let fullText = '';
          const itemsData = [];

          textContent.items.forEach((item, itemIndex) => {
            const text = item.str;
            // PDF.js strings sometimes lack spaces; we add a space if there's an EOL or just generally
            // to make sure words don't stick together. 
            const separator = item.hasEOL ? '\n' : ' ';
            const segment = text + separator;
            
            itemsData.push({
              itemIndex,
              start: fullText.length,
              end: fullText.length + text.length, // excluding separator for exact bounding box mapping
              str: text,
              transform: item.transform,
              width: item.width,
              height: item.height
            });
            
            fullText += segment;
          });

          pageIndexes.push({
            pageNumber: i,
            fullText,
            itemsData
          });

          setIndexProgress(Math.round((i / numPages) * 100));
        }

        if (cancelled) return;
        indexRef.current = pageIndexes;
        setIsIndexing(false);

      } catch (err) {
        if (!cancelled) {
          if (err.name === 'PasswordException') {
            setIsPasswordRequired(true);
            setIsUnlocking(false);
          } else {
            console.error('Failed to index PDF:', err);
          }
          setIsIndexing(false);
        }
      }
    };

    loadAndIndex();

    return () => {
      cancelled = true;
    };
  }, [documentUrl]);

  // ── Search Implementation ──────────────────────────────────────────────────
  const search = useCallback((query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setActiveMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];
    let globalMatchIndex = 0;

    indexRef.current.forEach((pageData) => {
      let startIndex = 0;
      let matchPos;

      while ((matchPos = pageData.fullText.toLowerCase().indexOf(lowerQuery, startIndex)) !== -1) {
        const matchEnd = matchPos + query.length;
        
        // Find which items overlap with this match
        const overlappingItems = pageData.itemsData.filter(
          item => (matchPos < item.end && matchEnd > item.start)
        );

        if (overlappingItems.length > 0) {
          results.push({
            id: `match_${pageData.pageNumber}_${globalMatchIndex++}`,
            page: pageData.pageNumber,
            text: pageData.fullText.substring(
              Math.max(0, matchPos - 30), 
              Math.min(pageData.fullText.length, matchEnd + 30)
            ).replace(/\n/g, ' '), // Snippet
            startOffset: matchPos,
            endOffset: matchEnd,
            overlappingItems, // Pass items so UI can draw bounding boxes relative to viewport
            boundingBoxes: overlappingItems.map(item => ({
              // Raw PDF coordinate data for future AI tools
              transform: item.transform,
              width: item.width,
              height: item.height
            }))
          });
        }
        
        startIndex = matchPos + 1;
      }
    });

    setActiveMatches(results);
    setCurrentMatchIndex(results.length > 0 ? 0 : -1);
  }, []);

  const nextMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => 
      prev === -1 ? -1 : (prev + 1) % activeMatches.length
    );
  }, [activeMatches.length]);

  const prevMatch = useCallback(() => {
    setCurrentMatchIndex((prev) => 
      prev === -1 ? -1 : (prev - 1 + activeMatches.length) % activeMatches.length
    );
  }, [activeMatches.length]);

  const goToMatch = useCallback((index) => {
    if (index >= 0 && index < activeMatches.length) {
      setCurrentMatchIndex(index);
    }
  }, [activeMatches.length]);

  return (
    <DocumentContext.Provider value={{
      pdfDoc,
      isIndexing,
      indexProgress,
      search,
      searchQuery,
      activeMatches,
      currentMatchIndex,
      nextMatch,
      prevMatch,
      goToMatch,
      isPasswordRequired,
      passwordError,
      isUnlocking,
      submitPassword
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
