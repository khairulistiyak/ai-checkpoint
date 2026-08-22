import React from 'react';
import { useUpdateNotifier } from '../hooks/useUpdateNotifier';

export function UpdateBanner() {
  const { updateAvailable, updateInfo, dismissUpdate } = useUpdateNotifier();

  if (!updateAvailable || !updateInfo) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1e1b4b 0%, #311b92 50%, #4a148c 100%)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
      color: '#ffffff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      zIndex: 9999
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px' }}>🚀</span>
        <div>
          <strong style={{ fontSize: '13px', color: '#c4b5fd' }}>
            New Version Available ({updateInfo.latestVersion})
          </strong>
          <span style={{ fontSize: '12px', color: '#cbd5e1', marginLeft: '8px' }}>
            {updateInfo.releaseNotes || 'A new update is ready to download!'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a
          href={updateInfo.downloadUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            background: '#8b5cf6',
            color: '#ffffff',
            padding: '5px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Update Now
        </a>
        <button
          onClick={dismissUpdate}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '2px 8px'
          }}
          title="Dismiss for this version"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
