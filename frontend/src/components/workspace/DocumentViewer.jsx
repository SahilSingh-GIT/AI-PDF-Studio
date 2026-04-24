/**
 * components/workspace/DocumentViewer.jsx
 *
 * Inspects the file type and routes to the appropriate viewer component (e.g., PdfViewer).
 * Exposes capabilities to the parent Workspace on mount.
 */

import React, { useEffect } from 'react';
import PdfViewer from './PdfViewer.jsx';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/index.js';

const DocumentViewer = ({ session, onCapabilitiesReady }) => {
  const doc = session?.document;

  useEffect(() => {
    if (doc?.extension === 'pdf') {
      onCapabilitiesReady(['zoom', 'page-nav', 'search']);
    } else {
      // Fallback
      onCapabilitiesReady(['zoom']);
    }
  }, [doc, onCapabilitiesReady]);

  if (!doc) {
    return null;
  }

  const documentUrl = `${API_BASE_URL}${API_ENDPOINTS.SESSION}/${session._id}/document?v=${session.currentVersion || 1}`;

  if (doc.extension === 'pdf') {
    return <PdfViewer documentUrl={documentUrl} />;
  }

  // Fallback for non-PDF files for now
  return (
    <div className="flex items-center justify-center h-full text-slate-400">
      Preview for .{doc.extension} files is coming soon.
    </div>
  );
};

export default DocumentViewer;
