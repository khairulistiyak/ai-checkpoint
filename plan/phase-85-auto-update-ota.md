# 🔄 Phase 85: Simple Update Notifier

> **আমরা version update করলে → User UI-তে banner দেখাবে → "Download Update" click করলে browser-এ আমাদের website খুলবে → User download করে install করবে।**

---

## 🎯 কিভাবে কাজ করবে?

```
আমরা নতুন version release করি
        ↓
website/version.json ফাইলটা manually update করি
        ↓
User-এর app background-এ সেই JSON check করে (every 1 hour)
        ↓
নতুন version পেলে Dashboard-এ banner দেখায়:
"🆕 v1.2.0 Available — Download from our website"
        ↓
User "Download Update" button click করে
        ↓
Browser opens → আমাদের website download page
        ↓
User download করে, install করে → নতুন version চালু
```

**কোনো certificate নেই। কোনো electron-updater নেই। Zero complexity।**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   আমাদের Side                                │
│                                                             │
│  নতুন version release                                        │
│         ↓                                                   │
│  website/version.json manually update:                      │
│  { "version": "1.2.0", "downloadUrl": "...", ... }         │
│         ↓                                                   │
│  website-এ new installer upload (manual)                    │
└─────────────────────────────────────────────────────────────┘
                    ↓ (app checks)
┌─────────────────────────────────────────────────────────────┐
│                   User-এর App (Running)                     │
│                                                             │
│  Startup + every 1 hour:                                    │
│  → GET https://website.com/version.json                     │
│  → Compare with current app version                         │
│  → Different? → Send IPC to Dashboard UI                    │
└─────────────────────────────────────────────────────────────┘
                    ↓ (IPC event)
┌─────────────────────────────────────────────────────────────┐
│                   Dashboard UI                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🆕 Update Available — v1.2.0               [✕]     │   │
│  │                                                     │   │
│  │ ✨ AI Intelligence Hub added                        │   │
│  │ 🐛 Fixed scanner crash on large projects            │   │
│  │ ⚡ 40% faster health scan                           │   │
│  │                                                     │   │
│  │ [View Changelog]        [Download Update →]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  "Download Update" → browser opens website download page   │
│  User downloads installer → runs it → updated!             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 Version Manifest (version.json)

আমাদের website-এ এই file থাকবে: `https://your-website.com/version.json`

```json
{
  "version": "1.2.0",
  "releaseDate": "2026-08-17",
  "downloadUrl": "https://your-website.com/download",
  "changelog": [
    "✨ AI Intelligence Hub added",
    "🐛 Fixed scanner crash on large projects",
    "⚡ 40% faster health scan"
  ],
  "critical": false
}
```

**নতুন version release করলে আমরা শুধু এই file টা update করবো।**
`critical: true` হলে user dismiss করতে পারবে না।

---

## 📊 Update Banner States

```
State 1: IDLE
  → কোনো notification নেই

State 2: UPDATE_AVAILABLE
  ┌──────────────────────────────────────────────────────────┐
  │ 🆕 Update Available — v1.2.0                    [✕]    │
  │                                                          │
  │  ✨ AI Intelligence Hub added                            │
  │  🐛 Fixed scanner crash on large projects               │
  │  ⚡ 40% faster health scan                              │
  │                                                          │
  │  [View Changelog]              [Download Update →]       │
  └──────────────────────────────────────────────────────────┘
  "Download Update" → shell.openExternal(downloadUrl)

State 3: CRITICAL UPDATE (critical: true)
  ┌──────────────────────────────────────────────────────────┐
  │ ⚠️ Important Update Required — v1.2.0                   │
  │  This update contains critical security fixes.           │
  │                                                          │
  │                        [Download Update →]               │
  └──────────────────────────────────────────────────────────┘
  (no dismiss button for critical updates)

State 4: UP_TO_DATE (manual check only)
  → Toast: "✓ You're on the latest version (v1.1.0)"

State 5: CHECK_FAILED
  → Toast: "⚠ Could not check for updates" (silent, no popup)
```

---

## 📋 Implementation Steps

### 🔧 Layer 1: Electron Main Process

