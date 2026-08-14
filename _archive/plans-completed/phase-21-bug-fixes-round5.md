# Phase 21 — Bug Fixes Round 5

> 11 bugs. Each step = 1 file. Copy-paste ready. Any AI model can do this.

---

## Step 21.1 — Fix CommandPalette `executeItem` TDZ crash

- **File:** `dashboard/src/components/CommandPalette.jsx`
- **Action:** MODIFY
- **Done-check:** `grep -n "const executeItem" dashboard/src/components/CommandPalette.jsx | head -1` → line number is BEFORE first `useEffect`
- **Depends:** None

### What is wrong

`const executeItem` is defined at line 56 but used at line 45 inside a `useEffect` dependency array. JavaScript `const` has a "Temporal Dead Zone" — you cannot use a variable before the line where it is declared. This CRASHES the app when you press ⌘K.

### How to fix

**Step A:** CUT these lines (lines 56-63):

```js
  const executeItem = useCallback((item) => {
    if (item.type === 'project') {
      onSelectProject(item.id);
    } else if (item.type === 'action') {
      item.action();
    }
    onClose();
  }, [onSelectProject, onClose]);
```

**Step B:** PASTE them BEFORE the `useEffect` that starts with `// Handle keyboard navigation` (line 21-22). The final order must be:

```
1. useState, useRef, useMemo hooks
2. const executeItem = useCallback(...)   ← MOVED HERE
3. useEffect for keyboard navigation
4. useEffect for reset state
```

No other changes needed. Do not change the code inside `executeItem`.

---

## Step 21.2 — Fix `cmd-new-plan.js` fallback overwrites existing file

- **File:** `packages/cli/cmd-new-plan.js`
- **Action:** MODIFY
- **Done-check:** `grep -c "existsSync(targetPath)" packages/cli/cmd-new-plan.js` → returns `2` (two checks)
- **Depends:** None

### What is wrong

When the template file is NOT found, the code creates the plan file without checking if it already exists. This can silently overwrite an existing plan.

### How to fix

Find this code block (around line 22-28):

```js
  if (!templatePath) {
    // Fallback: create a minimal template inline
    fs.mkdirSync(PLAN_DIR, { recursive: true });
```

Change it to:

```js
  if (!templatePath) {
    // Fallback: create a minimal template inline
    if (fs.existsSync(targetPath)) {
      log.error(`plan/${name}.md already exists`);
      process.exit(1);
    }
    fs.mkdirSync(PLAN_DIR, { recursive: true });
```

That's it. Add 4 lines after `if (!templatePath) {`. Nothing else changes.

---

## Step 21.3 — Fix checkpoints.js delimiter truncation

- **File:** `dashboard/src/server/checkpoints.js`
- **Action:** MODIFY
- **Done-check:** `grep "SEP" dashboard/src/server/checkpoints.js` → returns a match
- **Depends:** None

### What is wrong

The git log command uses `|` as field separator. If a commit message contains `|`, the `split('|', 5)` call drops everything after the 5th pipe. Example: message `"fix: a|b"` becomes just `"fix: a"`.

### How to fix

**Find this line (around line 14):**

```js
      out = runCommand('git', ['log', '--pretty=format:%h|%D|%s|%ar|%an'], project.path);
```

**Replace with:**

```js
      out = runCommand('git', ['log', '--pretty=format:%h<SEP>%D<SEP>%s<SEP>%ar<SEP>%an'], project.path);
```

**Find this line (around line 22):**

```js
        const [hash, refs, message, timeAgo, author] = line.trim().split('|', 5);
```

**Replace with:**

```js
        const [hash, refs, message, timeAgo, author] = line.trim().split('<SEP>', 5);
```

Two replacements total. `|` → `<SEP>` in the format string and in the split call.

---

## Step 21.4 — Fix `cmd-block.js` missing overall progress bar update

- **File:** `packages/cli/cmd-block.js`
- **Action:** MODIFY
- **Done-check:** `grep "Overall Progress" packages/cli/cmd-block.js` → returns a match
- **Depends:** None

