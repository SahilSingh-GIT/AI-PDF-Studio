# Architecture Decision Record — AI PDF Studio

## Overview

This document records the architectural decisions made during Milestone 1 and provides context for future milestones.

---

## ADR-001: Document Session as the Core Entity

**Decision**: The application is centered on a `DocumentSession` entity, not on individual tools.

**Rationale**: Traditional PDF tools treat each operation as a standalone experience. A user uploading a PDF to compress it must re-upload if they also want to rotate it. This is broken UX.

**Consequence**: Every feature implemented after Milestone 1 must operate against an active session, not against a freshly uploaded file.

```
DocumentSession {
  id:         UUID
  documentId: string
  createdAt:  Date
  updatedAt:  Date
  operations: Operation[]
  metadata:   DocumentMetadata
}
```

---

## ADR-002: Operations Pattern

**Decision**: Every capability (Rotate, Merge, Compress, OCR, AI Summary, Chat) is treated as a typed `Operation` applied to the active session — not as a standalone route or page.

**Rationale**: This allows the frontend to render any operation result in a unified workspace, and allows the backend to queue, retry, or chain operations consistently.

**Consequence**: Future controllers and services must follow the Operation interface:

```
Operation {
  type:      OperationType   (e.g., 'rotate', 'compress', 'ocr')
  sessionId: UUID
  params:    object
  status:    'pending' | 'processing' | 'done' | 'failed'
  result:    object | null
  error:     string | null
  createdAt: Date
  updatedAt: Date
}
```

---

## ADR-003: Strict Layer Separation

**Decision**: The application enforces a five-layer architecture with no cross-layer communication.

```
Layer 1 — React UI
  Only communicates with Layer 2 via the Axios instance (services/api.js).

Layer 2 — Express API (controllers + routes)
  Controllers are thin: receive request → validate → call service → return response.
  No business logic in controllers.

Layer 3 — Business Services
  Framework-agnostic JavaScript. No Express imports.
  Contains all decision-making logic.

Layer 4 — Document Processing
  Libraries and utilities that work directly with PDF bytes.
  (pdf-lib, pdf2pic, tesseract.js, LangChain, Gemini SDK)

Layer 5 — Storage
  File system (uploads/, temp/), future: object storage (S3/GCS).
```

---

## ADR-004: ES Modules Throughout

**Decision**: Both frontend and backend use ES Modules (`import`/`export`). CommonJS is forbidden.

**Rationale**: Consistency, tree-shaking support, and alignment with the modern JavaScript ecosystem.

**Consequence**: All `package.json` files set `"type": "module"`. No `require()` calls.

---

## ADR-005: Centralized Environment Config

**Decision**: All environment variable access is funneled through `backend/src/config/env.js`.

**Rationale**: If a required variable is missing, the error is caught at startup rather than at runtime during a user request. All variables have documented defaults.

**Consequence**: No module imports directly from `process.env`. All config is imported from `config/env.js`.

---

## ADR-006: Frontend Path Alias

**Decision**: The `@/` alias maps to `frontend/src/`. All internal imports use `@/`.

**Rationale**: Eliminates fragile relative path imports (`../../components/Button`) that break when files are moved.

**Consequence**: `vite.config.js` defines the alias. All imports must use `@/` for internal modules.

---

## ADR-007: API Proxy in Development

**Decision**: Vite's dev server proxies `/api/*` requests to `http://localhost:3001` during development.

**Rationale**: Avoids CORS issues in development without requiring environment-specific Axios base URLs.

**Consequence**: The frontend uses `/api/...` as paths in development. The `VITE_API_BASE_URL` env variable targets the production backend.

---

## ADR-008: Rate Limiting at the Route Level

**Decision**: A global rate limiter is applied to all `/api/*` routes. A stricter limiter is reserved for sensitive routes (upload, auth).

**Rationale**: Protects the server from abuse without impacting the health check endpoint (explicitly skipped).

**Consequence**: Future routes such as `/api/sessions` (document upload) must apply the `strictLimiter` from `config/rateLimit.js`.

---

## Future Architecture Considerations

### Background Jobs (Milestone 8+)
When OCR and AI processing are added, long-running operations must be offloaded to a job queue (BullMQ + Redis). The `Operation` entity will be created synchronously and updated asynchronously as the job progresses. The frontend will poll or use WebSockets to receive updates.

### Caching (Milestone 10+)
Parsed PDF metadata and AI-generated summaries must be cached to avoid reprocessing. Redis is the planned cache layer. The service layer will check the cache before invoking processing.

### Authentication (Future)
When multi-user support is added, session ownership must be validated. JWTs issued on document upload will be verified by a middleware applied to all session-scoped routes.

### Storage (Future)
The `uploads/` directory is suitable for single-server development. For production, a cloud object storage adapter (S3/GCS) must replace direct filesystem writes. The service layer must use an abstract `StorageAdapter` interface so the storage backend can be swapped without changing business logic.
