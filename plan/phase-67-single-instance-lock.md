# Phase 67: Single Instance Lock & Multi-Launch Prevention

> অ্যাপটি যাতে একসাথে একাধিকবার রান না হয়ে সবসময় একটাই ইনস্ট্যান্স চালু থাকে এবং নতুন করে রান করতে গেলে বিদ্যমান উইন্ডোটি সামনে চলে আসে তার জন্য Electron Single Instance Lock যুক্ত করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 67: Single Instance Lock & Multi-Launch Prevention

### Step 67.1 — Enforce Single Instance Lock in Electron (`electron/main.js`)
- **File:** `electron/main.js`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
`app.requestSingleInstanceLock()` এবং `app.on('second-instance')` হ্যান্ডলার যোগ করো যাতে ডুপ্লিকেট প্রসেস সাথে সাথে বন্ধ হয়ে মূল উইন্ডো ফোকাস হয়।

```javascript
const { app, BrowserWindow, ipcMain, shell } = require('electron');
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

  // Handle second instance launch
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // IPC Handlers
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
    const port = server ? server.address().port : 20226;
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
```

- **Done-check:** `test -f electron/main.js`

---

### Step 67.2 — Verify and Rebuild macOS DMG (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 67.1

**কী করতে হবে:**
```bash
./l v
./l health
./l quality
cd dashboard && npm run build
npx electron-builder --mac dmg --publish never
```

- **Done-check:** `test -f release/*.dmg`
