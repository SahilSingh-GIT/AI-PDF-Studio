import React from 'react';

const createExportConfig = (id, title, buttonText, message) => ({
  id,
  title,
  supportsSelection: false,
  supportsDrag: false,
  
  getApplyButtonText: () => buttonText,
    
  isValid: () => true,

  renderControls: () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border-b border-white/5 w-full text-center">
        <p className="text-slate-300 text-sm">{message}</p>
      </div>
    );
  },

  renderPreview: () => null,

  formatPayload: () => ({})
});

export const exportWordConfig = createExportConfig(
  'export-word',
  'Export to Word',
  'Export to DOCX',
  'Generate a best-effort editable Word document from this PDF. Text and images will be preserved where possible.'
);

export const exportPowerPointConfig = createExportConfig(
  'export-powerpoint',
  'Export to PowerPoint',
  'Export to PPTX',
  'Generate a high-fidelity PowerPoint presentation. Each page will be rendered as a high-resolution slide.'
);

export const exportTextConfig = createExportConfig(
  'export-text',
  'Export to Text',
  'Export to TXT',
  'Extract all text from the PDF into a plain text file. Note: Image-based PDFs may require OCR first.'
);

export const exportImagesConfig = createExportConfig(
  'export-images',
  'Export to Images',
  'Export to ZIP (Images)',
  'Render every page as a high-resolution PNG image, bundled in a ZIP archive.'
);
