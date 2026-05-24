# AI PDF Studio: Developer Handoff

Welcome to AI PDF Studio. This document contains the absolute minimum context required to safely continue development without needing to read the entire codebase.

## Current Project Status
- **Status**: Stable & Active.
- **Current Milestone**: Core editing capabilities, Document Download, and the Professional Workspace Navigation system are fully complete and functional. The sidebar UI is now considered permanently locked.
- **Next Priorities**: Expanding operations (Merge, Split, Extract) and implementing AI/OCR capabilities.

## Architecture Summary
We use a MERN-like stack prioritizing native capabilities over heavy frameworks.
- **Frontend**: React 18, Vite. Styled with TailwindCSS.
- **Backend**: Express on Node.js. State is managed in MongoDB.
- **Data Flow**: A document is uploaded once, generating a `DocumentSession`. All subsequent frontend actions trigger backend `pdf-lib` workflows, incrementing `session.currentVersion`. The frontend `PdfViewer` implicitly re-fetches the PDF natively using cache-busting query strings (`?v=2`).

## Important Components
- `WorkspacePage.jsx`: The global layout shell.
- `DocumentViewer.jsx`: The intelligent router determining how to render the active document based on extension.
- `PdfViewer.jsx`: A high-performance, `pdfjs-dist` wrapper handling continuous vertical scrolling via `IntersectionObserver`.
- `PageOperationOverlay.jsx`: The strictly generic UI shell for all page-based document modifications.

## Important Contexts & Hooks
- `SessionContext.jsx` (`useSession`): Maintains the active `DocumentSession` and manages `localStorage` recovery.
- `WorkflowContext.jsx` (`useWorkflow`): Handles active tool state (e.g., `selectedOperation`) and dispatches commands to the backend via `executeOperation()`.
- `ThumbnailCache.js`: Crucial in-memory utility to prevent browser crashes. Renders `pdfjs` canvas elements once per version, caches them as data strings, and aggressively garbage collects old versions.

## Backend Operations
- `workflow/engine.js`: The central processing nervous system. Validates locks, creates execution plans, and runs operations sequentially.
- `workflow/registry.js`: Central dictionary of all valid tool commands.
- **Rule**: If you add a new tool (e.g. `merge-pdfs`), you must add a config file in `frontend/src/components/workspace/overlay/operations/` and register a handler in `backend/src/workflow/operations/`.

## Important Design Decisions
1. **Permanent Architecture Rule**: The workspace sidebar layout is permanently locked. Future tools must only be added by modifying the `toolRegistry.js` and `panelRegistry.js` configs. Do not redesign `Sidebar.jsx` or `WorkspacePage.jsx`.
2. **Generic Reusability**: The `PageOperationOverlay` must **never** contain tool-specific logic. All specific logic belongs in the configuration files (`*.config.jsx`).
3. **Operations in Sidebar**: Document-altering tools exist in the left Sidebar. Non-altering tools (Zoom, Download) exist in the top Toolbar.
4. **Trace Before Fix**: Silent failures are unacceptable. Log extensively, do not swallow errors, and fix root causes rather than patching symptoms.

## Known Risks & Limitations
- **Memory Pressure**: Generating hundreds of thumbnails is computationally expensive. Always rely on `ThumbnailCache` to prevent freezing the UI.
- **Undo Navigation**: The backend creates distinct `DocumentVersion` nodes allowing for non-destructive edits, but the frontend lacks the UI to navigate this history.
- **File Support**: The application currently exclusively supports `.pdf` files. Other types will hit a fallback state.

## Files Most Likely To Be Modified Next
1. `backend/src/workflow/registry.js` (To register upcoming operations)
2. `frontend/src/components/workspace/Sidebar.jsx` (To map new operation icons)
3. New files inside `backend/src/workflow/operations/`
4. New config files inside `frontend/src/components/workspace/overlay/operations/`
