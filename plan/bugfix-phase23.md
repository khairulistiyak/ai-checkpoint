# 🔧 ai-checkpoint Bug Fix Plan — Phase 23

> **এই plan যেকোনো ছোট মডেল 100% execute করতে পারবে।**
> প্রতিটা step-এ exact file path, exact line number, exact BEFORE/AFTER code আছে।
> শুধু copy-paste করো — কোনো thinking দরকার নেই।

---

## Rules

1. **একটা step = একটা file change**
2. প্রতিটা step-এ BEFORE code খুঁজে AFTER code দিয়ে replace করো
3. BEFORE code **হুবহু match** করতে হবে (whitespace সহ)
4. কোনো step skip করো না
5. কোনো extra code add করো না

---

## Step 23.1 — Fix cmd-start.js broken regex

- **File:** `packages/cli/cmd-start.js`
- **Line:** 26
- **Action:** MODIFY
- **Done-check:** `node -e "const r = new RegExp('^#{2,3}\\\\s+Step\\\\s+1\\\\.1\\\\b'); console.log(r.test('## Step 1.1 — Test'))"` → prints `true`
- **Depends:** None

**Description:** `new RegExp` string constructor তে double-escape ভুল আছে। `\\\\s` হলে literal `\s` হয় না। Fix করলে plan file থেকে step details ঠিকমতো parse হবে।

### BEFORE:
```js
    if (new RegExp('^#{2,3}\\\\s+Step\\\\s+' + stepNum.replace(/\\\\./g, '\\\\\\\\.') + '\\\\\\\\b').test(line)) { insideStep = true; continue; }
```

### AFTER:
```js
    if (new RegExp('^#{2,3}\\s+Step\\s+' + stepNum.replace(/\./g, '\\.') + '\\b').test(line)) { insideStep = true; continue; }
```

---

## Step 23.2 — Fix cmd-block.js progress bar regex

- **File:** `packages/cli/cmd-block.js`
- **Line:** 34
- **Action:** MODIFY
- **Done-check:** `node -e "console.log(/^\[[█░]+\]/.test('[████░░░░] 50%'))"` → prints `true`
- **Depends:** None

**Description:** Regex-এ `[` escape missing। `/^\[█░]+\]/` ভুল, `/^\[[█░]+\]/` সঠিক।

### BEFORE:
```js
    if (/^\[█░]+\]/.test(lines[i])) lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
```

### AFTER:
```js
    if (/^\[[█░]+\]/.test(lines[i])) lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
```

---

## Step 23.3 — Fix cmd-block.js add Details pointer update

- **File:** `packages/cli/cmd-block.js`
- **Line:** 40-42
- **Action:** MODIFY
- **Done-check:** `grep "Details" packages/cli/cmd-block.js` → shows the new line
- **Depends:** None

**Description:** `cmd-complete.js` তে NEXT আর Details দুইটাই update হয়। কিন্তু `cmd-block.js` তে শুধু NEXT update হয়। Details pointer add করো।

### BEFORE:
```js
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) lines[i] = `## 👉 NEXT: ${nextStr}`;
  }
```

### AFTER:
```js
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) lines[i] = `## 👉 NEXT: ${nextStr}`;
    if (foundNext && lines[i].startsWith('> 📋 Details →')) { const m = nextStr.match(/Step (\d+)\.(\d+)/); if (m) lines[i] = `> 📋 Details → \`plan/\` → Phase ${m[1]} → Step ${m[1]}.${m[2]}`; }
  }
```

---

## Step 23.4 — Fix cmd-complete.js fragile Overall Progress scan

- **File:** `packages/cli/cmd-complete.js`
- **Line:** 45
- **Action:** MODIFY
- **Done-check:** `grep "Overall Progress'" packages/cli/cmd-complete.js` → no colon after Progress
- **Depends:** None

**Description:** PROGRESS.md তে `## Overall Progress` আছে (colon ছাড়া)। Code-এ `includes('Overall Progress:')` colon সহ খোঁজে — match হয় না।

