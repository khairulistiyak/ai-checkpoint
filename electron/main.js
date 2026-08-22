const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { createTray } = require('./tray.js');
const { initAutoUpdater, downloadUpdate, installUpdate } = require('./updater.js');

process.env.ELECTRON = '1';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow = null;
  let serverInstance = null;

  async function startEmbeddedServer() {
    try {
      const serverModule = await import('../dashboard/server.js');
      if (serverModule && typeof serverModule.startServer === 'function') {
        serverInstance = serverModule.startServer(0);
        return serverInstance;
      }
    } catch (err) {
      console.error('Failed to start embedded dashboard server:', err);
    }
    return null;
  }

  function createWindow(port = 20226) {
    const iconPath = process.platform === 'win32'
      ? path.join(__dirname, '..', 'build-resources', 'icon.ico')
      : path.join(__dirname, '..', 'build-resources', 'icon.png');

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      title: 'AI Checkpoint',
      icon: iconPath,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      backgroundColor: '#09090b',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      const indexPath = path.join(__dirname, '..', 'dashboard', 'dist', 'index.html');
      mainWindow.loadFile(indexPath, { query: { port: String(port) } });
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    createTray(mainWindow);
    initAutoUpdater(mainWindow);
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.handle('dialog:open-directory', async () => {
    if (!mainWindow) return null;
    const res = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Project Directory',
      properties: ['openDirectory', 'createDirectory']
    });
    return (!res.canceled && res.filePaths && res.filePaths[0]) || null;
  });
  ipcMain.handle('app:version', () => app.getVersion());
  ipcMain.handle('updater:download', () => downloadUpdate());
  ipcMain.handle('updater:install', () => installUpdate());
  ipcMain.handle('shell:open-external', (_event, url) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      return shell.openExternal(url);
    }
  });
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('window:close', () => mainWindow?.close());

  app.whenReady().then(async () => {
    const server = await startEmbeddedServer();
    if (!server) {
      dialog.showErrorBox(
        'AI Checkpoint — Server Failed',
        'The backend server could not start.\n\nPlease try running from terminal:\n  ai-checkpoint --no-sandbox\n\nOr check the logs for details.'
      );
      app.quit();
      return;
    }
    const port = server.address().port;
    createWindow(port);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(port);
      } else if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
  });

  app.on('before-quit', () => {
    app.isQuitting = true;
    if (serverInstance && typeof serverInstance.close === 'function') {
      serverInstance.close();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
