# Phase 54: Electron Desktop App — Cross-Platform Distribution

> Package ai-checkpoint Dashboard as a native desktop app for Windows (.exe), macOS (.dmg), and Linux (.AppImage) with auto-update.

---

### Step 54.1 — Install Electron dependencies
- **File:** `package.json`
- **Action:** EDIT
- **Content:** Add `electron`, `electron-builder`, `electron-updater` to devDependencies. Add `"main": "electron/main.js"` field. Add scripts: `"electron:dev"`, `"electron:build"`, `"electron:build:win"`, `"electron:build:mac"`, `"electron:build:linux"`, `"electron:build:all"`.
- **Done-check:** `node -e "require('electron')"` → no error
- **Depends:** None

---

### Step 54.2 — Create Electron main process
- **File:** `electron/main.js`
- **Action:** CREATE
- **Content:** Create BrowserWindow, embed Express server from `dashboard/server.js`, serve `dashboard/dist/index.html` via file:// protocol. Window 1280x800, minWidth 900, minHeight 600. titleBarStyle: 'hiddenInset' on macOS. On close event: hide to tray instead of quit. On 'activate': show window. Load server on dynamic port, pass port to renderer via query param.
- **Done-check:** `node -e "const m = require('./electron/main.js')"` → file exists and parseable
- **Depends:** 54.1

---

### Step 54.3 — Create Electron preload script
- **File:** `electron/preload.js`
- **Action:** CREATE
- **Content:** Use contextBridge to expose `electronAPI` with: `getAppVersion()`, `getPlatform()`, `openExternal(url)`, `onUpdateAvailable(callback)`, `onUpdateDownloaded(callback)`, `installUpdate()`, `minimize()`, `maximize()`, `close()`. All via ipcRenderer.invoke/on.
- **Done-check:** `cat electron/preload.js | grep contextBridge` → match
- **Depends:** 54.2

---

### Step 54.4 — Create system tray module
- **File:** `electron/tray.js`
- **Action:** CREATE
- **Content:** Export `createTray(mainWindow)` function. Build context menu with: "Open Dashboard", separator, "Run Doctor" (spawns `./l doctor`), "Quick Status" (spawns `./l status`), separator, "Quit". Use `build-resources/icon-tray.png` (16x16) for tray icon. On tray click: toggle mainWindow visibility.
- **Done-check:** `cat electron/tray.js | grep createTray` → match
- **Depends:** 54.2

---

### Step 54.5 — Create auto-updater module
- **File:** `electron/updater.js`
- **Action:** CREATE
- **Content:** Export `initAutoUpdater(mainWindow)`. Use `electron-updater` autoUpdater. Set `autoDownload: false`, `autoInstallOnAppQuit: true`. On 'update-available': send IPC `update-available` with version info to renderer. On 'update-downloaded': send IPC `update-downloaded`. Export `downloadUpdate()` and `installUpdate()` for renderer to call via IPC.
- **Done-check:** `cat electron/updater.js | grep autoUpdater` → match
- **Depends:** 54.3

---

### Step 54.6 — Create electron-builder config
- **File:** `electron-builder.yml`
- **Action:** CREATE
- **Content:** appId: `com.khairulistiyak.ai-checkpoint`, productName: `AI Checkpoint`. files: `electron/**`, `dashboard/dist/**`, `dashboard/server.js`, `dashboard/src/server/**`, `packages/**`, `scripts/**`, `templates/**`. mac: target dmg+zip, category `public.app-category.developer-tools`, darkModeSupport true. win: target nsis+portable, nsis oneClick false, allowToChangeInstallationDirectory true. linux: target AppImage+deb, category Development. publish: provider github, owner khairulistiyak, repo ai-checkpoint. directories.output: `release`.
- **Done-check:** `cat electron-builder.yml | grep appId` → `com.khairulistiyak.ai-checkpoint`
- **Depends:** 54.1

---

### Step 54.7 — Generate app icons for all platforms
- **File:** `build-resources/icon.png`
- **Action:** CREATE
- **Content:** Generate 512x512 PNG app icon using the existing logo design from `logo/`. Create `build-resources/icon.png` (512x512 for Linux), `build-resources/icon.icns` placeholder (macOS — electron-builder auto-converts from PNG), `build-resources/icon.ico` placeholder (Windows — electron-builder auto-converts from PNG). Also create `build-resources/icon-tray.png` (16x16 for system tray).
- **Done-check:** `ls build-resources/icon.png` → file exists
- **Depends:** None

