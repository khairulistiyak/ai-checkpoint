import React, { useState, useEffect } from 'react';

export function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubAvailable = window.electronAPI.onUpdateAvailable?.((info) => {
      setUpdateInfo(info);
      setDismissed(false);
    });

    const unsubDownloaded = window.electronAPI.onUpdateDownloaded?.(() => {
      setIsDownloaded(true);
      setIsDownloading(false);
    });

    return () => {
      unsubAvailable?.();
      unsubDownloaded?.();
    };
  }, []);

  if (!window.electronAPI || !updateInfo || dismissed) {
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await window.electronAPI.downloadUpdate?.();
    } catch {
      setIsDownloading(false);
    }
  };

  const handleRestart = () => {
    window.electronAPI.installUpdate?.();
  };

  return (
    <aside aria-label="Application update" className="w-full bg-gradient-to-r from-cyber-accent/20 via-blue-900/40 to-cyber-card border-b border-cyber-accent/30 px-4 py-2 flex items-center justify-between text-xs text-cyber-text-primary z-50 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span>
          {isDownloaded ? (
            <span className="font-semibold">Update ready to install (v{updateInfo.version || 'latest'})!</span>
          ) : isDownloading ? (
            <span>Downloading update v{updateInfo.version || ''}...</span>
          ) : (
            <span>A new version (v{updateInfo.version || 'latest'}) is available.</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isDownloaded ? (
          <button
            onClick={handleRestart}
            className="px-3 py-1 bg-cyber-accent text-black font-semibold rounded hover:brightness-110 transition shadow-sm cursor-pointer"
          >
            Restart Now
          </button>
        ) : (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3 py-1 bg-cyber-accent/20 border border-cyber-accent/50 text-cyan-300 rounded hover:bg-cyber-accent/30 transition disabled:opacity-50 cursor-pointer"
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="px-2 py-1 text-zinc-400 hover:text-zinc-200 transition text-xs cursor-pointer"
        >
          Later
        </button>
      </div>
    </aside>
  );
}

export default UpdateNotification;
