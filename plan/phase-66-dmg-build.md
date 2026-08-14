# Phase 66: macOS DMG Build & Desktop Hardening

> AI Checkpoint অ্যাপ্লিকেশনটিকে macOS DMG ইনস্টলার আকারে প্যাকেজিং করা এবং ম্যাক GUI এনভায়রনমেন্টের পাথ (PATH), ট্রাফিক লাইট হেডার ও গেটকিপার হ্যান্ডলিং ফিক্স করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 66: macOS DMG Build & Desktop Hardening

### Step 66.1 — Augment PATH for Child Processes in GUI Mode (`dashboard/src/server/run-command.js`)
- **File:** `dashboard/src/server/run-command.js`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
ম্যাক GUI মোডে চাইল্ড প্রসেস রান করার সময় যাতে `node`, `git` এবং `./l` কমান্ড পাথের অভাবে ফেইল না করে সেজন্য `PATH`-এ Homebrew ও স্ট্যান্ডার্ড ডিরেক্টরি ইনজেক্ট করো।

```javascript
import { execFileSync } from 'child_process';
import os from 'os';

function getAugmentedEnv() {
  const homeDir = os.homedir();
  const extraPaths = [
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
  const newPath = [...extraPaths, currentPath].filter(Boolean).join(':');

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

### Step 66.2 — Fix macOS Window Drag Region & Traffic Lights (`dashboard/src/components/Header.jsx`)
- **File:** `dashboard/src/components/Header.jsx`
- **Action:** MODIFY
- **Depends:** Step 66.1

**কী করতে হবে:**
ম্যাকোসে ট্রাফিক লাইটের জন্য বাম পাশে স্পেসিং এবং উইন্ডো ড্র্যাগ রিজিয়ন যোগ করো।

```jsx
import React from 'react';
import { Brain, Settings, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ onOpenSettings, onOpenCommandPalette, onToggleMenu }) {
  const isElectron = typeof window !== 'undefined' && (
    window.navigator?.userAgent?.includes('Electron') ||
    new URLSearchParams(window.location.search).has('port')
  );

  return (
    <motion.header
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ WebkitAppRegion: 'drag' }}
      className={`w-full h-14 bg-[#09090b] border-b border-white/10 flex items-center justify-between px-4 md:px-6 z-20 shrink-0 select-none ${
        isElectron ? 'pl-20 md:pl-24' : ''
      }`}
    >
      <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={onToggleMenu}
          className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white font-outfit">
              AI-CHECKPOINT
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400 uppercase font-semibold">
              STUDIO
            </span>
          </div>
        </div>
        <div className="hidden sm:block h-4 w-px bg-white/10" />
        <span className="hidden sm:inline-block text-xs font-mono text-zinc-400 select-none">
          Workspaces & Execution
        </span>
      </div>

      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' }}>
        <div
          className="relative group hidden md:block cursor-pointer"
          onClick={onOpenCommandPalette}
        >
          <div className="flex items-center justify-between w-56 lg:w-64 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 text-zinc-400 text-xs font-mono transition-all">
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span>Search commands...</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-mono font-bold">
              ⌘K
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 border border-white/10 transition-colors cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </motion.header>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/Header.jsx`

---

### Step 66.3 — Harden electron-builder.yml for macOS DMG Packaging (`electron-builder.yml`)
- **File:** `electron-builder.yml`
- **Action:** MODIFY
- **Depends:** Step 66.1, Step 66.2

**কী করতে হবে:**
DMG কনফিগারেশন আপডেট করো যাতে সঠিক আইকন ও উইন্ডো ড্র্যাগ ডিরেক্টরি সেট থাকে।

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
    - target: zip
      arch:
        - arm64
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

linux:
  target:
    - target: AppImage
    - target: deb
  category: Development
  icon: build-resources/icon.png

publish:
  provider: github
  owner: khairulistiyak
  repo: ai-checkpoint
```

- **Done-check:** `test -f electron-builder.yml`

---

### Step 66.4 — Verify and Build DMG Installer (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 66.1, Step 66.2, Step 66.3

**কী করতে হবে:**
```bash
./l v
./l health
./l quality
cd dashboard && npm run build
npx electron-builder --mac dmg --publish never
```

- **Done-check:** `test -f release/*.dmg`
