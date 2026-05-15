import React, { createContext, useContext, useState, useCallback } from 'react';

const OverlayContext = createContext(null);

export const OverlayProvider = ({ children }) => {
  const [overlays, setOverlays] = useState([]);
  const [defaultOptions, setDefaultOptions] = useState({});
  const [placementMode, setPlacementMode] = useState(false);

  const addOverlay = useCallback((overlay) => {
    setOverlays((prev) => [...prev, overlay]);
  }, []);

  const updateOverlay = useCallback((id, updates) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  }, []);

  const deleteOverlay = useCallback((id) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const clearOverlays = useCallback(() => {
    setOverlays([]);
  }, []);

  const value = {
    overlays,
    defaultOptions,
    placementMode,
    addOverlay,
    updateOverlay,
    deleteOverlay,
    clearOverlays,
    setDefaultOptions,
    setPlacementMode,
  };

  return (
    <OverlayContext.Provider value={value}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error('useOverlay must be used within an <OverlayProvider>');
  }
  return ctx;
};

export default OverlayContext;
