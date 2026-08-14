# Phase 73: Electron Native Folder Picker & Cross-Platform Browse

> Electron ডেস্কটপ অ্যাপ্লিকেশনে "Track Workspace / Add Project" মডালে নেটিভ ফোল্ডার সিলেক্টর ডায়ালগ (`dialog.showOpenDialog`) ইমপ্লিমেন্ট করা এবং ব্রাউজারে ফলব্যাক ব্রাউজ ডায়ালগ নিশ্চিত করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 73: Electron Native Folder Picker & Cross-Platform Browse

### Step 73.1 — Add Native Directory Picker IPC in Electron (`electron/main.js`)
- **File:** `electron/main.js`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
`electron/main.js` ফাইলে `const { ..., dialog } = require('electron')` এবং `ipcMain.handle('dialog:open-directory', ...)` যুক্ত করো যা `dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] })` কল করবে।

- **Done-check:** `test -f electron/main.js && node -c electron/main.js`

---

### Step 73.2 — Expose Folder Picker in Preload Bridge (`electron/preload.js`)
- **File:** `electron/preload.js`
- **Action:** MODIFY
- **Depends:** Step 73.1

**কী করতে হবে:**
`electron/preload.js` ফাইলে `electronAPI` অবজেক্টের ভেতর `selectFolder: () => ipcRenderer.invoke('dialog:open-directory')` এক্সপোজ করো।

- **Done-check:** `test -f electron/preload.js && node -c electron/preload.js`

---

### Step 73.3 — Connect Native Picker & Fallback in AddProjectModal (`dashboard/src/components/AddProjectModal.jsx`)
- **File:** `dashboard/src/components/AddProjectModal.jsx`
- **Action:** MODIFY
- **Depends:** Step 73.2

**কী করতে হবে:**
`dashboard/src/components/AddProjectModal.jsx`-এ `handleBrowse` ফাংশনে প্রথমে `window.electronAPI?.selectFolder()` চেক করো। যদি থাকে তবে নেটিভ ডায়ালগ থেকে পাথ নাও, অন্যথায় `/api/browse-directory` ফলব্যাক ব্যবহার করো।

- **Done-check:** `test -f dashboard/src/components/AddProjectModal.jsx`

---

### Step 73.4 — Linux Multi-Tool Dialog Fallback (`dashboard/src/server/api.js`)
- **File:** `dashboard/src/server/api.js`
- **Action:** MODIFY
- **Depends:** Step 73.3

**কী করতে হবে:**
`dashboard/src/server/api.js` ফাইলে `/browse-directory` এন্ডপয়েন্টে লিনাক্স প্ল্যাটফর্মের জন্য `zenity`, `kdialog`, `yad`, অথবা `python3 -c "import tkinter.filedialog...` এর শক্তিশালী ফলব্যাক চেইন যুক্ত করো।

- **Done-check:** `test -f dashboard/src/server/api.js`

---

### Step 73.5 — Full Verification & Build Suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 73.1, Step 73.2, Step 73.3, Step 73.4

**কী করতে হবে:**
```bash
find . -name "._*" -delete 2>/dev/null || true
./l v
./l health
./l quality
npm test
```

- **Done-check:** exit code 0 for all validation commands