| Step | File | Description |
|:---|:---|:---|
| 85.1 | `electron/version-checker.js` | Fetch `version.json` from URL. Compare with `app.getVersion()`. Send `update:available` IPC if newer. Retry silently on failure. Check on startup (5s delay) + every 1 hour. |
| 85.2 | `electron/main.js` (edit) | Import version-checker. Register IPC handler: `shell:open-url` → `shell.openExternal(url)`. Register `app:version` → return `app.getVersion()`. |
| 85.3 | `electron/preload.js` (edit) | Expose via contextBridge: `onUpdateAvailable(cb)`, `openDownloadPage(url)`, `getCurrentVersion()`, `checkForUpdates()`. |

### 🎨 Layer 2: Dashboard UI

| Step | File | Description |
|:---|:---|:---|
| 85.4 | `dashboard/src/hooks/useUpdateNotifier.js` | Listen to `window.electronAPI.onUpdateAvailable`. Store: `updateInfo`, `isDismissed`. Methods: `dismiss()`, `openDownload()`. Persist dismissed version in localStorage so it doesn't reappear. |
| 85.5 | `dashboard/src/components/UpdateBanner.jsx` | Animated slide-down banner at top of app. Shows version, changelog bullets, download button, dismiss button. Critical mode: no dismiss. |
| 85.6 | `dashboard/src/App.jsx` (edit) | Mount `<UpdateBanner>` globally. |

### 🌐 Layer 3: Website/Server

| Step | Task | Description |
|:---|:---|:---|
| 85.7 | `public/version.json` | Static JSON file on website. We manually update this on each release. Must be HTTPS, CORS-enabled. |

### ✅ Layer 4: Verification

| Step | What |
|:---|:---|
| 85.8 | Test: change version.json to a newer version → app detects within 5s → banner appears → "Download Update" opens browser → correct URL loads. |
| 85.9 | Test: dismiss banner → reopen app → banner does NOT reappear (localStorage check). |
| 85.10 | Test: `critical: true` → dismiss button hidden → banner persistent. |

---

## 📁 Files Summary

| File | Status | কাজ |
|:---|:---|:---|
| `electron/version-checker.js` | NEW | version.json fetch + IPC |
| `electron/main.js` | EDIT | checker init + shell handler |
| `electron/preload.js` | EDIT | API expose |
| `dashboard/src/hooks/useUpdateNotifier.js` | NEW | IPC listen + state |
| `dashboard/src/components/UpdateBanner.jsx` | NEW | Banner UI |
| `dashboard/src/App.jsx` | EDIT | Banner mount |
| `public/version.json` | NEW | Manual release manifest |

**মাত্র 7টা file। 10টা step।**

---

## 🛠️ Tech Stack

| Need | Solution | Why |
|:---|:---|:---|
| Version check | `https.get()` built-in | Zero dependency |
| Open browser | `shell.openExternal()` | Electron built-in |
| IPC | `ipcMain` + `contextBridge` | Electron standard |
| State | React `useState` | Simple |
| Persist dismiss | `localStorage` | No DB needed |
| Manifest | Static JSON on website | Manual update, full control |

---

## 🔄 Release Process (আমাদের জন্য)

```
1. Code change করো
2. package.json-এ version bump করো (1.1.0 → 1.2.0)
3. Build করো: npm run build
4. Installer আমাদের website-এ upload করো
5. version.json update করো:
   { "version": "1.2.0", "changelog": [...], ... }
6. Done — সব user পরবর্তী check-এ notification পাবে
```

---

## ✅ কেন এই approach সেরা?

| | Auto-Update (OTA) | এই plan (Simple) |
|:---|:---|:---|
| Certificate লাগবে? | macOS-এ হ্যাঁ | ❌ লাগবে না |
| `electron-updater` লাগবে? | হ্যাঁ | ❌ লাগবে না |
| Platform issues | macOS problem | ✅ সব platform-এ কাজ করে |
| Complexity | High | **Very Low** |
| Control | Less | **Full control** |
| **100% কাজ করবে?** | শর্তসাপেক্ষে | **✅ হ্যাঁ** |

**Total: 10 steps | 7 files | Windows + macOS + Linux সব-এ 100% কাজ করবে।**
