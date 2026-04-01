/**
 * main.jsx — React application entry point.
 *
 * Responsibilities:
 *   - Import global styles
 *   - Mount the React root
 *   - Wrap with BrowserRouter for client-side routing
 *
 * Keep this file minimal — no business logic here.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/index.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('[main] Root element #root not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
