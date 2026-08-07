let autoUpdater = null;

try {
  ({ autoUpdater } = require('electron-updater'));
} catch {
  // electron-updater fallback in dev
}

function initAutoUpdater(mainWindow) {
  if (!autoUpdater) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', info);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', info);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }
}

async function downloadUpdate() {
  if (autoUpdater) {
    return autoUpdater.downloadUpdate();
  }
}

function installUpdate() {
  if (autoUpdater) {
    autoUpdater.quitAndInstall(false, true);
  }
}

module.exports = {
  initAutoUpdater,
  downloadUpdate,
  installUpdate,
};
