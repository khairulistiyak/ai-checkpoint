# Phase 24: Full Project Audit Fixes

**Goal:** পুরো project audit করে 28টা bug ও issue fix করো
**Why:** PROGRESS.md corruption, checkpoint miss, progress bar loop bug — critical issues আছে
**Files:** 15+ files across CLI, Core, Dashboard
**Risk:** Medium
**Steps:** 28 (4 critical, 6 important, 15 quality, 3 enhancement)

## Story

1. আগে: 23 phase শেষ, project v1.0 release হয়েছে
2. সমস্যা: deep audit-এ 28টা bug পাওয়া গেছে — duplicate header, missing git add, infinite loop, symlink crash
3. Fix: critical 4টা আগে, তারপর important, তারপে quality fixes
4. পরে: zero known bugs, CLI ও dashboard rock-solid হবে

## Steps

---

### 🔴 CRITICAL

### 24.1 — Fix duplicate Overall Progress header
- **File:** `.agents/PROGRESS.md`
- **Do:** Remove duplicate "## 📊 Overall Progress" (line 22), replace with NEXT pointer
- **How:** Line 22 কে `## 👉 NEXT: None (Project Complete) ✅` দিয়ে replace করো
- **Check:** `grep -c "Overall Progress" .agents/PROGRESS.md` → 1

### 24.2 — Add git add before checkpoint commit
- **File:** `packages/cli/cmd-checkpoint.js`
- **Do:** Add `git add .` before `git commit` so new files are included
- **How:** Line 30 এ commit এর আগে `execFileSync('git', ['add', '.'], { stdio: 'inherit' })` add করো
- **Check:** `grep "git.*add" packages/cli/cmd-checkpoint.js` → found

### 24.3 — Fix progress bar update loop in complete
- **File:** `packages/cli/cmd-complete.js`
- **Do:** Add `break` after first progress bar match to prevent duplicate updates
- **How:** Line 44-47 loop-এ `foundOverall` flag add করো, bar update হলেই `break`
- **Check:** `grep "break" packages/cli/cmd-complete.js` → found in progress loop

### 24.4 — Fix progress bar update loop in block
- **File:** `packages/cli/cmd-block.js`
- **Do:** Same fix as 24.3 — add `break` after first progress bar match
- **How:** Line 32-35 loop-এ same `foundOverall` + `break` pattern
- **Check:** `grep "break" packages/cli/cmd-block.js` → found

---

### 🟡 IMPORTANT

### 24.5 — Fix hardcoded API port in frontend
- **File:** `dashboard/src/utils/api.js`
- **Do:** Make BASE_URL dynamic instead of hardcoded `localhost:20226`
- **How:** `window.location.port === '5173'` check করে dev/prod port আলাদা করো
- **Check:** `grep "location" dashboard/src/utils/api.js` → found

### 24.6 — Fix CORS config for production
- **File:** `dashboard/server.js`
- **Do:** Use dynamic CORS — permissive in dev, strict in prod
- **How:** `NODE_ENV === 'production' ? { origin: false } : { origin: true }` use করো
- **Check:** `grep "NODE_ENV" dashboard/server.js` → found

### 24.7 — Fix core parser edge case regexes
- **File:** `packages/core/parse-progress.js`
- **Do:** Fix progress bar regex to accept empty bars, fix phase heading regex
- **How:** `[█░]+` কে `[█░]*` করো (empty bar allow), phase regex-এ lazy match fix করো
- **Check:** `node -e "require('./packages/core/parse-progress.js').parseProgressText('')"` → no throw

