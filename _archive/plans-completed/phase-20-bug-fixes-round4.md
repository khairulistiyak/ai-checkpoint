# Phase 20: Bug Fixes Round 4 — Comprehensive A-Z Audit

> 55+ source files audited. 29 bugs found. 15 atomic fix steps.

---

## Step 20.1 — Fix findStepInPlanFiles regex never matching
- **File:** `packages/cli/parse-progress.js`
- **Action:** MODIFY
- **Done-check:** `node -e "const r = new RegExp('^#{2,3}\\\\s+Step\\\\s+' + '2.3'.replace(/\\./g, '\\\\.') + '\\\\b'); console.log(r.test('## Step 2.3 — Test'))"` → `true`
- **Depends:** None

**Description:** Line 25 uses `stepNum.replace(/\\./g, '\\\\.')` which tries to match literal backslash-dot in stepNum. But stepNum is `"2.3"` (no backslash), so the replace never fires. The `.` stays unescaped, matching any character. Fix: `stepNum.replace(/\./g, '\\.')`

---

## Step 20.2 — Fix CommandPalette stale executeItem closure
- **File:** `dashboard/src/components/CommandPalette.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'useCallback' dashboard/src/components/CommandPalette.jsx` → ≥1
- **Depends:** None

**Description:** `executeItem` is called inside a `useEffect` keydown handler but isn't in the dependency array. Wrap `executeItem` in `useCallback` and add to deps to prevent stale closure bugs when Enter is pressed.

---

## Step 20.3 — Fix use-sidebar-reorder timer leak on unmount
- **File:** `dashboard/src/hooks/use-sidebar-reorder.js`
- **Action:** MODIFY
- **Done-check:** `grep -c 'clearTimeout' dashboard/src/hooks/use-sidebar-reorder.js` → ≥1
- **Depends:** None

**Description:** `reorderTimer.current` is never cleared on unmount. Add a `useEffect` cleanup that clears the pending timeout when the component unmounts.

---

## Step 20.4 — Fix ThemeProvider stripping body classes
- **File:** `dashboard/src/components/ThemeProvider.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'classList' dashboard/src/components/ThemeProvider.jsx` → ≥2
- **Depends:** None

**Description:** Current code does `document.body.className = document.body.className.replace(...)` which can strip static Tailwind classes from `<body>`. Use `classList.remove()` / `classList.add()` instead.

---

## Step 20.5 — Fix doRemoveProject missing error handling
- **File:** `dashboard/src/App.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'try' dashboard/src/App.jsx` → ≥3
- **Depends:** None

**Description:** `doRemoveProject` has no try/catch. If API fails, state still resets. Wrap in try/catch, show error toast, only reset state on success.

---

## Step 20.6 — Fix cmd-complete.js fragile progress bar regex
- **File:** `packages/cli/cmd-complete.js`
- **Action:** MODIFY
- **Done-check:** `grep -c '█░' packages/cli/cmd-complete.js` → ≥1
- **Depends:** None

**Description:** Line 46 uses `lines[i].startsWith('[')` which matches markdown links too. Use a specific regex `/^\[█░]+\]/.test(lines[i])` to only match progress bar lines.

---

## Step 20.7 — Fix checkpoint git log delimiter splitting
- **File:** `dashboard/src/server/checkpoints.js`
- **Action:** MODIFY
- **Done-check:** `grep -c 'split.*5' dashboard/src/server/checkpoints.js` → ≥1
- **Depends:** None

**Description:** `line.split('|')` breaks on commit messages containing `|`. Use `split('|', 5)` to limit splits to exactly the 5 expected fields.

---

## Step 20.8 — Fix Escape key closing all modals at once
- **File:** `dashboard/src/App.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'else if.*Escape' dashboard/src/App.jsx` → ≥1
- **Depends:** 20.5

**Description:** Escape handler closes AddModal, Settings, PlanModal, and ConfigEditor simultaneously. Add priority chain: close only the topmost open modal.

---

## Step 20.9 — Fix AddProjectModal path not resetting on reopen
- **File:** `dashboard/src/components/AddProjectModal.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'useEffect' dashboard/src/components/AddProjectModal.jsx` → ≥1
- **Depends:** None

**Description:** Path state persists between open/close cycles. Add `useEffect` to reset `path` to empty string when `isOpen` becomes true.

---

## Step 20.10 — Fix ConfirmModal keyboard support and LogPanel click blocking
- **File:** `dashboard/src/components/ConfirmModal.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'onKeyDown\|keydown' dashboard/src/components/ConfirmModal.jsx` → ≥1
- **Depends:** None

**Description:** ConfirmModal has no Enter/Escape keyboard support. Add keydown handler for Enter (confirm) and Escape (cancel). Also fix LogPanel z-index to not block bottom toasts.

---

## Step 20.11 — Fix StepItem hasPlanFiles strict equality check
- **File:** `dashboard/src/components/StepItem.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'hasPlanFiles === false' dashboard/src/components/StepItem.jsx` → 0
- **Depends:** None

**Description:** `hasPlanFiles === false` doesn't catch `undefined`. Change to `!hasPlanFiles` in both the disabled prop and title check.

---

## Step 20.12 — Fix frontend api.js not propagating server error messages
- **File:** `dashboard/src/utils/api.js`
- **Action:** MODIFY
- **Done-check:** `grep -c 'data.error' dashboard/src/utils/api.js` → ≥2
- **Depends:** None

**Description:** `addProject()` throws generic "Failed to add project" ignoring server's detailed error. Parse response JSON on error like `executeCommand` does.

---

## Step 20.13 — Fix ExportButton styling, unused vite import, dead Sidebar itemVariants
- **File:** `dashboard/src/components/ExportButton.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -c 'border-white' dashboard/src/components/ExportButton.jsx` → ≥1
- **Depends:** None

**Description:** Align ExportButton border to `border-white/[0.05]`. Remove unused `path` import from `vite.config.js`. Remove dead `itemVariants` from `Sidebar.jsx`.

---

## Step 20.14 — Fix Firefox scrollbar and settings.js fallback missing language
- **File:** `dashboard/src/index.css`
- **Action:** MODIFY
- **Done-check:** `grep -c 'scrollbar-width' dashboard/src/index.css` → ≥1
- **Depends:** None

**Description:** Add Firefox scrollbar support with `scrollbar-width: thin` and `scrollbar-color`. Fix settings.js error fallback to include `language: 'en'`.

---

## Step 20.15 — Remove dead phase table code from cmd-start.js and cmd-complete.js
- **File:** `packages/cli/cmd-start.js`
- **Action:** MODIFY
- **Done-check:** `grep -c '🔴 PENDING' packages/cli/cmd-start.js` → 0
- **Depends:** None

**Description:** Remove dead code that searches for `| Phase X |` table rows with `🔴 PENDING` — this format no longer exists in PROGRESS.md. Same cleanup in cmd-complete.js.
