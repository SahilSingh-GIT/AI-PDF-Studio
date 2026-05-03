import React from 'react';

export const passwordProtectionConfig = {
  id: 'password-protection',
  title: 'Password Protection',
  supportsSelection: false,
  supportsDrag: false,
  hideGrid: true,
  
  getApplyButtonText: () => 'Apply Password',
    
  isValid: (selectedPages, payload) => !!payload.password,

  renderControls: ({ payload, setPayload }) => {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="w-16 h-16 bg-[#2a2a2a] border border-[#444444] rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <div className="text-center mb-4 max-w-md">
          <h3 className="text-xl font-bold text-gray-200 mb-2">Encrypt Document</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Protect your PDF from unauthorized access. Users will be required to enter this password before they can view the document contents.
          </p>
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-2">
          <label className="text-sm font-medium text-gray-300">Set Document Password</label>
          <input
            type="password"
            value={payload.password || ''}
            onChange={(e) => setPayload({ ...payload, password: e.target.value })}
            placeholder="Enter password to encrypt document..."
            className="px-4 py-2.5 bg-[#161616] border border-[#444444] rounded text-white focus:outline-none focus:border-[#666666] transition-all placeholder:text-gray-500 text-sm"
          />
        </div>
      </div>
    );
  },

  renderPreview: () => null,

  formatPayload: (selectedPages, payload) => ({
    password: payload.password
  })
};

export const removeSecurityConfig = {
  id: 'remove-security',
  title: 'Remove Security',
  supportsSelection: false,
  supportsDrag: false,
  hideGrid: true,
  
  getApplyButtonText: () => 'Remove Security',
    
  isValid: (selectedPages, payload) => !!payload.password,

  renderControls: ({ payload, setPayload }) => {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="w-16 h-16 bg-[#2a2a2a] border border-[#444444] rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div className="text-center mb-4 max-w-md">
          <h3 className="text-xl font-bold text-gray-200 mb-2">Remove Encryption</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Permanently decrypt this document. This will create a new version of the PDF that can be opened without a password.
          </p>
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-2">
          <label className="text-sm font-medium text-gray-300">Current Password</label>
          <input
            type="password"
            value={payload.password || ''}
            onChange={(e) => setPayload({ ...payload, password: e.target.value })}
            placeholder="Enter current password to unlock..."
            className="px-4 py-2.5 bg-[#161616] border border-[#444444] rounded text-white focus:outline-none focus:border-[#666666] transition-all placeholder:text-gray-500 text-sm"
          />
        </div>
      </div>
    );
  },

  renderPreview: () => null,

  formatPayload: (selectedPages, payload) => ({
    password: payload.password
  })
};

