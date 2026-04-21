/**
 * config/sidebarConfig.js
 * 
 * Defines the permanent navigation categories and ordering.
 */

import { FileText, Layers, SquarePen, Wrench, FileOutput, Sparkles, Shield } from 'lucide-react';

export const SIDEBAR_SCHEMA_VERSION = 1;

export const sidebarConfig = [
  {
    id: 'DOCUMENT',
    title: 'DOCUMENT',
    icon: FileText,
    order: 1,
    defaultExpanded: true,
    tools: ['pages', 'search']
  },
  {
    id: 'PAGE_MANAGEMENT',
    title: 'PAGE MANAGEMENT',
    icon: Layers,
    order: 2,
    defaultExpanded: true,
    tools: [
      'rotate-pages',
      'delete-pages',
      'reorder-pages',
      'extract-pages',
      'insert-blank-page',
      'duplicate-pages',
      'page-numbers'
    ]
  },
  {
    id: 'EDIT_CONTENT',
    title: 'EDIT CONTENT',
    icon: SquarePen,
    order: 3,
    defaultExpanded: true,
    tools: [
      'add-text',
      'delete-text',
      'highlight',
      'add-image'
    ]
  },
  {
    id: 'DOCUMENT_TOOLS',
    title: 'DOCUMENT TOOLS',
    icon: Wrench,
    order: 4,
    defaultExpanded: false,
    tools: [
      'merge-pdfs',
      'split-pdf',
      'watermark'
    ]
  },
  {
    id: 'EXPORT',
    title: 'EXPORT',
    icon: FileOutput,
    order: 5,
    defaultExpanded: false,
    tools: [
      'export-word',
      'export-powerpoint',
      'export-images',
      'export-text'
    ]
  },
  {
    id: 'AI',
    title: 'AI',
    icon: Sparkles,
    order: 6,
    defaultExpanded: false,
    tools: [
      'ai-chat',
      'ai-summarize',
      'ai-key-insights',
      'ai-translate',
      'ai-semantic-search'
    ]
  },
  {
    id: 'SECURITY',
    title: 'SECURITY',
    icon: Shield,
    order: 7,
    defaultExpanded: false,
    tools: [
      'password-protection',
      'permissions',
      'digital-signature',
      'remove-security'
    ]
  }
];
