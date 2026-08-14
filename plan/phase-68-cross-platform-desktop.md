# Phase 68: Cross-Platform Desktop Perfection

> AI Checkpoint ডেক্সটপ অ্যাপকে macOS (DMG, ZIP), Windows (NSIS .exe, Portable .exe), এবং Linux (AppImage, .deb)-এর জন্য প্রোডাকশন-রেডি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 68: Cross-Platform Desktop Perfection

### Step 68.1 — Generate True Native Cross-Platform Icons (`scripts/generate-icons.cjs`)
- **File:** `scripts/generate-icons.cjs`
- **Action:** CREATE
- **Depends:** None

**কী করতে হবে:**
`sips` এবং Node.js Buffer ব্যবহার করে `build-resources/` এ আসল `.icns`, multi-resolution `.ico` (16, 32, 48, 64, 128, 256), `.png` এবং `icon-tray.png` তৈরি করার স্বয়ংক্রিয় স্ক্রিপ্ট তৈরি করো ও রান করো।

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const resDir = path.join(rootDir, 'build-resources');
const basePng = path.join(resDir, 'icon.png');

// 1. Convert icon.png to true 512x512 PNG
execSync(`sips -s format png "${basePng}" -o "${basePng}"`, { stdio: 'ignore' });

// 2. Generate macOS .icns
const icnsPath = path.join(resDir, 'icon.icns');
execSync(`sips -s format icns "${basePng}" -o "${icnsPath}"`, { stdio: 'ignore' });

// 3. Generate 32x32 tray icon
const trayPath = path.join(resDir, 'icon-tray.png');
execSync(`sips -z 32 32 "${basePng}" -o "${trayPath}"`, { stdio: 'ignore' });

// 4. Generate Windows multi-resolution .ico
const sizes = [16, 32, 48, 64, 128, 256];
const pngs = [];
for (const s of sizes) {
  const tmpPath = path.join(rootDir, `.tmp_icon_${s}.png`);
  execSync(`sips -z ${s} ${s} "${basePng}" -o "${tmpPath}"`, { stdio: 'ignore' });
  pngs.push({ size: s, data: fs.readFileSync(tmpPath) });
  fs.unlinkSync(tmpPath);
}

let offset = 6 + sizes.length * 16;
const dirHeader = Buffer.alloc(6);
dirHeader.writeUInt16LE(0, 0); // reserved
dirHeader.writeUInt16LE(1, 2); // icon type
dirHeader.writeUInt16LE(sizes.length, 4); // count

const entries = [];
for (const p of pngs) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(p.size >= 256 ? 0 : p.size, 0);
  entry.writeUInt8(p.size >= 256 ? 0 : p.size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(p.data.length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push(entry);
  offset += p.data.length;
}

const icoBuf = Buffer.concat([dirHeader, ...entries, ...pngs.map(p => p.data)]);
fs.writeFileSync(path.join(resDir, 'icon.ico'), icoBuf);
console.log('✅ Generated native icon.png, icon.icns, icon.ico, icon-tray.png');
```

- **Done-check:** `node scripts/generate-icons.cjs && file build-resources/icon.ico`

---

### Step 68.2 — Cross-Platform Process Environment in Server (`dashboard/src/server/run-command.js`)
- **File:** `dashboard/src/server/run-command.js`
- **Action:** MODIFY
- **Depends:** Step 68.1

**কী করতে হবে:**
`run-command.js`-এ `path.delimiter` এবং Windows-এর стандарт Node/npm/Cargo পাথ যুক্ত করো।

```javascript
import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';

function getAugmentedEnv() {
  const homeDir = os.homedir();
  const isWin = process.platform === 'win32';

  const extraPaths = isWin ? [
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs'),
    path.join(homeDir, 'AppData', 'Roaming', 'npm'),
    path.join(homeDir, '.cargo', 'bin')
  ] : [
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
    `${homeDir}/.nvm/versions/node/current/bin`,
    `${homeDir}/.cargo/bin`
  ];

  const currentPath = process.env.PATH || '';
  const delimiter = path.delimiter;
  const currentArray = currentPath.split(delimiter);
  const newPath = [...extraPaths, ...currentArray].filter(Boolean).join(delimiter);

  return {
    ...process.env,
    PATH: newPath
  };
}

export function runCommand(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd: cwd,
      encoding: 'utf8',
      timeout: 15000,
      shell: false,
      env: getAugmentedEnv()
    });
  } catch (err) {
    if (err.stdout) err.message += `\nStdout: ${err.stdout}`;
    if (err.stderr) err.message += `\nStderr: ${err.stderr}`;
    throw err;
  }
}
```

- **Done-check:** `test -f dashboard/src/server/run-command.js`

---

### Step 68.3 — Cross-Platform Window & Tray Integration (`electron/main.js`)
- **File:** `electron/main.js`
- **Action:** MODIFY
- **Depends:** Step 68.2

**কী করতে হবে:**
`electron/main.js`-এ `BrowserWindow` তৈরিতে `icon` পাথ পাস করো যাতে Windows ও Linux-এর টাস্কবার এবং উইন্ডোতে আইকন রেন্ডার হয়।

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

### Step 68.4 — Cross-Platform Build Configuration (`electron-builder.yml`)
- **File:** `electron-builder.yml`
- **Action:** MODIFY
- **Depends:** Step 68.3

**কী করতে হবে:**
`electron-builder.yml`-এ macOS (dmg, zip), Windows (nsis, portable), Linux (AppImage, deb) কনফিগারেশন আপডেট করো।

```yaml
appId: com.khairulistiyak.ai-checkpoint
productName: AI Checkpoint
copyright: Copyright © 2026 Khairul Istiyak

directories:
  output: release
  buildResources: build-resources

asar: false

files:
  - electron/**
  - dashboard/dist/**
  - dashboard/server.js
  - dashboard/package.json
  - dashboard/src/server/**
  - build-resources/**
  - packages/**
  - scripts/**
  - templates/**
  - package.json

extraMetadata:
  main: electron/main.js

mac:
  target:
    - target: dmg
      arch:
        - arm64
        - x64
    - target: zip
      arch:
        - arm64
        - x64
  category: public.app-category.developer-tools
  darkModeSupport: true
  hardenedRuntime: true
  gatekeeperAssess: false
  icon: build-resources/icon.icns

dmg:
  title: AI Checkpoint Installer
  icon: build-resources/icon.icns
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications

win:
  target:
    - target: nsis
      arch:
        - x64
    - target: portable
      arch:
        - x64
  icon: build-resources/icon.ico

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: always
  createStartMenuShortcut: true
  shortcutName: AI Checkpoint

linux:
  target:
    - target: AppImage
      arch:
        - x64
    - target: deb
      arch:
        - x64
  category: Development
  synopsis: Deterministic State Ledger & Execution Framework for AI Agents
  description: State ledger, execution engine, and real-time dashboard for autonomous AI coding agents.
  icon: build-resources/icon.png
  desktop:
    Name: AI Checkpoint
    Comment: Deterministic State Ledger for AI Agents
    Categories: Development;IDE;Building;

publish:
  provider: github
  owner: khairulistiyak
  repo: ai-checkpoint
```

- **Done-check:** `test -f electron-builder.yml`

---

### Step 68.5 — Full Verification and Cross-Platform Package Build (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 68.4

**কী করতে হবে:**
```bash
./l v
./l health
./l quality
npm test
npm run electron:build:mac
```

- **Done-check:** `test -f release/*.dmg`