### What is wrong

When a step is blocked, the phase header gets updated but the overall progress bar and percentage do NOT get updated. Compare with `cmd-complete.js` which does update them.

### How to fix

Find this block (around lines 27-32):

```js
  // Update NEXT pointer
  let nextStr = "None (Project Complete) ✅", foundNext = false;
```

ADD this code BEFORE that line:

```js
  // Update overall progress bar
  let totalS = 0, doneS = 0;
  phases.forEach(p => { totalS += p.steps.length; doneS += p.steps.filter(s => s.status === 'done').length; });
  const oPct = Math.round((doneS / totalS) * 100);
  const bar = "█".repeat(Math.round((oPct / 100) * 20)) + "░".repeat(20 - Math.round((oPct / 100) * 20));
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Overall Progress:')) lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
    if (/^\[█░]+\]/.test(lines[i])) lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
  }

```

Insert these 8 lines. Nothing else changes.

---

## Step 21.5 — Fix `cmd-start.js` loose stepNum matching

- **File:** `packages/cli/cmd-start.js`
- **Action:** MODIFY
- **Done-check:** `grep "includes(stepNum)" packages/cli/cmd-start.js` → returns NO matches (0 results)
- **Depends:** None

### What is wrong

Line 26 uses `line.includes(stepNum)` to find the step heading in plan files. Searching for step "2.3" also matches "12.3" or "22.3". This is a false positive match.

### How to fix

**Find this line (line 26):**

```js
    if (/^#{2,3}\s+Step\s+/.test(line) && line.includes(stepNum)) { insideStep = true; continue; }
```

**Replace with:**

```js
    if (/^#{2,3}\s+Step\s+/.test(line) && new RegExp('\\b' + stepNum.replace(/\./g, '\\.') + '\\b').test(line)) { insideStep = true; continue; }
```

One line changed. `line.includes(stepNum)` → regex with `\b` word boundary.

---

## Step 21.6 — Fix NEXT pointer including blocked steps in cmd-complete.js

- **File:** `packages/cli/cmd-complete.js`
- **Action:** MODIFY
- **Done-check:** `grep "blocked" packages/cli/cmd-complete.js` → returns a match
- **Depends:** None

### What is wrong

Line 52 finds the next step using `st.status !== 'done'`. This means a BLOCKED step could be suggested as the next step to work on. Blocked steps should be skipped.

### How to fix

**Find this line (line 52):**

```js
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done'); if (s) { nextStr = `Step ${s.number} — ${s.title}`; foundNext = true; break; } }
```

**Replace with:**

```js
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStr = `Step ${s.number} — ${s.title}`; foundNext = true; break; } }
```

One change: add `&& st.status !== 'blocked'` inside the `.find()`.

---

## Step 21.7 — Fix NEXT pointer in cmd-status.js also skipping blocked

- **File:** `packages/cli/cmd-status.js`
- **Action:** MODIFY
- **Done-check:** `grep "blocked" packages/cli/cmd-status.js` → returns matches
- **Depends:** 21.6

### What is wrong

Same bug as 21.6 but in two places in `cmd-status.js`:
- Line 12 (inside `--json` branch)
- Line 48 (display mode)

Both use `st.status !== 'done'` without excluding blocked steps.

### How to fix

**Find line 12:**

```js
    let nextStep = null;
    for (const p of phases) { const s = p.steps.find(st => st.status !== 'done'); if (s) { nextStep = s; break; } }
```

**Replace with:**

```js
    let nextStep = null;
    for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStep = s; break; } }
```

**Find line 48:**

```js
  let nextStep = null;
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done'); if (s) { nextStep = s; break; } }
```

**Replace with:**

```js
  let nextStep = null;
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStep = s; break; } }
```

Two changes. Both are the same: add `&& st.status !== 'blocked'`.

---

## Step 21.8 — Fix ConfirmModal Enter key event propagation