### 24.8 — Fix progress bar inside code fence
- **File:** `packages/cli/cmd-complete.js`
- **Do:** Detect code fence (```) and update bar inside it correctly
- **How:** `` ``` `` line check করো, পরের line-এ bar update করো
- **Check:** Progress bar stays inside code fence after `./l c`

### 24.9 — Fix ledger.cjs npm global install path
- **File:** `scripts/ledger.cjs`
- **Do:** Add 3rd fallback path for npm global install, add error message if not found
- **How:** `path.resolve(__dirname, '..', 'lib', 'node_modules', ...)` try করো, না পেলে error দাও
- **Check:** `node scripts/ledger.cjs` → no "Cannot find" crash

### 24.10 — Fix symlink crash in findFileRecursively
- **File:** `packages/core/validate-project.js`
- **Do:** Use `lstatSync` instead of `statSync`, add depth limit, skip symlinks
- **How:** `depth > 10` guard, `lstatSync` use, `isSymbolicLink()` skip
- **Check:** No crash on broken symlink in project

---

### 🔵 CODE QUALITY

### 24.11 — Extract shared progress-update logic
- **File:** `packages/cli/progress-updater.js`
- **Do:** Create shared util for phase header, progress bar, NEXT pointer, log entry updates
- **How:** `cmd-complete.js` + `cmd-block.js` এর ~40 duplicate lines extract করো
- **Check:** `test -f packages/cli/progress-updater.js` → exists

### 24.12 — Use progress-updater in cmd-complete
- **File:** `packages/cli/cmd-complete.js`
- **Do:** Replace inline progress code with `updateProgressState()` call
- **How:** Import from `progress-updater.js`, inline code remove করো
- **Check:** `grep "progress-updater" packages/cli/cmd-complete.js` → found

### 24.13 — Use progress-updater in cmd-block
- **File:** `packages/cli/cmd-block.js`
- **Do:** Replace inline progress code with `updateProgressState()` call
- **How:** Same as 24.12
- **Check:** `grep "progress-updater" packages/cli/cmd-block.js` → found

### 24.14 — Fix ConfirmModal Enter key race
- **File:** `dashboard/src/components/ConfirmModal.jsx`
- **Do:** Add 200ms guard before Enter key is allowed after modal opens
- **How:** `useRef` দিয়ে `readyForEnter` flag, 200ms পরে `true` set করো
- **Check:** Rapid Enter press doesn't auto-confirm

### 24.15 — Add unsaved changes warning in ConfigEditor
- **File:** `dashboard/src/components/ConfigEditor.jsx`
- **Do:** Track dirty state, warn before closing with unsaved changes
- **How:** `isDirty` state add, `onClose` এ dirty হলে confirm dialog দেখাও
- **Check:** Edit → close → warning দেখায়

### 24.16 — Fix ExportButton exports too much data
- **File:** `dashboard/src/components/ExportButton.jsx`
- **Do:** Export only meaningful fields, not entire project object
- **How:** `{ name, path, progress, phases, exportedAt }` select করো
- **Check:** Export JSON size < 10KB

### 24.17 — Fix LogPanel animation lag with many logs
- **File:** `dashboard/src/components/LogPanel.jsx`
- **Do:** Limit to last 100 logs, remove stagger on old entries
- **How:** `logs.slice(-100)` use করো, শুধু last 5 তে stagger রাখো
- **Check:** 200+ logs smooth render হয়

### 24.18 — Hide drag grip during sidebar search
- **File:** `dashboard/src/components/SidebarItem.jsx`
- **Do:** Hide GripVertical icon when `isSearching` is true
- **How:** `{!isSearching && <div>...</div>}` wrap করো
- **Check:** Search করলে grip hide হয়

### 24.19 — Fix RULES.md template placeholders
- **File:** `templates/RULES.md`
- **Do:** Replace generic placeholders with `[FILL_IN]` markers
- **How:** `_TypeScript / JavaScript_` → `[YOUR_LANGUAGE]` replace করো
- **Check:** `grep "TypeScript / JavaScript" templates/RULES.md` → not found

### 24.20 — Add --json flag to doctor command
- **File:** `packages/cli/doctor.js`
- **Do:** Add JSON output for CI/CD usage
- **How:** `process.argv.includes('--json')` check, JSON.stringify output
- **Check:** `./l doctor --json` → valid JSON

### 24.21 — Replace polling with fs.watch in watch command
- **File:** `packages/cli/cmd-watch.js`
- **Do:** Use `fs.watch()` instead of `setInterval` polling
- **How:** `fs.watch(PROGRESS_PATH, callback)` use করো
- **Check:** `grep "fs.watch" packages/cli/cmd-watch.js` → found

### 24.22 — Clean macOS ._ metadata files in setup.sh
- **File:** `setup.sh`
- **Do:** Add cleanup step to remove `._*` files after copy
- **How:** `find ... -name '._*' -delete` add করো copy steps পরে
- **Check:** No `._` files in `.agents/packages/`

### 24.23 — Add main/exports to root package.json
- **File:** `package.json`
- **Do:** Add `main` and `exports` fields for programmatic usage
- **How:** `"main": "packages/core/parse-progress.js"` + exports map
- **Check:** `grep "main" package.json` → found

### 24.24 — Add step format validation in cmd-start
- **File:** `packages/cli/cmd-start.js`
- **Do:** Validate step number format (X.Y) before using in regex
- **How:** `/^\d+\.\d+$/.test(stepNum)` check add করো top-এ
- **Check:** `./l start "abc"` → clean error, no crash

### 24.25 — Fix useProjects double fetch in StrictMode
- **File:** `dashboard/src/hooks/useProjects.js`
- **Do:** Add ref guard to prevent double initial fetch
- **How:** `useRef(false)` দিয়ে `didMount` track করো
- **Check:** Network tab-এ 1টাই initial fetch

---

### 🟢 ENHANCEMENTS

### 24.26 — Add loading skeleton to ProjectGrid
- **File:** `dashboard/src/components/ProjectGrid.jsx`
- **Do:** Show skeleton placeholders while project data loads
- **How:** `loading` prop check, skeleton divs render
- **Check:** Project switch-এ skeleton দেখায়, blank flash নেই

### 24.27 — Add keyboard shortcuts to CommandPalette
- **File:** `dashboard/src/components/CommandPalette.jsx`
- **Do:** Add `?` shortcut to show keyboard help
- **How:** Static actions-এ "Keyboard Shortcuts" item add করো
- **Check:** `?` press করলে shortcuts list দেখায়

### 24.28 — Create project README.md
- **File:** `README.md`
- **Do:** Create proper README with install, usage, screenshots guide
- **How:** Installation + CLI usage + Dashboard + API sections লেখো
- **Check:** `test -f README.md` → exists