---

### Step 54.8 — Modify dashboard server for Electron compatibility
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **Content:** Export a `startServer(port)` function that starts Express on given port and returns the HTTP server instance. Keep existing `app.listen` as fallback when not running in Electron (check `process.env.ELECTRON !== '1'`). When in Electron: skip CORS entirely, use port 0 for dynamic assignment.
- **Done-check:** `grep "startServer" dashboard/server.js` → match
- **Depends:** 54.2

---

### Step 54.9 — Update Vite config for Electron compatibility
- **File:** `dashboard/vite.config.js`
- **Action:** EDIT
- **Content:** Add `base: './'` to config so all asset paths are relative (required for Electron file:// protocol). Add `build.assetsDir: 'assets'` explicitly.
- **Done-check:** `grep "base:" dashboard/vite.config.js` → `'./'`
- **Depends:** None

---

### Step 54.10 — Create desktop build script
- **File:** `scripts/build-desktop.sh`
- **Action:** CREATE
- **Content:** `#!/bin/bash` with `set -euo pipefail`. Step 1: `cd dashboard && npm ci && npm run build`. Step 2: `cd .. && npm ci`. Step 3: Check `$1` arg for platform (`mac`, `win`, `linux`, `all`). Run `npx electron-builder --$platform --publish never`. Default to current platform if no arg.
- **Done-check:** `bash scripts/build-desktop.sh --help` → shows usage
- **Depends:** 54.6

---

### Step 54.11 — Create GitHub Actions CI for desktop builds
- **File:** `.github/workflows/build-desktop.yml`
- **Action:** CREATE
- **Content:** Trigger on push tag `v*`. Matrix: `[macos-latest, windows-latest, ubuntu-latest]`. Steps: checkout, setup Node 20, install deps, build dashboard (`cd dashboard && npm ci && npm run build`), run electron-builder with `--publish always` using `GH_TOKEN` secret. Upload artifacts. Each OS builds its native format only.
- **Done-check:** `cat .github/workflows/build-desktop.yml | grep electron-builder` → match
- **Depends:** 54.6

---

### Step 54.12 — Add update notification UI component
- **File:** `dashboard/src/components/UpdateNotification.jsx`
- **Action:** CREATE
- **Content:** React component that listens for `window.electronAPI?.onUpdateAvailable`. Shows a toast-style banner at top: "Version X.Y.Z available! [Download] [Later]". On download click: calls `window.electronAPI.downloadUpdate()`. After download complete: shows "Update ready! [Restart Now]". Only renders when running inside Electron (`window.electronAPI` exists). Max 120 lines.
- **Done-check:** `grep "UpdateNotification" dashboard/src/components/UpdateNotification.jsx` → match
- **Depends:** 54.5

---

### Step 54.13 — Mount UpdateNotification in App.jsx
- **File:** `dashboard/src/App.jsx`
- **Action:** EDIT
- **Content:** Import `UpdateNotification` and render it at the top of the App component, inside the main layout wrapper but above all other content.
- **Done-check:** `grep "UpdateNotification" dashboard/src/App.jsx` → match
- **Depends:** 54.12

---

### Step 54.14 — Build dashboard and test Electron dev mode
- **File:** `dashboard/dist/index.html`
- **Action:** CREATE (via build)
- **Content:** Run `cd dashboard && npm run build` to generate production React build. Then run `npx electron .` to verify the Electron app launches with embedded server and renders the dashboard.
- **Done-check:** `ls dashboard/dist/index.html` → file exists
- **Depends:** 54.8, 54.9, 54.13

---

### Step 54.15 — Build macOS .dmg and verify
- **File:** `release/AI Checkpoint-1.0.0.dmg`
- **Action:** CREATE (via build)
- **Content:** Run `npm run electron:build:mac` to generate the macOS .dmg file. Verify it mounts, app launches, Express server starts, dashboard renders, and tray icon appears.
- **Done-check:** `ls release/*.dmg` → file exists
- **Depends:** 54.14
