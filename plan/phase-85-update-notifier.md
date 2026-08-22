# 🔄 Phase 85: Simple Update Notifier System

**Status**: COMPLETED  
**Goal**: Electron App এবং Dashboard এ স্বয়ংক্রিয়ভাবে নতুন আপডেট নোটিফিকেশন ব্যানার প্রদর্শন করা।

---

## 🛠️ Implementation Steps

---

## Step 85.1 — Create Version Checker Module

- **File**: `electron/version-checker.js`
- **Action**: CREATE
- **Depends**: None
- **Done-check**: `test -f electron/version-checker.js`

```js
/**
 * version-checker.js — Compares app version with remote/local release metadata.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseSemver(v) {
  const cleaned = (v || '').replace(/^v/, '').trim();
  const parts = cleaned.split('.').map(n => parseInt(n, 10) || 0);
  return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
}

function isNewer(latest, current) {
  const l = parseSemver(latest);
  const c = parseSemver(current);
  if (l.major > c.major) return true;
  if (l.major === c.major && l.minor > c.minor) return true;
  if (l.major === c.major && l.minor === c.minor && l.patch > c.patch) return true;
  return false;
}

export async function checkAppUpdate(currentVersion = '1.0.0', updateUrl = null) {
  const defaultUrl = 'https://raw.githubusercontent.com/khairulistiyak/ai-checkpoint/main/dashboard/public/version.json';
  const targetUrl = updateUrl || defaultUrl;

  try {
    const res = await fetch(targetUrl, { timeout: 5000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const remoteData = await res.json();

    const latestVersion = remoteData.version || '1.0.0';
    const updateAvailable = isNewer(latestVersion, currentVersion);

    return {
      success: true,
      updateAvailable,
      currentVersion,
      latestVersion,
      releaseNotes: remoteData.releaseNotes || 'Bug fixes and performance improvements.',
      downloadUrl: remoteData.downloadUrl || 'https://github.com/khairulistiyak/ai-checkpoint/releases',
      mandatory: remoteData.mandatory || false,
      pubDate: remoteData.pubDate || new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      updateAvailable: false,
      currentVersion,
      error: err.message
    };
  }
}
```

---

## Step 85.2 — Register IPC Handler in Electron Main Process

- **File**: `electron/main.js`
- **Action**: MODIFY
- **Depends**: 85.1
- **Done-check**: `grep -q "check-for-updates" electron/main.js`

Add `ipcMain.handle('check-for-updates', ...)` in `electron/main.js`.

---

## Step 85.3 — Expose Update API in Preload Script

- **File**: `electron/preload.js`
- **Action**: MODIFY
- **Depends**: 85.2
- **Done-check**: `grep -q "checkForUpdates" electron/preload.js`

Expose `checkForUpdates` via `contextBridge`.

---

## Step 85.4 — Create Update Notifier React Hook

- **File**: `dashboard/src/hooks/useUpdateNotifier.js`
- **Action**: CREATE
- **Depends**: None
- **Done-check**: `test -f dashboard/src/hooks/useUpdateNotifier.js`

```js
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
```

---

## Step 85.5 — Create Update Banner Component

- **File**: `dashboard/src/components/UpdateBanner.jsx`
- **Action**: CREATE
- **Depends**: 85.4
- **Done-check**: `test -f dashboard/src/components/UpdateBanner.jsx`

```jsx
import React from 'react';
import { useUpdateNotifier } from '../hooks/useUpdateNotifier';

export function UpdateBanner() {
  const { updateAvailable, updateInfo, dismissUpdate } = useUpdateNotifier();

  if (!updateAvailable || !updateInfo) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1e1b4b 0%, #311b92 50%, #4a148c 100%)',
      borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
      color: '#ffffff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      zIndex: 9999,
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px' }}>🚀</span>
        <div>
          <strong style={{ fontSize: '13px', color: '#c4b5fd' }}>
            New Version Available ({updateInfo.latestVersion})
          </strong>
          <span style={{ fontSize: '12px', color: '#cbd5e1', marginLeft: '8px' }}>
            {updateInfo.releaseNotes || 'A new update is ready to download!'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a
          href={updateInfo.downloadUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            background: '#8b5cf6',
            color: '#ffffff',
            padding: '5px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}
        >
          Update Now
        </a>
        <button
          onClick={dismissUpdate}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '2px 8px'
          }}
          title="Dismiss for this version"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

---

## Step 85.6 — Create Public Version JSON File

- **File**: `dashboard/public/version.json`
- **Action**: CREATE
- **Depends**: None
- **Done-check**: `test -f dashboard/public/version.json`

```json
{
  "version": "1.1.0",
  "releaseDate": "2026-08-22",
  "releaseNotes": "Phase 94 Worker Thread performance fix & Phase 84 Live Analytics integration.",
  "downloadUrl": "https://github.com/khairulistiyak/ai-checkpoint/releases",
  "mandatory": false
}
```

---

## Step 85.7 — Mount UpdateBanner in App Component

- **File**: `dashboard/src/App.jsx`
- **Action**: MODIFY
- **Depends**: 85.5
- **Done-check**: `grep -q "UpdateBanner" dashboard/src/App.jsx`

Import and mount `<UpdateBanner />` at top of `App.jsx`.

---
