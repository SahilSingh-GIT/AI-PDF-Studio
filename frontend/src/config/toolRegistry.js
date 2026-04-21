/**
 * config/toolRegistry.js
 * 
 * Central dictionary mapping tool IDs to their behavior and metadata.
 */

import {
  FileText, RotateCw, Trash2, Layers, FilePlus, Copy, Hash,
  Type, Image as ImageIcon, Highlighter, Underline, Strikethrough, MessageSquare,
  Crop, EyeOff, Columns, SplitSquareHorizontal, Minimize, Shield,
  FileCheck, ImagePlus, Replace, Trash, Lock, Key, Edit3, Search, Info, Droplet
} from 'lucide-react';

export const toolRegistry = {
  // DOCUMENT TOOLS
  'merge-pdfs': {
    id: 'merge-pdfs',
    title: 'Merge PDFs',
    icon: Layers,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'merge-pdfs',
    requires: ['pdf']
  },
  'split-pdf': {
    id: 'split-pdf',
    title: 'Split PDF',
    icon: SplitSquareHorizontal,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'split-pdf',
    requires: ['pdf']
  },
  'watermark': {
    id: 'watermark',
    title: 'Watermark',
    icon: Droplet,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'watermark',
    requires: ['pdf']
  },

  // DOCUMENT
  'document-info': {
    id: 'document-info',
    title: 'Document Info',
    icon: Info,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'document-info',
    requires: []
  },
  'pages': {
    id: 'pages',
    title: 'Pages',
    icon: FileText,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'pages',
    requires: ['pdf']
  },
  'search': {
    id: 'search',
    title: 'Search',
    icon: null, // Relies on Toolbar for now, but registered for consistency
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'search',
    requires: ['pdf', 'text-layer']
  },

  // PAGE MANAGEMENT
  'rotate-pages': {
    id: 'rotate-pages',
    title: 'Rotate Pages',
    icon: RotateCw,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'rotate-pages', // Unused by sidebar right panel because it's an overlay
    requires: ['pdf']
  },
  'delete-pages': {
    id: 'delete-pages',
    title: 'Delete Pages',
    icon: Trash2,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'delete-pages',
    requires: ['pdf']
  },
  'reorder-pages': {
    id: 'reorder-pages',
    title: 'Reorder Pages',
    icon: Layers,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'reorder-pages',
    requires: ['pdf']
  },
  'extract-pages': {
    id: 'extract-pages',
    title: 'Extract Pages',
    icon: FilePlus,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'extract-pages',
    requires: ['pdf']
  },
  'insert-blank-page': {
    id: 'insert-blank-page',
    title: 'Insert Blank Page',
    icon: FilePlus,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'insert-blank-page',
    requires: ['pdf']
  },
  'duplicate-pages': {
    id: 'duplicate-pages',
    title: 'Duplicate Pages',
    icon: Copy,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'duplicate-pages',
    requires: ['pdf']
  },
  'page-numbers': {
    id: 'page-numbers',
    title: 'Page Numbers',
    icon: Hash,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'page-numbers',
    requires: ['pdf']
  },


  'add-text': {
    id: 'add-text',
    title: 'Add Text',
    icon: Type,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'add-text',
    backendOperationId: 'edit-content',
    requires: ['pdf']
  },
  'delete-text': {
    id: 'delete-text',
    title: 'Delete Text',
    icon: Trash, // Or an eraser-like icon if available, Trash is fine
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'delete-text',
    backendOperationId: 'edit-content',
    requires: ['pdf']
  },
  'highlight': {
    id: 'highlight',
    title: 'Highlight',
    icon: Highlighter,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'highlight',
    backendOperationId: 'edit-content',
    requires: ['pdf']
  },
  'add-image': {
    id: 'add-image',
    title: 'Add Image',
    icon: ImageIcon,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'add-image',
    backendOperationId: 'edit-content',
    requires: ['pdf']
  },


  // EXPORT
  'export-word': {
    id: 'export-word',
    title: 'Export to Word',
    icon: FileCheck,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'export-word',
    requires: ['pdf']
  },
  'export-powerpoint': {
    id: 'export-powerpoint',
    title: 'Export to PowerPoint',
    icon: FileCheck,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'export-powerpoint',
    requires: ['pdf']
  },
  'export-images': {
    id: 'export-images',
    title: 'Export to Images',
    icon: ImageIcon,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'export-images',
    requires: ['pdf']
  },
  'export-text': {
    id: 'export-text',
    title: 'Export to Text',
    icon: FileText,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'export-text',
    requires: ['pdf']
  },

  // AI
  'ai-chat': {
    id: 'ai-chat',
    title: 'Chat',
    icon: MessageSquare,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'ai-panel',
    requires: ['pdf', 'text-layer']
  },
  'ai-summarize': {
    id: 'ai-summarize',
    title: 'Summarize',
    icon: Edit3,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'ai-panel',
    requires: ['pdf', 'text-layer']
  },
  'ai-key-insights': {
    id: 'ai-key-insights',
    title: 'Key Insights',
    icon: Key,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'ai-panel',
    requires: ['pdf', 'text-layer']
  },
  'ai-explain': {
    id: 'ai-explain',
    title: 'Explain Selection',
    icon: MessageSquare,
    status: 'coming-soon',
    panelType: 'sidebar',
    componentKey: 'coming-soon',
    requires: ['pdf', 'text-layer']
  },
  'ai-translate': {
    id: 'ai-translate',
    title: 'Translate',
    icon: Type,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'ai-panel',
    requires: ['pdf', 'text-layer']
  },
  'ai-semantic-search': {
    id: 'ai-semantic-search',
    title: 'Semantic Search',
    icon: Search,
    status: 'implemented',
    panelType: 'sidebar',
    componentKey: 'ai-panel',
    requires: ['pdf', 'text-layer']
  },

  // SECURITY
  'password-protection': {
    id: 'password-protection',
    title: 'Password Protection',
    icon: Lock,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'password-protection',
    requires: ['pdf']
  },
  'permissions': {
    id: 'permissions',
    title: 'Permissions',
    icon: Shield,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'permissions',
    requires: ['pdf']
  },
  'digital-signature': {
    id: 'digital-signature',
    title: 'Digital Signature',
    icon: Edit3,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'digital-signature',
    requires: ['pdf']
  },
  'remove-security': {
    id: 'remove-security',
    title: 'Remove Security',
    icon: Key,
    status: 'implemented',
    panelType: 'overlay',
    componentKey: 'remove-security',
    requires: ['pdf']
  }
};
