# Phase 75: Dynamic Studio Settings & Workspace Control Engine

> AI Checkpoint ড্যাশবোর্ডে ৪টি ক্যাটাগরির (AI Agent & Ledger Rules, Telemetry & Protection, IDE & Editor, Studio Appearance & Sound) ডাইনামিক কনফিগারেশন সিস্টেম ইমপ্লিমেন্ট করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 75: Dynamic Studio Settings & Workspace Control Engine

### Step 75.1 — Upgrade Backend Settings Storage & PUT Endpoint (`dashboard/src/server/settings.js`)
- **File:** `dashboard/src/server/settings.js`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
1. `dashboard/src/server/settings.js`-এ ডিফল্ট preferences অবজেক্টে ডাইনামিক ফিল্ড যুক্ত করো (`rule0Limit: 150`, `autoSyncPlans: true`, `defaultAiTier: 'small'`, `strictSyntaxCheck: true`, `autoRestoreFiles: true`, `telemetryPulse: 3`, `logRetention: 1000`, `preferredIde: 'vscode'`, `preferredShell: '/bin/zsh'`, `soundEffects: false`, `compactView: false`)।
2. `updatePreferences(newPrefs)` ফাংশন যোগ করো এবং `dashboard/src/server/api.js`-এ `PUT /api/settings` রুট মাউন্ট করো।
3. নিশ্চিত করো ফাইলটি ১৫০ লাইনের নিচে থাকে (Rule 0)।

- **Done-check:** `test -f dashboard/src/server/settings.js`

---

### Step 75.2 — Create Settings Tab Components (`dashboard/src/components/settings/SettingsTabs.jsx`)
- **File:** `dashboard/src/components/settings/SettingsTabs.jsx`
- **Action:** CREATE
- **Depends:** Step 75.1

**কী করতে হবে:**
1. ৪টি ট্যাবের জন্য সাব-ভিউ তৈরি করো:
   - **Agent & Ledger:** Rule 0 Line Limit, Auto-sync toggle, Default AI Tier, Strict AST Check.
   - **Telemetry:** Auto-restore protection, telemetry pulse interval, log retention.
   - **IDE & Terminal:** Preferred IDE (VS Code, Cursor, Windsurf, WebStorm), Default Shell.
   - **Appearance:** Theme Selector, Sound effects toggle, Compact view toggle.
2. মডুলার ও রিউজেবল বাটন/টগল কম্পোনেন্ট সহ ১৫০ লাইনের নিচে রাখো।

- **Done-check:** `test -f dashboard/src/components/settings/SettingsTabs.jsx`

---

### Step 75.3 — Overhaul SettingsModal with 4-Tab Navigation & Live Sync (`dashboard/src/components/SettingsModal.jsx`)
- **File:** `dashboard/src/components/SettingsModal.jsx`
- **Action:** MODIFY
- **Depends:** Step 75.2

**কী করতে হবে:**
1. `SettingsModal.jsx`-এ ৪টি ট্যাবের লেফট ন্যাভিগেশন বার এবং অ্যাক্টিভ ট্যাব কন্টেইনার যুক্ত করো।
2. এপিআই থেকে বর্তমান সেটিংস লোড এবং টগল বা ড্রপডাউন পরিবর্তনে তাৎক্ষণিকভাবে `PUT /api/settings` কল করে সেভ করার লজিক যুক্ত করো।
3. সফল সেভে টোস্ট নোটিফিকেশন দাও।
4. ১৫০ লাইনের নিচে রাখো।

- **Done-check:** `test -f dashboard/src/components/SettingsModal.jsx`

---

### Step 75.4 — Connect Dynamic IDE Protocol in Diagnostic Tools (`dashboard/src/components/health/useHealthCommandCenter.js`)
- **File:** `dashboard/src/components/health/useHealthCommandCenter.js`
- **Action:** MODIFY
- **Depends:** Step 75.3

**কী করতে হবে:**
1. `useHealthCommandCenter.js`-এ `handleOpenInIde` মেথডে ইউজারের `preferredIde` প্রটোকল (`cursor://`, `windsurf://`, `vscode://`, `idea://`) ব্যবহার করে ফাইল ওপেন করার লজিক আপডেট করো।
2. ১৫০ লাইনের নিচে রাখো।

- **Done-check:** `test -f dashboard/src/components/health/useHealthCommandCenter.js`

---

### Step 75.5 — Full Verification & Build Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 75.1, Step 75.2, Step 75.3, Step 75.4

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
./l quality
npm test
npm --prefix dashboard run build
```

- **Done-check:** exit code 0 for all validation commands
