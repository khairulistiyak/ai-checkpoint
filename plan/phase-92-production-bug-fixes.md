# Phase 92: Production Bug Fixes & Electron Hardening
**Status**: COMPLETED
**Description**: Full production audit এ পাওয়া ১৫টি বাগ ফিক্স করা — CRITICAL server crashes, security vulnerabilities, path resolution issues, এবং cross-platform compatibility fixes।

---

## Technical Context

**ডিপেন্ডেন্সি:** Phase 88-91 সম্পূর্ণ (Global Store Architecture)

**গুরুত্বপূর্ণ:**
- `packages/` ফোল্ডার = CommonJS (`require`/`module.exports`)
- `electron/` ফোল্ডার = CommonJS (`require`/`module.exports`)
- `dashboard/` ফোল্ডার = ESM (`import`/`export`)
- **কখনো মেশাবে না!**

**Root Cause Summary:**
- Global Store migration এর পরে কিছু ফাইলে পুরোনো `.agents/` পাথ রয়ে গেছে
- Electron ASAR packaging এ কিছু ফাইল/ফোল্ডার অন্তর্ভুক্ত হচ্ছিল না
- Packaged app এ `__dirname` ভার্চুয়াল ASAR পাথে resolve হয়

---

## Step-by-Step Implementation Plan

### Step 92.1: Fix health.js — Legacy path crash ✅ DONE
**File**: `dashboard/src/server/health.js`
**Action**: EDIT
**What**:
- Line 20-22 এ `process.cwd()/.agents/config.json` থেকে প্রজেক্ট পড়া হচ্ছিল — এই ফাইল আর নেই
- `import { getSettings } from './settings.js';` যোগ করো
- `const configPath = path.resolve(...)` ও `JSON.parse(fs.readFileSync(...))` মুছে দাও
- এই দিয়ে রিপ্লেস করো:
  ```javascript
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  ```
**Done-check**: `grep "getSettings" dashboard/src/server/health.js` → ম্যাচ পাওয়া যাবে

---

### Step 92.2: Fix main.js — Silent server failure ✅ DONE
**File**: `electron/main.js`
**Action**: EDIT
**What**:
- Line 112 এ `server` null হলে fallback port 20226 ব্যবহার হতো — কিন্তু কোনো সার্ভার চলছে না সেই পোর্টে
- `server` null হলে `dialog.showErrorBox()` দিয়ে ইউজারকে জানাও এবং `app.quit()` করো:
  ```javascript
  if (!server) {
    dialog.showErrorBox(
      'AI Checkpoint — Server Failed',
      'The backend server could not start.\n\nPlease try running from terminal:\n  ai-checkpoint --no-sandbox'
    );
    app.quit();
    return;
  }
  const port = server.address().port;
  ```
**Done-check**: `grep "showErrorBox" electron/main.js` → ম্যাচ পাওয়া যাবে

---

### Step 92.3: Fix electron-builder.yml — Add missing packages ✅ DONE
**File**: `electron-builder.yml`
**Action**: EDIT
**What**:
- `files:` সেকশনে `packages/**` এবং `scripts/**` যোগ করো
- এগুলো ছাড়া server.js, parser.js, intelligence.js সবাই `../../../packages/core/` ইমপোর্ট করতে গিয়ে ASAR এ মডিউল পায় না → crash
  ```yaml
  files:
    # ... existing entries ...
    - packages/**
    - scripts/**
  ```
**Done-check**: `grep "packages" electron-builder.yml` → ম্যাচ পাওয়া যাবে

---

### Step 92.4: Fix electron-builder.yml — Add dashboard/node_modules
**File**: `electron-builder.yml`
**Action**: EDIT
**What**:
- `files:` সেকশনে `dashboard/node_modules/**` যোগ করো
- কারণ: `dashboard/server.js` রানটাইমে `express`, `cors` প্রয়োজন — এগুলো `dashboard/node_modules/` এ থাকে
- Electron-builder সাধারণত root `package.json` এর deps ইনস্টল করে, কিন্তু `dashboard/` এর নিজস্ব `package.json` আছে
  ```yaml
  files:
    # ... existing entries ...
    - dashboard/node_modules/**
  ```
**Done-check**: `grep "dashboard/node_modules" electron-builder.yml` → ম্যাচ পাওয়া যাবে

---

