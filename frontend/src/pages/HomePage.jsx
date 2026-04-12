/**
 * pages/HomePage.jsx — Milestone 1 landing page.
 *
 * Displays ONLY the required verification output:
 *   "AI PDF Studio"
 *   "Project Initialized Successfully"
 *
 * This page will be replaced by the Document Session workspace in Milestone 2.
 */

import { APP_NAME, APP_TAGLINE } from '../constants/index.js';

const HomePage = () => {
  return (
    <main className="min-h-screen bg-[#121212] text-[#e0e0e0] flex flex-col items-center justify-center px-4">

      {/* ── Main card ────────────────────────────────────────────────────────── */}
      <div className="relative bg-[#1c1c1c] border border-[#333333] rounded-lg p-12 text-center max-w-lg w-full shadow-lg">

        {/* Logo mark */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-lg bg-[#2a2a2a] border border-[#444444] flex items-center justify-center text-2xl">
            📄
          </div>
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">
          {APP_NAME}
        </h1>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 mt-4 bg-[#262626] border border-[#444444]">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-200">
            Project Initialized Successfully
          </span>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mt-2">
          {APP_TAGLINE}
        </p>

        {/* Divider */}
        <div className="my-8 border-t border-[#333333]" />

        {/* Milestone indicator */}
        <div className="space-y-2 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Milestone 1 · Foundation
          </p>
          {[
            { label: 'React + Vite + Tailwind CSS', done: true },
            { label: 'Express API Server',          done: true },
            { label: 'Modular Architecture',        done: true },
            { label: 'Development Scripts',         done: true },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`text-xs ${done ? 'text-green-400' : 'text-gray-500'}`}>
                {done ? '✓' : '○'}
              </span>
              <span className={`text-sm ${done ? 'text-gray-300' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* ── Footer note ──────────────────────────────────────────────────────── */}
      <p className="mt-8 text-xs text-gray-500">
        Milestone 2 · Document Session &amp; Workspace coming next
      </p>

    </main>
  );
};

export default HomePage;

