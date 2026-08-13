# AI PDF Studio 📄✨

**AI PDF Studio** is a full-stack, AI-powered web application designed to make working with PDF documents simple, fast, and intelligent. 

Unlike traditional tools that force you to upload a file again and again for each small change, AI PDF Studio operates on a **Document Session architecture**: upload your document once, view it in an interactive browser viewer, perform multiple operations (like rotating, merging, splitting, or asking AI questions), and download the final result whenever you are done!

---

## 🌟 Key Features Implemented

### 1. 📖 Interactive PDF Viewer & Workspace
- Built-in high-performance **PDF.js viewer** with page navigation, zoom controls, and thumbnail sidebar.
- **Document Session & Versioning**: Work continuously on a document with full version history and restore capabilities.

### 2. ✂️ Page Manipulation Tools
- **Rotate Pages**: Rotate individual or selected pages left (-90°) or right (+90°).
- **Delete Pages**: Remove unwanted pages instantly.
- **Reorder Pages**: Drag-and-drop page thumbnails into any order.
- **Duplicate & Extract Pages**: Duplicate pages or extract selected page ranges into new PDFs.
- **Insert Pages**: Add blank pages wherever needed.
- **Page Numbers**: Add customizable header/footer page numbers.

### 3. 🔒 Document Security & Management
- **Password Protection**: Encrypt PDFs with custom passwords.
- **Remove Security**: Decrypt password-protected PDFs.
- **Permissions Control**: Restrict or allow printing, content copying, and editing.
- **Digital Signature**: Certify documents with digital signatures.

### 4. 🗜️ Document Optimization & Conversion
- **Compress PDF**: Reduce file size while keeping text and image quality.
- **Split & Merge**: Split PDFs into separate files or merge multiple PDFs into one.
- **Watermark**: Overlay text or image watermarks onto document pages.
- **Export Options**: Export PDF pages as Images, Word (`.docx`), PowerPoint (`.pptx`), or plain text (`.txt`).

### 5. 🤖 AI Document Intelligence (Gemini AI & LangChain)
- **AI Summary**: Automatically generate concise summaries of long PDF documents.
- **AI Key Insights**: Extract main takeaways, bullet points, and key figures.
- **Chat with Document**: Ask questions about your PDF and get instant, context-aware answers using RAG (LangChain + ChromaDB vectorstore + Gemini AI).
- **AI Translation**: Translate document content into multiple languages.
- **Semantic Search**: Search for concepts and meanings within your PDF beyond simple keyword matches.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Clean neutral dark theme)
- **Icons**: Lucide React
- **PDF Engine**: PDF.js (`pdfjs-dist`)
- **Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **HTTP Client**: Axios

### Backend
- **Server**: Node.js & Express API
- **Database**: MongoDB & Mongoose
- **PDF Manipulation**: `pdf-lib`, `pdf-parse`, `pdf-poppler`
- **AI Framework**: LangChain (`@langchain/community`, `@langchain/google-genai`)
- **AI Model**: Google Gemini API
- **Vector Storage**: ChromaDB (for semantic document retrieval)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally or MongoDB Atlas URI)
- **Google Gemini API Key** (set in `backend/.env`)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SahilSingh-GIT/AI-PDF-Studio.git
   cd AI-PDF-Studio
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory based on `backend/.env.example`:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/ai-pdf-studio
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Application**:
   Start both backend (Express) and frontend (Vite) concurrently with a single command:
   ```bash
   npm run dev
   ```
   - Frontend runs at `http://localhost:5173`
   - Backend API runs at `http://localhost:3001`

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