- **File:** `dashboard/src/components/ConfirmModal.jsx`
- **Action:** MODIFY
- **Done-check:** `grep "preventDefault" dashboard/src/components/ConfirmModal.jsx` → returns matches
- **Depends:** None

### What is wrong

The keyboard handler at lines 9-10 calls `onCancel()` and `onConfirm()` without stopping the event from reaching other listeners. Enter key could trigger dangerous confirms unintentionally.

### How to fix

**Find these lines (lines 9-10):**

```js
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
```

**Replace with:**

```js
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onCancel(); }
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onConfirm(); }
```

Two lines changed. Add `e.preventDefault()` and `e.stopPropagation()` before each callback.

---

## Step 21.9 — Fix ToastProvider setTimeout memory leak

- **File:** `dashboard/src/components/ToastProvider.jsx`
- **Action:** MODIFY
- **Done-check:** `grep "timerMap\|clearTimeout" dashboard/src/components/ToastProvider.jsx` → returns matches
- **Depends:** None

### What is wrong

The `setTimeout` at line 14 for auto-dismissing toasts is never cleaned up. If the component unmounts, the timer fires and tries to set state on an unmounted component.

### How to fix

**Find this line (line 1):**

```js
import React, { createContext, useContext, useState, useCallback } from 'react';
```

**Replace with:**

```js
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
```

**Find this block (lines 8-17):**

```js
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);
```

**Replace with:**

```js
  const [toasts, setToasts] = useState([]);
  const timerMap = useRef(new Map());

  useEffect(() => {
    return () => {
      timerMap.current.forEach(t => clearTimeout(t));
      timerMap.current.clear();
    };
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timerMap.current.delete(id);
    }, 3000);
    timerMap.current.set(id, timer);
  }, []);
```

Also update `removeToast` to clear the timer:

**Find (line 19-21):**

```js
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
```

**Replace with:**

```js
  const removeToast = (id) => {
    const timer = timerMap.current.get(id);
    if (timer) { clearTimeout(timer); timerMap.current.delete(id); }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
```

---

## Step 21.10 — Clean unused imports and blank lines in Sidebar.jsx

- **File:** `dashboard/src/components/Sidebar.jsx`
- **Action:** MODIFY
- **Done-check:** `grep "Activity\|GripVertical" dashboard/src/components/Sidebar.jsx` → returns NO matches
- **Depends:** None

### What is wrong

Line 2 imports `Activity` and `GripVertical` from lucide-react. Neither is used in this file. `GripVertical` is used in `SidebarItem.jsx`, not here. Also extra blank lines at lines 15-16.

### How to fix

**Find line 2:**

```js
import { LayoutDashboard, Plus, Activity, GripVertical } from 'lucide-react';
```

**Replace with:**

```js
import { LayoutDashboard, Plus } from 'lucide-react';
```

**Delete the extra blank lines at lines 15-16** (between `};` and `export default`). There should be exactly 1 blank line, not 3.

---

## Step 21.11 — Fix projects.js safeMessage stripping legitimate characters

- **File:** `dashboard/src/server/projects.js`
- **Action:** MODIFY
- **Done-check:** `grep "safeMessage" dashboard/src/server/projects.js` shows only control character stripping
- **Depends:** None

### What is wrong

Line 126 does `(message || 'Completed via Dashboard').replace(/["\`$\\]/g, '')`. This strips double quotes and backslashes from user messages. But since `runCommand` uses `execFileSync` with `shell: false`, there is NO shell injection risk. Legitimate text like `Fixed "loading" state` becomes `Fixed loading state`.

### How to fix

**Find line 126:**

```js
    const safeMessage = (message || 'Completed via Dashboard').replace(/["`$\\]/g, '');
```

**Replace with:**

```js
    const safeMessage = (message || 'Completed via Dashboard').replace(/[\x00-\x1f]/g, '').slice(0, 200);
```

This strips only control characters (null bytes, newlines, tabs) and limits length to 200 chars. Quotes and backslashes are safe because `execFileSync` does not use a shell.