### BEFORE:
```js
    if (lines[i].includes('Overall Progress:')) lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
```

### AFTER:
```js
    if (lines[i].includes('Overall Progress')) lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
```

---

## Step 23.5 — Fix cmd-block.js fragile Overall Progress scan

- **File:** `packages/cli/cmd-block.js`
- **Line:** 33
- **Action:** MODIFY
- **Done-check:** `grep "Overall Progress'" packages/cli/cmd-block.js` → no colon after Progress
- **Depends:** None

**Description:** Same bug as Step 23.4 — cmd-block.js তেও colon সরাতে হবে।

### BEFORE:
```js
    if (lines[i].includes('Overall Progress:')) lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
```

### AFTER:
```js
    if (lines[i].includes('Overall Progress')) lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
```

---

## Step 23.6 — Fix cmd-watch.js add graceful exit

- **File:** `packages/cli/cmd-watch.js`
- **Line:** 9-22
- **Action:** MODIFY
- **Done-check:** `grep "SIGINT" packages/cli/cmd-watch.js` → shows the handler
- **Depends:** None

**Description:** `setInterval` কখনো clear হয় না। SIGINT handler add করলে Ctrl+C তে clean exit হবে।

### BEFORE:
```js
  let lastMtime = fs.statSync(PROGRESS_PATH).mtimeMs;
  
  setInterval(() => {
    try {
      const currentMtime = fs.statSync(PROGRESS_PATH).mtimeMs;
      if (currentMtime !== lastMtime) {
        lastMtime = currentMtime;
        console.clear();
        statusCommand();
      }
    } catch (e) {
      // ignore
    }
  }, 2000);
```

### AFTER:
```js
  let lastMtime = fs.statSync(PROGRESS_PATH).mtimeMs;
  
  const interval = setInterval(() => {
    try {
      const currentMtime = fs.statSync(PROGRESS_PATH).mtimeMs;
      if (currentMtime !== lastMtime) {
        lastMtime = currentMtime;
        console.clear();
        statusCommand();
      }
    } catch (e) {
      // ignore
    }
  }, 2000);

  process.on('SIGINT', () => { clearInterval(interval); process.exit(0); });
```

---

## Step 23.7 — Fix ExportButton.jsx timer memory leak

- **File:** `dashboard/src/components/ExportButton.jsx`
- **Line:** 1, 7, 28
- **Action:** MODIFY
- **Done-check:** `grep "timerRef" dashboard/src/components/ExportButton.jsx` → shows ref usage
- **Depends:** None

**Description:** Component unmount হলে `setTimeout` clear না হলে React warning আসে। 3টা জায়গায় change করতে হবে — সব এই একটা file-এ।

### CHANGE 1 — Line 1, fix import:

#### BEFORE:
```js
import React, { useState } from 'react';
```

#### AFTER:
```js
import React, { useState, useRef, useEffect } from 'react';
```

### CHANGE 2 — Line 7, add ref and cleanup:

#### BEFORE:
```js
  const { showToast } = useToast();

  const handleExport = () => {
```

#### AFTER:
```js
  const { showToast } = useToast();
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleExport = () => {
```

### CHANGE 3 — Line 28, use ref:

#### BEFORE:
```js
      setTimeout(() => setDownloading(false), 1000);
```

#### AFTER:
```js
      timerRef.current = setTimeout(() => setDownloading(false), 1000);
```

---

## Step 23.8 — Fix ConfirmModal.jsx Enter key safety

- **File:** `dashboard/src/components/ConfirmModal.jsx`
- **Line:** 10
- **Action:** MODIFY
- **Done-check:** `grep "preventDefault" dashboard/src/components/ConfirmModal.jsx` → shows the call
- **Depends:** None

