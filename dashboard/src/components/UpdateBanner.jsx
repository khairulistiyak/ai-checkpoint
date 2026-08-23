import React from 'react';
import { useUpdateNotifier } from '../hooks/useUpdateNotifier';

export function UpdateBanner() {
  const { updateAvailable, updateInfo, dismissUpdate } = useUpdateNotifier();

  if (!updateAvailable || !updateInfo) return null;

  return (
    <div className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#1e1b4b] via-[#311b92] to-[#4a148c] border-b border-purple-500/30 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <span className="text-base sm:text-lg select-none">🚀</span>
        <div className="flex flex-wrap items-center gap-x-2">
          <strong className="text-xs sm:text-sm font-semibold text-purple-200">
            New Version Available ({updateInfo.latestVersion})
          </strong>
          <span className="text-xs text-slate-300">
            {updateInfo.releaseNotes || 'A new update is ready to download!'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <a
          href={updateInfo.downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1 rounded-md text-xs font-semibold no-underline transition-colors shadow-sm"
        >
          Update Now
        </a>
        <button
          onClick={dismissUpdate}
          className="bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer text-sm px-2 py-1 transition-colors"
          title="Dismiss for this version"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
