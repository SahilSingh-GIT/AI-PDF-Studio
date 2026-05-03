import React from 'react';

export const compressConfig = {
  id: 'compress-pdf',
  title: 'Compress PDF',
  hideGrid: true, // No page selection needed

  getApplyButtonText: (selectedPages, payload) => 'Compress Document',

  isValid: (selectedPages, payload) => !!payload.profile,

  renderControls: ({ payload, setPayload }) => {
    // default
    if (!payload.profile) {
      setTimeout(() => setPayload({ ...payload, profile: 'Web' }), 0);
    }

    return (
      <div className="flex flex-col gap-6 items-center p-10 w-full max-w-lg">
        <p className="text-slate-400 text-center text-sm">
          Select a compression profile. This will reduce file size by optimizing images and removing redundant data.
        </p>

        <div className="w-full flex flex-col gap-3">
          {['Web', 'Print', 'Archival'].map(profile => (
            <button
              key={profile}
              onClick={() => setPayload({ ...payload, profile })}
              className={`p-4 rounded-lg border-2 text-left transition-colors flex items-center justify-between
                ${payload.profile === profile ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'}`}
            >
              <div>
                <span className={`block font-semibold ${payload.profile === profile ? 'text-indigo-400' : 'text-slate-200'}`}>
                  {profile} Quality
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  {profile === 'Web' && 'Best for email and online sharing. Smaller size.'}
                  {profile === 'Print' && 'High quality for physical printing.'}
                  {profile === 'Archival' && 'Lossless compression for long-term storage.'}
                </span>
              </div>
              
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                ${payload.profile === profile ? 'border-indigo-500' : 'border-slate-600'}`}>
                {payload.profile === profile && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  },

  formatPayload: (selectedPages, payload) => ({
    profile: payload.profile || 'Web'
  })
};

export default compressConfig;