**Description:** Enter key দিলে accidental confirm হতে পারে। `preventDefault` add করলে safe।

### BEFORE:
```js
      if (e.key === 'Enter') { e.stopPropagation(); onConfirm(); }
```

### AFTER:
```js
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onConfirm(); }
```

---

## Step 23.9 — Fix LogPanel.jsx time display

- **File:** `dashboard/src/components/LogPanel.jsx`
- **Line:** 72
- **Action:** MODIFY
- **Done-check:** `grep "includes" dashboard/src/components/LogPanel.jsx` → shows space check
- **Depends:** None

**Description:** `log.time` যদি space না থাকে, `split(' ')[1]` undefined হয়। আগে check করলে safe।

### BEFORE:
```js
                      {log.time ? `[${log.time.split(' ')[1] || log.time}]` : '>'}
```

### AFTER:
```js
                      {log.time ? `[${(log.time.includes(' ') ? log.time.split(' ')[1] : log.time)}]` : '>'}
```

---

## Step 23.10 — Fix server.js API 404 handler

- **File:** `dashboard/server.js`
- **Line:** 19 (app.use('/api') এর পরে)
- **Action:** MODIFY
- **Done-check:** `grep "API endpoint not found" dashboard/server.js` → shows the handler
- **Depends:** None

**Description:** API route miss হলে HTML page serve হয়। API 404 handler add করলে JSON error আসবে।

### BEFORE:
```js
app.use('/api', apiRouter);

// Serve static React files in production
```

### AFTER:
```js
app.use('/api', apiRouter);

// API 404 — unknown API paths return JSON, not HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static React files in production
```

---

## Step 23.11 — Fix server.js CORS restriction

- **File:** `dashboard/server.js`
- **Line:** 14
- **Action:** MODIFY
- **Done-check:** `grep "localhost" dashboard/server.js` → shows CORS origins
- **Depends:** None

**Description:** Open CORS যেকোনো website-কে API access দেয়। Localhost restrict করলে safe।

### BEFORE:
```js
app.use(cors());
```

### AFTER:
```js
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:20226', 'http://127.0.0.1:5173', 'http://127.0.0.1:20226'] }));
```

---

## Step 23.12 — Fix config.js type validation

- **File:** `dashboard/src/server/config.js`
- **Line:** 29-30
- **Action:** MODIFY
- **Done-check:** `grep "typeof" dashboard/src/server/config.js` → shows type checks
- **Depends:** None

**Description:** `rules` যদি string না হয়, `.length` undefined — check bypass হয়।

### BEFORE:
```js
  if (rules !== undefined && rules.length > MAX_SIZE) return res.status(400).json({ error: 'Rules content too large (max 50KB)' });
  if (agents !== undefined && agents.length > MAX_SIZE) return res.status(400).json({ error: 'Agents content too large (max 50KB)' });
```

### AFTER:
```js
  if (rules !== undefined && (typeof rules !== 'string' || rules.length > MAX_SIZE)) return res.status(400).json({ error: 'Rules must be a string under 50KB' });
  if (agents !== undefined && (typeof agents !== 'string' || agents.length > MAX_SIZE)) return res.status(400).json({ error: 'Agents must be a string under 50KB' });
```

---

## Step 23.13 — Fix projects.js health check add CLI check

- **File:** `dashboard/src/server/projects.js`
- **Line:** 102-108
- **Action:** MODIFY
- **Done-check:** `grep "ledger" dashboard/src/server/projects.js` → shows CLI check
- **Depends:** None

**Description:** Health check-এ CLI script check নেই। Add করলে missing CLI ধরা পড়বে।

### BEFORE:
```js
    const checks = [
      { name: '.agents directory', passed: fs.existsSync(path.join(cwd, '.agents')) },
      { name: 'PROGRESS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'PROGRESS.md')) },
      { name: 'RULES.md', passed: fs.existsSync(path.join(cwd, '.agents', 'RULES.md')) },
      { name: 'AGENTS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'AGENTS.md')) },
      { name: 'plan directory', passed: fs.existsSync(path.join(cwd, 'plan')) },
      { name: 'git repository', passed: fs.existsSync(path.join(cwd, '.git')) }
    ];
```

