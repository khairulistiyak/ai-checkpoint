import React from 'react';
import { restoreProgress } from '../hooks/useFileWatcher';

export function ProgressDeleteWarningModal({ warning, onClose, onRestored, showToast }) {
  if (!warning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#18181b] border border-yellow-500/30 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-lg font-semibold text-yellow-300">PROGRESS.md Deleted</h3>
        </div>
        <p className="text-white/70 text-sm mb-6">
          PROGRESS.md deleted! Accept to recreate from template.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            onClick={async () => {
              try {
                await restoreProgress(warning.projectId || warning.id);
                showToast?.('🔄 PROGRESS.md recreated', 'success');
                onRestored?.();
              } catch {
                showToast?.('Failed to restore PROGRESS.md', 'error');
              }
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm font-medium transition-colors border border-yellow-500/30 cursor-pointer"
          >
            Accept & Recreate
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressDeleteWarningModal;
