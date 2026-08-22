import { useState, useEffect } from 'react';

export function useUpdateNotifier() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        let result = null;
        if (window.electronAPI?.checkForUpdates) {
          result = await window.electronAPI.checkForUpdates();
        } else {
          const res = await fetch('/version.json');
          if (res.ok) {
            const data = await res.json();
            const current = '1.0.0';
            if (data.version && data.version !== current) {
              result = {
                updateAvailable: true,
                currentVersion: current,
                latestVersion: data.version,
                releaseNotes: data.releaseNotes,
                downloadUrl: data.downloadUrl
              };
            }
          }
        }

        if (result && result.updateAvailable) {
          const savedDismissed = localStorage.getItem(`dismissed_update_${result.latestVersion}`);
          if (!savedDismissed) {
            setUpdateInfo(result);
          }
        }
      } catch (e) {
        console.warn('Update check failed:', e.message);
      }
    }

    check();
  }, []);

  const dismissUpdate = () => {
    if (updateInfo?.latestVersion) {
      localStorage.setItem(`dismissed_update_${updateInfo.latestVersion}`, 'true');
    }
    setDismissed(true);
  };

  return {
    updateAvailable: !!updateInfo && !dismissed,
    updateInfo,
    dismissUpdate
  };
}
