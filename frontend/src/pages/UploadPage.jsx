/**
 * pages/UploadPage.jsx — Document upload landing page.
 *
 * Features:
 *   - Drag & drop zone with active state
 *   - Browse button fallback
 *   - Client-side type + size validation
 *   - Upload progress bar (from Axios onUploadProgress)
 *   - All error states handled: invalid format, too large, upload failed, server offline
 *   - On success: activates session → navigates to /workspace/:sessionId
 */

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext.jsx';
import { sessionService } from '../services/sessionService.js';
import {
  APP_NAME,
  APP_TAGLINE,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from '../constants/index.js';
import { formatBytes } from '../utils/index.js';

// ── Error message map ─────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  INVALID_TYPE: (name) =>
    `"${name}" is not a supported format. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}.`,
  TOO_LARGE: (name, size) =>
    `"${name}" is ${formatBytes(size)}, which exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
  UPLOAD_FAILED: (msg) =>
    `Upload failed: ${msg || 'An unexpected error occurred. Please try again.'}`,
  SERVER_OFFLINE:
    'Cannot reach the server. Please check your connection and try again.',
};

const UploadPage = () => {
  const navigate = useNavigate();
  const { activateSession } = useSession();
  const fileInputRef = useRef(null);

  const [isDragging,   setIsDragging]   = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [error,        setError]        = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ── Client-side validation ────────────────────────────────────────────────
  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return ERROR_MESSAGES.INVALID_TYPE(file.name);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return ERROR_MESSAGES.TOO_LARGE(file.name, file.size);
    }
    return null;
  };

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setUploading(true);
    setProgress(0);

    try {
      const data = await sessionService.uploadDocument(file, setProgress);
      activateSession(data.session);
      navigate(`/workspace/${data.session._id}`);
    } catch (err) {
      if (err.code === 'NETWORK_ERROR') {
        setError(ERROR_MESSAGES.SERVER_OFFLINE);
      } else {
        setError(ERROR_MESSAGES.UPLOAD_FAILED(err.message));
      }
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  }, [activateSession, navigate]);

  // ── Drag events ───────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  return (
    <main className="min-h-screen bg-[#121212] text-[#e0e0e0] flex flex-col items-center justify-center px-4 py-12">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="relative text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] border border-[#444444] flex items-center justify-center text-lg">
            📄
          </div>
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
        </div>
        <p className="text-sm text-gray-400 font-medium tracking-wide">{APP_TAGLINE}</p>
      </div>

      {/* ── Drop Zone ───────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-xl">
        <div
          id="upload-drop-zone"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`p-10 text-center select-none transition-all duration-200 rounded-lg border-2 border-dashed ${
            isDragging
              ? 'border-white bg-[#262626]'
              : 'border-[#444444] bg-[#1c1c1c]'
          }`}
          style={{
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Upload icon / spinner */}
          <div className="flex justify-center mb-4">
            {uploading ? (
              <div className="w-14 h-14 rounded-full border-2 border-[#444444] border-t-white flex items-center justify-center animate-spin" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[#2a2a2a] border border-[#444444] flex items-center justify-center text-2xl">
                {isDragging ? '📂' : '📎'}
              </div>
            )}
          </div>

          {/* Text */}
          {uploading ? (
            <div>
              <p className="text-gray-200 font-semibold text-base mb-1">
                Uploading {selectedFile?.name}...
              </p>
              <p className="text-gray-400 text-sm">{progress}% complete</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-200 font-semibold text-base mb-1">
                {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-gray-400 text-sm mb-4">or click to browse</p>
              <button
                id="upload-browse-button"
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-5 py-2 rounded bg-[#333333] hover:bg-[#444444] border border-[#555555] text-white text-sm font-semibold transition-all duration-200"
              >
                Browse Files
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            id="upload-file-input"
            type="file"
            className="hidden"
            accept={ALLOWED_EXTENSIONS.map(e => `.${e.toLowerCase()}`).join(',')}
            onChange={onFileChange}
            disabled={uploading}
          />
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        {uploading && (
          <div className="mt-4 h-2 rounded bg-[#2a2a2a] border border-[#444444] overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Error message ────────────────────────────────────────────────── */}
        {error && !uploading && (
          <div
            id="upload-error"
            className="mt-4 p-4 rounded bg-[#2a1a1a] border border-[#663333] text-red-300 text-sm"
          >
            <span className="mr-2">⚠️</span>{error}
          </div>
        )}

        {/* ── Supported formats ────────────────────────────────────────────── */}
        {!uploading && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
              Supported Formats
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {ALLOWED_EXTENSIONS.map((ext) => (
                <span
                  key={ext}
                  className="px-2 py-0.5 rounded text-xs font-mono bg-[#1c1c1c] border border-[#333333] text-gray-400"
                >
                  .{ext.toLowerCase()}
                </span>
              ))}
            </div>
            
            {/* Auto-conversion disclaimer */}
            <div className="max-w-md mx-auto p-3 rounded text-xs leading-relaxed text-gray-400 bg-[#181818] border border-[#333333]">
              <strong>Universal Auto-Conversion:</strong> Every supported document is automatically converted into a PDF workspace while preserving your original file untouched. All editing tools operate seamlessly on the generated PDF.
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Maximum file size: {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
};

export default UploadPage;