### Step 92.5: Fix run-command.js — NVM path detection
**File**: `dashboard/src/server/run-command.js`
**Action**: EDIT
**What**:
- Line 21 এ `${homeDir}/.nvm/versions/node/current/bin` হার্ডকোড আছে — NVM এ `current` সিমলিংক নেই
- ডাইনামিক NVM ভার্সন রেজোলিউশন যোগ করো:
  ```javascript
  // Replace line 21 with:
  function findNvmBin(homeDir) {
    const nvmDir = path.join(homeDir, '.nvm', 'versions', 'node');
    try {
      if (!fs.existsSync(nvmDir)) return '';
      const versions = fs.readdirSync(nvmDir).filter(v => v.startsWith('v')).sort().reverse();
      return versions.length > 0 ? path.join(nvmDir, versions[0], 'bin') : '';
    } catch { return ''; }
  }
  ```
- `extraPaths` এ্যারেতে `findNvmBin(homeDir)` ব্যবহার করো:
  ```javascript
  const extraPaths = isWin ? [...] : [
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
    findNvmBin(homeDir),
    `${homeDir}/.cargo/bin`
  ];
  ```
**Done-check**: `grep "findNvmBin" dashboard/src/server/run-command.js` → ম্যাচ পাওয়া যাবে
**Depends**: None

---

### Step 92.6: Fix run-command.js — Increase timeout
**File**: `dashboard/src/server/run-command.js`
**Action**: EDIT
**What**:
- Line 50 এ `timeout: 15000` আছে — বড় প্রজেক্টে health/quality scan ১৫ সেকেন্ডে শেষ হয় না
- `timeout: 60000` করো (60 সেকেন্ড)
  ```javascript
  // Line 50: Change
  timeout: 15000,
  // To:
  timeout: 60000,
  ```
**Done-check**: `grep "timeout: 60000" dashboard/src/server/run-command.js` → ম্যাচ পাওয়া যাবে
**Depends**: Step 92.5 (same file)

---

### Step 92.7: Fix api.js — Command injection in open-in-ide
**File**: `dashboard/src/server/api.js`
**Action**: EDIT
**What**:
- Line 63-76 এ `execSync(\`code -g "${fullPath}:${line}"\`)` ব্যবহার হচ্ছে — শেল ইনজেকশন ভালনারেবিলিটি
- `execSync` কে `execFileSync` দিয়ে রিপ্লেস করো (array args, no shell):
  ```javascript
  // ❌ OLD:
  execSync(`code -g "${fullPath}:${line}"`, { stdio: 'ignore', timeout: 5000 });
  // ✅ NEW:
  const { execFileSync } = require('child_process');
  execFileSync('code', ['-g', `${fullPath}:${line}`], { stdio: 'ignore', timeout: 5000 });
  ```
- Line 1 এ `import { execSync } from 'child_process';` → `import { execSync, execFileSync } from 'child_process';`
- সব IDE কমান্ডে একই পরিবর্তন: `code`, `cursor`, `windsurf`, `idea`
**Done-check**: `grep "execFileSync" dashboard/src/server/api.js` → ম্যাচ পাওয়া যাবে
**Depends**: None

---

### Step 92.8: Fix tray.js — ASAR icon path
**File**: `electron/tray.js`
**Action**: EDIT
**What**:
- Line 11 এ `path.join(__dirname, '..', 'build-resources', 'icon-tray.png')` — ASAR ভেতরে এটি ভার্চুয়াল পাথ হয়ে যায়
- `nativeImage` ফলব্যাক যোগ করো:
  ```javascript
  const { Tray, Menu, app, nativeImage } = require('electron');
  // ...
  let iconPath = path.join(__dirname, '..', 'build-resources', 'icon-tray.png');
  // Fallback for packaged app
  if (!require('fs').existsSync(iconPath)) {
    iconPath = path.join(process.resourcesPath || __dirname, 'build-resources', 'icon-tray.png');
  }
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 });
  } catch {
    trayIcon = iconPath;
  }
  tray = new Tray(trayIcon);
  ```
**Done-check**: `grep "nativeImage" electron/tray.js` → ম্যাচ পাওয়া যাবে
**Depends**: None

---

### Step 92.9: Fix watcher-events.js — Remove legacy .agents/PROGRESS.md reference
**File**: `dashboard/src/server/watcher-events.js`
**Action**: EDIT
**What**:
- Line 19 এ `WARN_ONLY_FILES` এখনো `.agents/PROGRESS.md` ধারণ করে — গ্লোবাল স্টোরে migrate হয়ে গেছে
- খালি অ্যারে করে দাও:
  ```javascript
  // ❌ OLD:
  export const WARN_ONLY_FILES = [path.join('.agents', 'PROGRESS.md')];
  // ✅ NEW:
  export const WARN_ONLY_FILES = [];
  ```
**Done-check**: `grep "WARN_ONLY_FILES = \[\]" dashboard/src/server/watcher-events.js` → ম্যাচ পাওয়া যাবে
**Depends**: None

---

