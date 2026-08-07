const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { createTray } = require('./tray.js');
const { initAutoUpdater, downloadUpdate, installUpdate } = require('./updater.js');

process.env.ELECTRON = '1';

let mainWindow = null;
let serverInstance = null;

async function startEmbeddedServer() {
  try {
    const serverModule = await import('../dashboard/server.js');
    if (serverModule && typeof serverModule.startServer === 'function') {
      serverInstance = serverModule.startServer(0); // dynamic port
      return serverInstance;
    }
  } catch (err) {
    console.error('Failed to start embedded dashboard server:', err);
  }
  return null;
}

function createWindow(port = 20226) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'AI Checkpoint',
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

// IPC Handlers
ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('updater:download', () => downloadUpdate());
ipcMain.handle('updater:install', () => installUpdate());
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());

app.whenReady().then(async () => {
  const server = await startEmbeddedServer();
  const port = server ? server.address().port : 20226;
  createWindow(port);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(port);
    } else if (mainWindow) {
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
