# AI PDF Studio: Project State

**Last Updated**: (Current Milestone Completion)
*This document always represents the living, actual implemented state of the codebase.*

## Current Milestone
**Professional Workspace Navigation Milestone** (Completed)
Established the permanent, locked navigation foundation for AI PDF Studio using a configuration-driven, category-based UI. Separated config into `sidebarConfig.js`, `toolRegistry.js`, and `panelRegistry.js` for infinite scalability without workspace redesigns.

## Completed Milestones
1. **Architecture Stabilization**: Unified backend and frontend structure.
2. **Session Restoration**: Persisting session state through browser reloads via `localStorage` and `SessionContext`.
3. **EventBus Removal**: Transitioned entirely to React Context-driven reactivity.
4. **Continuous PDF Viewer**: Custom wrapper around `pdfjs-dist` ensuring seamless vertical scrolling, lazy loading via `IntersectionObserver`, and smooth rendering.
5. **Generic Workflow Engine**: Complete backend pipeline consisting of Planner, Executor, and Registry.
6. **PDF Editor Foundation**: Implemented `PageOperationOverlay`, `ThumbnailCache`, and dynamic config-driven operations (Rotate, Delete, Reorder).
7. **Document Download**: Enabled downloading the strictly current, edited document using native `fetch` and caching strategies, adhering to the "Download Once" philosophy.
8. **Professional Workspace Navigation**: Redesigned the Sidebar to be configuration-driven, categorized by intent, with strict separation between layout and tool implementation logic.

## Implemented Features
- Document Upload and Initial Session Creation
- Native PDF Viewer with Zoom, Page Navigation, and Continuous Scrolling
- Local Storage Session Resumption
- Thumbnail Cache with aggressive Garbage Collection
- Seamless Viewer Refresh (Version Query Bumping)
- **Document Editor Features**:
  - Rotate Pages (Specific angles)
  - Delete Pages (With minimum page validations)
  - Reorder Pages (Smooth drag-and-drop using `@dnd-kit`)
- **Document Download**: Fetch-based secure download for actively edited session documents with `_edited` filename resolution.
- **Permanent Sidebar UI**: Collapsible categories, `localStorage` persistence, and generic `ComingSoonPanel` for 25+ future tools perfectly mapped in `toolRegistry`.

## Pending Features
- Merge Documents
- Split Document
- Compress PDF
- AI Chat & Summarization
- OCR Processing
- Extract Pages
- Conversion (PDF to Word, etc.)

## Current Folder Structure
```
/backend
  /src
    /controllers    (workflowController.js, sessionController.js)
    /models         (DocumentSession.js, DocumentVersion.js)
    /routes         (api routes)
    /services       (storageService.js)
    /workflow       (engine.js, registry.js, planner.js, executor.js)
      /operations   (rotate.js, delete.js, reorder.js)

/frontend
  /src
    /components
      /workspace
        /overlay
          /operations (rotate.config.jsx, delete.config.jsx, reorder.config.jsx)
          PageOperationOverlay.jsx
          PageThumbnailGrid.jsx
          PageThumbnailCard.jsx
          OperationFooter.jsx
        /panels
          ComingSoonPanel.jsx
        Sidebar.jsx
        Toolbar.jsx
        StatusBar.jsx
        DocumentViewer.jsx
        PdfViewer.jsx
        RightPanel.jsx
    /config
      sidebarConfig.js
      toolRegistry.js
      panelRegistry.js
    /context        (SessionContext.jsx, WorkflowContext.jsx)
    /pages          (WorkspacePage.jsx)
    /services       (sessionService.js, workflowService.js)
    /utils          (ThumbnailCache.js)
```

## Current Context Providers
- **`SessionContext`**: Source of truth for `DocumentSession` object, API loading states, and `localStorage` syncing.
- **`WorkflowContext`**: Manages the registry of frontend tools, tracks the active `selectedOperation`, and provides the `executeOperation` dispatcher.

## Current Hooks
- **`useSession()`**: Exposes `session`, `document`, `activateSession`, `clearSession`.
- **`useWorkflow()`**: Exposes `categories`, `selectedOperation`, `isExecuting`, `executeOperation`.
- **`usePageSelection()`**: Specific to operations. Manages multi-select states (toggle, select all, clear).

## Backend Operations & Workflow Pipeline
All backend tasks go through `executeWorkflow()` inside `engine.js`. 
- **Currently Registered**: `rotate-pages`, `delete-pages`, `reorder-pages`.
- **Logic**: Each delegates to `pdf-lib` via scripts in `/backend/src/workflow/operations/`.
- **Versioning**: `executor.js` manages creating a new Mongoose `DocumentVersion` and tracking `workflowHistory`. The API returns the full `DocumentSession` back to the frontend.

## Overlay System & Panels
- **`PageOperationOverlay.jsx`**: Global generic modal. Reacts to `WorkflowContext.selectedOperation` if `panelType === 'overlay'`.
- **`RightPanel.jsx`**: Replaces the fixed right-hand Document Properties. Reacts to `WorkflowContext.selectedOperation` if `panelType === 'sidebar'`, dynamically loading the component mapped in `panelRegistry.js`.
- **Configurations (`src/config/*`)**:
  - `sidebarConfig.js`: Layout categories and order.
  - `toolRegistry.js`: Single source of truth for tool metadata (`status`, `panelType`, `componentKey`).
  - `panelRegistry.js`: Serializable mapping to React components (e.g., `ComingSoonPanel`).

## Current Libraries
- **React 18** + **Vite** + **TailwindCSS** + **Lucide React**
- **PDF.js (`pdfjs-dist`)**: Read-only rendering and thumbnail extraction.
- **pdf-lib**: Backend byte-level PDF modification.
- **@dnd-kit**: State-of-the-art drag-and-drop toolkit.
- **MongoDB + Mongoose**: Data layer.
- **Express**: API Routing.

## Current Viewer Architecture
- `WorkspacePage` holds the global view.
- `DocumentViewer` acts as an intelligent router based on file extension (currently routes to `PdfViewer`).
- `PdfViewer` constructs the PDF and iterates through pages.
- Uses `IntersectionObserver` to track the currently visible page and sync back to the Toolbar.
- Reloads implicitly whenever `session.currentVersion` increments.

## Known Limitations
- "Undo" functionality is prepared in the backend models (`DocumentVersion`), but no frontend UI exists to traverse the version history yet.
- Only `.pdf` files are supported currently. The UI has fallback text for other extensions.

## Important Implementation Decisions
- **Permanent Architecture Rule**: The workspace sidebar layout is now locked. Future features will only change tool `status` in the `toolRegistry.js` and assign production components via `panelRegistry.js`. The `Sidebar.jsx` and `WorkspacePage.jsx` layout files should never be structurally altered again.
- **Thumbnail Memory Management**: Rendering large PDFs into hundreds of canvas elements crashes browsers. Thumbnails are rendered once, converted to `dataUrl` strings via `canvas.toDataURL()`, cached by version, and the canvas is discarded.
- **Full Session Payload Return**: `executeWorkflow` in the backend was explicitly modified to return the fully populated `DocumentSession` object so the frontend context can instantly sync the workspace state.

## Recent Refactoring
- Removed `EventBus` in favor of strict `Context` boundaries.
- Re-routed `backend/src/controllers/workflowController.js` to ensure the session object is securely extracted from the engine payload.