### AFTER:
```js
    const checks = [
      { name: '.agents directory', passed: fs.existsSync(path.join(cwd, '.agents')) },
      { name: 'PROGRESS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'PROGRESS.md')) },
      { name: 'RULES.md', passed: fs.existsSync(path.join(cwd, '.agents', 'RULES.md')) },
      { name: 'AGENTS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'AGENTS.md')) },
      { name: 'CLI scripts', passed: fs.existsSync(path.join(cwd, '.agents', 'scripts', 'ledger.cjs')) },
      { name: 'plan directory', passed: fs.existsSync(path.join(cwd, 'plan')) },
      { name: 'git repository', passed: fs.existsSync(path.join(cwd, '.git')) }
    ];
```

---

## Step 23.14 — Fix setup.sh filter macOS ._ files

- **File:** `setup.sh`
- **Line:** 51-52
- **Action:** MODIFY
- **Done-check:** `grep "find" setup.sh` → shows find command
- **Depends:** None

**Description:** `cp -r` macOS `._*` file ও copy করে। `find` দিয়ে filter করলে clean।

### BEFORE:
```bash
cp -r "$SCRIPT_DIR/packages/cli/"* "$PROJECT_DIR/.agents/packages/cli/"
cp -r "$SCRIPT_DIR/packages/core/"* "$PROJECT_DIR/.agents/packages/core/"
```

### AFTER:
```bash
find "$SCRIPT_DIR/packages/cli" -maxdepth 1 -name '*.js' -not -name '._*' -exec cp {} "$PROJECT_DIR/.agents/packages/cli/" \;
find "$SCRIPT_DIR/packages/core" -maxdepth 1 -name '*.js' -not -name '._*' -exec cp {} "$PROJECT_DIR/.agents/packages/core/" \;
```

---

## Step 23.15 — Fix SidebarItem.jsx grip click prevention

- **File:** `dashboard/src/components/SidebarItem.jsx`
- **Line:** 35
- **Action:** MODIFY
- **Done-check:** `grep "onClick.*stopPropagation" dashboard/src/components/SidebarItem.jsx` → shows click handler
- **Depends:** None

**Description:** Grip icon click করলে project re-select হয়। `onClick` stop add করলে fix।

### BEFORE:
```jsx
          <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 sm:-ml-1.5 rounded shrink-0" onPointerDown={(e) => e.stopPropagation()}>
```

### AFTER:
```jsx
          <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 sm:-ml-1.5 rounded shrink-0" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
```

---

## ✅ Summary

| Group | Files | Steps | Description |
|-------|-------|-------|-------------|
| CLI Core | 4 files | 23.1-23.6 | Regex fixes, progress bar, watch exit |
| Frontend | 4 files | 23.7-23.9, 23.15 | Memory leak, keyboard, display |
| Server | 3 files | 23.10-23.13 | CORS, 404, validation, health |
| Setup | 1 file | 23.14 | macOS file filter |

**Total: 16 steps, 12 files**

---

## Step 23.16 — Update PROGRESS.md with Phase 23

- **File:** `.agents/PROGRESS.md`
- **Line:** -
- **Action:** MODIFY
- **Depends:** None

**Description:** Add Phase 23 to PROGRESS.md (Already done manually).

---

## Verify After All Steps Done

```bash
# 1. CLI loads
node packages/cli/index.js --help

# 2. Dashboard builds
cd dashboard && npm run build

# 3. Regex test
node -e "const r = new RegExp('^#{2,3}\\\\s+Step\\\\s+1\\\\.1\\\\b'); console.log('regex works:', r.test('## Step 1.1 — Test'))"
```
