# AI PDF Studio

> **Upload Once. Work Continuously. Download Once.**

AI PDF Studio is a production-quality, AI-powered document workspace built for the browser. It is **not** a collection of PDF tools — it is a unified workspace where a single uploaded document becomes the active session, and every capability operates on that session.

---

## Vision

Most PDF tools are a collection of isolated pages (Compress PDF, Merge PDF, Rotate PDF). AI PDF Studio is architecturally different:

- **Document Session First** — the uploaded document becomes the root entity. Every feature operates on the session, not on its own.
- **Operations, Not Pages** — Rotate, OCR, Compress, AI Summary, and Chat are *operations* applied to the document session, not independent tools.
- **AI-Native** — AI features (summarization, semantic search, chat, smart tagging) are first-class capabilities, not add-ons.
- **Scalable** — built to grow from a simple viewer into a full document intelligence platform.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite 5, Tailwind CSS 3, React Router DOM 6, Axios |
| Backend    | Node.js ≥18, Express 4, ES Modules            |
| Security   | Helmet, CORS, express-rate-limit              |
| Middleware | Morgan, Compression, Cookie-Parser, Multer    |
| Dev Tools  | Concurrently, node --watch                    |

---

## Folder Structure

```
PDF-StudioAI/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/         Static assets (icons, images, fonts)
│   │   ├── components/     Shared, reusable UI components
│   │   ├── layouts/        Layout wrapper components (shell, sidebar)
│   │   ├── pages/          Page-level components
│   │   ├── routes/         Centralized route definitions
│   │   ├── context/        React Context providers
│   │   ├── hooks/          Custom React hooks
│   │   ├── services/       API service layer (Axios instance)
│   │   ├── utils/          Pure utility functions
│   │   ├── constants/      App-wide constants
│   │   ├── styles/         Global CSS, design tokens
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/         Env, CORS, rate limiting config
│   │   ├── controllers/    Request handlers (thin, call services)
│   │   ├── routes/         Express routers
│   │   ├── middleware/     Custom middleware (error, 404, logging)
│   │   ├── services/       Business logic (framework-agnostic)
│   │   ├── models/         Data models / schema definitions
│   │   ├── validators/     Request validation schemas
│   │   ├── utils/          Backend utility functions
│   │   ├── constants/      Shared backend constants
│   │   ├── uploads/        Uploaded file storage (gitignored)
│   │   ├── temp/           Temporary processing files (gitignored)
│   │   ├── logs/           Log output (gitignored)
│   │   ├── app.js          Express app factory
│   │   └── server.js       HTTP server bootstrap
│   ├── package.json
│   └── .env.example
│
├── docs/
│   └── ARCHITECTURE.md
│
├── .gitignore
├── package.json            Root orchestrator (concurrently)
└── README.md
```

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd PDF-StudioAI

# 2. Install all dependencies (root + frontend + backend)
npm run install:all

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your values
```

---

## Development Commands

| Command              | Description                                         |
|----------------------|-----------------------------------------------------|
| `npm run dev`        | Start both frontend and backend concurrently        |
| `npm run frontend`   | Start only the React frontend (port 5173)           |
| `npm run backend`    | Start only the Express backend (port 3001)          |
| `npm run install:all`| Install dependencies for root, frontend, and backend|

---

## Architecture

```
React UI (port 5173)
     │
     │  HTTP / Axios
     ▼
Express API (port 3001)
     │
     │  Service calls
     ▼
Business Services
     │
     │  Processing calls
     ▼
Document Processing
     │
     │  Storage I/O
     ▼
Storage (uploads/, temp/)
```

### Key Architecture Principles

1. **Document Session First** — all features are operations on a session entity, not independent tools.
2. **Operations Pattern** — each capability (rotate, OCR, compress, chat) is a typed operation applied to the active session.
3. **Strict Separation** — UI → API → Services → Processing → Storage. No layer skips.
4. **Modular by Design** — every layer can be swapped or scaled independently.
5. **No Framework Lock-in** — business services are pure JavaScript, not tied to Express.

---

## API Reference

| Endpoint          | Method | Description             |
|-------------------|--------|-------------------------|
| `/api/health`     | GET    | Server health check     |

---

## Milestone Roadmap

| Milestone | Focus                                                       | Status      |
|-----------|-------------------------------------------------------------|-------------|
| 1         | Project Foundation & Architecture                           | ✅ Complete  |
| 2         | Document Session, Upload, PDF Viewer                        | 🔜 Next     |
| 3         | Core PDF Operations (Rotate, Merge, Split, Compress)        | 📋 Planned  |
| 4         | OCR Integration                                             | 📋 Planned  |
| 5         | AI Summary & Smart Tagging (Gemini)                         | 📋 Planned  |
| 6         | AI Chat with Document (RAG)                                 | 📋 Planned  |
| 7         | Semantic Search                                             | 📋 Planned  |
| 8         | Background Jobs (BullMQ + Redis)                            | 📋 Planned  |
| 9         | Version History & Undo                                      | 📋 Planned  |
| 10        | Document Caching & Performance                              | 📋 Planned  |

---

## Coding Standards

- **JavaScript only** — TypeScript is not used.
- **ES Modules** — `import`/`export` everywhere, no CommonJS.
- **Small, focused modules** — one responsibility per file.
- **Constants over magic strings** — import from `constants/index.js`.
- **Services own business logic** — controllers are thin request handlers.
- **Hooks own component logic** — components are thin render functions.
- **Clean architecture layers** — no layer reaches into another's layer.
- **Environment variables** — loaded via `config/env.js`, never from `process.env` directly.
- **Error handling** — always use `next(err)`, never `res.json` in error paths.

---

## License

MIT © AI PDF Studio Team
