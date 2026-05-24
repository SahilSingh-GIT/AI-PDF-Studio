# AI PDF Studio: Project Architecture

## Project Vision
AI PDF Studio is a production-quality, AI-powered document workspace designed to deliver professional-grade PDF tools entirely within a unified, seamless UI.

### Upload Once → Work Continuously → Download Once
The core philosophy is eliminating the standard web tool friction (uploading, processing, downloading, and re-uploading for the next tool). Instead, users upload a document once to establish an active **Document Session**. They then apply a chain of editing, AI, and extraction tools in real-time within a single workspace, and download the final product once their workflow is complete.

## Overall Application Architecture
The application is a standard modern MERN-like stack without heavy frameworks. 
- **Frontend**: React + Vite, styled with TailwindCSS, running on `npm run dev --prefix frontend`.
- **Backend**: Express + Node.js, connected to MongoDB, running on `node --watch` (nodemon equivalent via Node 18+).
- **PDF Manipulation**: Heavy lifting occurs on the backend using `pdf-lib`, isolating complexity from the frontend and allowing robust multi-step workflows.

## Document Session Architecture
The Document Session (`DocumentSession` Mongo model and `SessionContext` React context) acts as the source of truth for the entire workspace.
- **Session ID (`sessionId`)**: Acts as the unique identifier for a user's workflow journey. Stored locally in `localStorage` for seamless recovery on page reloads.
- **`currentVersion`**: Integer tracker identifying the active document state. Increments sequentially upon every successful modification.
- **Capabilities Matrix**: Defines which tools are available based on the document type, current state, and applied operations.

## Backend Architecture
The backend strictly follows a layered architecture:
- **Routes & Controllers (`workflowController.js`)**: Handle API ingress, schema validation, and formatting standardized JSON responses.
- **Workflow Engine (`engine.js`)**: The core orchestrator. 
  1. Validates Session locks to prevent race conditions.
  2. Queries the Execution Planner.
  3. Delegates execution to the Executor.
  4. Returns the fully hydrated `updatedSession` back to the controller.
- **Operation Registry (`registry.js`)**: A centralized dictionary mapping operation IDs (e.g., `rotate-pages`) to their backend implementation logic.
- **Storage Service (`storageService.js`)**: Abstracts all physical file management, saving processed buffers back to the file system or GridFS.

## Frontend Architecture
The frontend is built to resemble a high-end native desktop application.
- **Workspace Shell (`WorkspacePage.jsx`)**: The primary layout container rendering the Sidebar, Toolbar, DocumentViewer, and StatusBar.
- **Context Hierarchy**:
  1. `SessionProvider`: Manages the active session state and `localStorage` syncing.
  2. `WorkflowProvider`: Manages available categories, active operation selection, and execution dispatching.
- **Viewer Refresh Strategy**: The PDF Viewer relies exclusively on `documentUrl?v=${session.currentVersion}`. When the version increments, the viewer automatically and natively discards the old document and fetches the new one without a page reload.
- **Thumbnail Cache Architecture**: `ThumbnailCache.js` handles in-memory persistence of PDF page canvas renders. Keys are strictly bound to `${documentId}-${version}-${pageNumber}`. The cache includes logic to instantly garbage-collect stale versions to prevent memory leaks during long editing sessions.

## Generic Component Philosophy
We build architecture, not just features. No component should contain hardcoded logic for specific features unless absolutely necessary.
- **Sidebar vs Toolbar**: 
  - **Toolbar** is strictly for Viewer Controls (Zoom, Page Nav, Download).
  - **Sidebar** is strictly for Document Operations (Rotate, Delete, Reorder, OCR, AI).
- **Page Operation Overlay (`PageOperationOverlay.jsx`)**: A generic modal shell for page-based operations. It acts purely as a state machine (`Idle -> Preparing -> Ready -> Executing -> Completed / Failed`) and dynamic renderer.
- **Configuration Driven (`*.config.jsx`)**: Specific operations like Rotate or Reorder inject their unique logic, payload formatting, and UI controls into the generic Overlay via static configuration objects.

## Technology Stack
- **Frontend**: React 18, Vite, TailwindCSS, Lucide-React
- **Frontend PDF**: `pdfjs-dist` (Viewer & Thumbnails)
- **Frontend Drag-and-Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Backend PDF**: `pdf-lib` (Document Manipulation)

## Engineering Principles & Coding Standards
1. **Trace Before Fix**: Never fix a bug by assumption. Trace data from source to destination.
2. **Zero Silent Failures**: Errors must not be swallowed. Surface them cleanly to the user and log them in the backend.
3. **Preserve Existing Functionality**: No new feature is complete if it breaks an existing feature (e.g., Viewer continuous scrolling).
4. **Build Like a Product**: Empty states, loading spinners, intuitive tooltips, and graceful degradation are requirements, not nice-to-haves.
5. **No Placeholders**: Never fake functionality. If it's implemented, it genuinely works.

## Future Maintenance Rule
This `PROJECT_ARCHITECTURE.md` file defines the stable baseline of AI PDF Studio. It must **only** be updated if a fundamental shift in architecture (e.g., moving from Express to gRPC, or changing the core Session logic) takes place. Minor feature additions should be logged in `PROJECT_STATE.md`.