### Step 92.10: Fix watcher.js — Templates dir ASAR-aware path
**File**: `dashboard/src/server/watcher.js`
**Action**: EDIT
**What**:
- Line 22 এ `this.templatesDir = path.resolve(__dirname, '..', '..', '..', 'templates')` — ASAR এ রেজলভ নাও হতে পারে
- ফলব্যাক যোগ করো:
  ```javascript
  const resolvedTemplates = path.resolve(__dirname, '..', '..', '..', 'templates');
  this.templatesDir = fs.existsSync(resolvedTemplates)
    ? resolvedTemplates
    : path.join(process.resourcesPath || __dirname, 'templates');
  ```
**Done-check**: `grep "resourcesPath" dashboard/src/server/watcher.js` → ম্যাচ পাওয়া যাবে
**Depends**: None

---

### Step 92.11: Fix updater.js — Use app.isPackaged instead of NODE_ENV
**File**: `electron/updater.js`
**Action**: EDIT
**What**:
- Line 27 এ `process.env.NODE_ENV === 'production'` — packaged app এ NODE_ENV সেট না থাকায় আপডেট চেক কখনো হয় না
- `app.isPackaged` দিয়ে রিপ্লেস করো:
  ```javascript
  // ❌ OLD:
  if (process.env.NODE_ENV === 'production') {
  // ✅ NEW:
  const { app } = require('electron');
  if (app.isPackaged) {
  ```
**Done-check**: `grep "isPackaged" electron/updater.js` → ম্যাচ পাওয়া যাবে
**Depends**: None

---

### Step 92.12: Fix settings.js — Default shell auto-detect
**File**: `dashboard/src/server/settings.js`
**Action**: EDIT
**What**:
- Line 19 এ `preferredShell: '/bin/zsh'` — সব Linux-এ zsh থাকে না
- ডাইনামিকভাবে ডিটেক্ট করো:
  ```javascript
  // ❌ OLD:
  preferredShell: '/bin/zsh',
  // ✅ NEW:
  preferredShell: process.env.SHELL || '/bin/bash',
  ```
**Done-check**: `grep "process.env.SHELL" dashboard/src/server/settings.js` → ম্যাচ পাওয়া যাবে
**Depends**: None

---

### Step 92.13: Fix electron-builder.yml — Linux --no-sandbox
**File**: `electron-builder.yml`
**Action**: EDIT
**What**:
- `linux:` সেকশনে `--no-sandbox` ফ্ল্যাগ নেই — Ubuntu 24.04+ এ app menu থেকে ক্লিক করলে সাইলেন্টলি ফেইল করে
- `linux:` সেকশনের নিচে যোগ করো:
  ```yaml
  linux:
    executableName: ai-checkpoint
    executableArgs:
      - "--no-sandbox"
  ```
**Done-check**: `grep "no-sandbox" electron-builder.yml` → ম্যাচ পাওয়া যাবে
**Depends**: Step 92.4 (same file)

---

### Step 92.14: Fix intelligence-history.js — Use global store path
**File**: `packages/core/intelligence-history.js`
**Action**: EDIT
**What**:
- এই মডিউল intelligence history `<projectPath>/.agents/` এ লেখে — গ্লোবাল স্টোরে লিখতে হবে
- ফাইলটি দেখো এবং history path আপডেট করো:
  - যদি `path.join(projectPath, '.agents', 'intelligence-history.json')` থাকে
  - তাহলে caller (intelligence.js) থেকে globalStore path পাঠাতে হবে
  - **অথবা** এই ফাইলে `os.homedir()` ব্যবহার করে global path ক্যালকুলেট করো
- **নোট**: এটি CommonJS ফাইল (`packages/` ফোল্ডারে)
**Done-check**: ফাইলে `.agents` রেফারেন্স থাকবে না
**Depends**: None

---

### Step 92.15: Full Build & Verify
**File**: `scripts/build-desktop.sh`
**Action**: RUN
**What**:
- সব ফিক্স শেষে পুরো বিল্ড পাইপলাইন রান করো:
  ```bash
  sudo rm -rf /mnt/Project/2026/ai-checkpoint/release /mnt/Project/2026/ai-checkpoint/node_modules
  cd /mnt/Project/2026/ai-checkpoint && bash scripts/build-desktop.sh linux
  ```
- পুরোনো অ্যাপ রিমুভ ও নতুন ইনস্টল:
  ```bash
  sudo dpkg -r ai-checkpoint
  sudo dpkg -i /mnt/Project/2026/ai-checkpoint/release/*.deb
  ai-checkpoint --no-sandbox
  ```
**Done-check**: অ্যাপ ওপেন হবে, "Server connection error" দেখাবে না, Health tab কাজ করবে
**Depends**: Step 92.1 — 92.14 সব সম্পূর্ণ হতে হবে