export const permissionsConfig = {
  id: 'permissions',
  title: 'Document Permissions',
  supportsSelection: false,
  supportsDrag: false,
  hideGrid: true,
  
  getApplyButtonText: () => 'Apply Permissions',
    
  isValid: (selectedPages, payload) => !!payload.ownerPassword,

  renderControls: ({ payload, setPayload }) => {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="w-16 h-16 bg-[#2a2a2a] border border-[#444444] rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
        </div>
        <div className="text-center mb-4 max-w-md">
          <h3 className="text-xl font-bold text-gray-200 mb-2">Document Permissions</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Restrict editing, printing, and copying. You must set an owner password to enforce these permissions.
          </p>
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-2">
          <label className="text-sm font-medium text-gray-300">Owner Password (Required)</label>
          <input
            type="password"
            value={payload.ownerPassword || ''}
            onChange={(e) => setPayload({ ...payload, ownerPassword: e.target.value })}
            placeholder="Password to change permissions..."
            className="px-4 py-2.5 bg-[#161616] border border-[#444444] rounded text-white focus:outline-none focus:border-[#666666] transition-all placeholder:text-gray-500 text-sm"
          />
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-3 mt-2">
          <label className="text-sm font-medium text-gray-300">Allowed Actions</label>
          
          <div className="flex items-center gap-3">
            <input type="checkbox" id="allowPrint" checked={!!payload.allowPrint}
              onChange={(e) => setPayload({ ...payload, allowPrint: e.target.checked })}
              className="w-4 h-4 text-white bg-[#222222] border-[#444444] rounded focus:ring-1 focus:ring-white" />
            <label htmlFor="allowPrint" className="text-sm text-gray-300">Printing</label>
          </div>
          
          <div className="flex items-center gap-3">
            <input type="checkbox" id="allowCopy" checked={!!payload.allowCopy}
              onChange={(e) => setPayload({ ...payload, allowCopy: e.target.checked })}
              className="w-4 h-4 text-white bg-[#222222] border-[#444444] rounded focus:ring-1 focus:ring-white" />
            <label htmlFor="allowCopy" className="text-sm text-gray-300">Copying Content</label>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="allowEdit" checked={!!payload.allowEdit}
              onChange={(e) => setPayload({ ...payload, allowEdit: e.target.checked })}
              className="w-4 h-4 text-white bg-[#222222] border-[#444444] rounded focus:ring-1 focus:ring-white" />
            <label htmlFor="allowEdit" className="text-sm text-gray-300">Editing Document</label>
          </div>
        </div>
      </div>
    );
  },

  renderPreview: () => null,

  formatPayload: (selectedPages, payload) => ({
    ownerPassword: payload.ownerPassword,
    allowPrint: !!payload.allowPrint,
    allowCopy: !!payload.allowCopy,
    allowEdit: !!payload.allowEdit
  })
};

export const digitalSignatureConfig = {
  id: 'digital-signature',
  title: 'Digital Signature',
  supportsSelection: false,
  supportsDrag: false,
  hideGrid: true,
  
  getApplyButtonText: () => 'Sign Document',
    
  isValid: (selectedPages, payload) => !!payload.signerName,

  renderControls: ({ payload, setPayload }) => {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="w-16 h-16 bg-[#2a2a2a] border border-[#444444] rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        <div className="text-center mb-4 max-w-md">
          <h3 className="text-xl font-bold text-gray-200 mb-2">Digital Signature</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Certify this document with a digital signature to guarantee its authenticity and integrity.
          </p>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-2">
          <label className="text-sm font-medium text-gray-300">Signer Name</label>
          <input
            type="text"
            value={payload.signerName || ''}
            onChange={(e) => setPayload({ ...payload, signerName: e.target.value })}
            placeholder="John Doe"
            className="px-4 py-2.5 bg-[#161616] border border-[#444444] rounded text-white focus:outline-none focus:border-[#666666] transition-all placeholder:text-gray-500 text-sm"
          />
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-2 mt-2">
          <label className="text-sm font-medium text-gray-300">Reason</label>
          <input
            type="text"
            value={payload.reason || ''}
            onChange={(e) => setPayload({ ...payload, reason: e.target.value })}
            placeholder="Approved"
            className="px-4 py-2.5 bg-[#161616] border border-[#444444] rounded text-white focus:outline-none focus:border-[#666666] transition-all placeholder:text-gray-500 text-sm"
          />
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-2 mt-2">
          <label className="text-sm font-medium text-gray-300">Location</label>
          <input
            type="text"
            value={payload.location || ''}
            onChange={(e) => setPayload({ ...payload, location: e.target.value })}
            placeholder="e.g. New York, USA"
            className="px-4 py-2.5 bg-[#161616] border border-[#444444] rounded text-white focus:outline-none focus:border-[#666666] transition-all placeholder:text-gray-500 text-sm"
          />
        </div>
      </div>
    );
  },

  renderPreview: () => null,

  formatPayload: (selectedPages, payload) => ({
    signerName: payload.signerName,
    reason: payload.reason,
    location: payload.location
  })
};

